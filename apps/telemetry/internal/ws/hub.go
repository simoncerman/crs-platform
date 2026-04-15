package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"

	mqttpkg "github.com/czech-rocket-society/telemetry/internal/mqtt"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 4096,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development
	},
	EnableCompression: true,
}

// Client represents a connected WebSocket client.
type Client struct {
	conn      *websocket.Conn
	sessionID string
	send      chan []byte
}

// Hub manages WebSocket clients and broadcasts telemetry messages.
type Hub struct {
	clients    map[*Client]bool
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex

	// Micro-batching: buffer messages per session, flush every 16ms
	batchMu  sync.Mutex
	batches  map[string][]json.RawMessage
	batchTicker *time.Ticker
}

// NewHub creates a new WebSocket hub.
func NewHub() *Hub {
	h := &Hub{
		clients:    make(map[*Client]bool),
		register:   make(chan *Client, 64),
		unregister: make(chan *Client, 64),
		batches:    make(map[string][]json.RawMessage),
	}
	return h
}

// Run starts the hub's main loop.
func (h *Hub) Run() {
	h.batchTicker = time.NewTicker(16 * time.Millisecond)
	defer h.batchTicker.Stop()

	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[WS] Client connected (session: %s), total: %d", client.sessionID, len(h.clients))

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
			h.mu.Unlock()
			log.Printf("[WS] Client disconnected, total: %d", len(h.clients))

		case <-h.batchTicker.C:
			h.flushBatches()
		}
	}
}

// Broadcast queues a telemetry message for batch sending.
func (h *Hub) Broadcast(msg mqttpkg.TelemetryMessage) {
	data, err := json.Marshal(msg)
	if err != nil {
		return
	}

	h.batchMu.Lock()
	h.batches[msg.SessionID] = append(h.batches[msg.SessionID], data)
	h.batchMu.Unlock()
}

func (h *Hub) flushBatches() {
	h.batchMu.Lock()
	batches := h.batches
	h.batches = make(map[string][]json.RawMessage)
	h.batchMu.Unlock()

	if len(batches) == 0 {
		return
	}

	h.mu.RLock()
	defer h.mu.RUnlock()

	for sessionID, messages := range batches {
		if len(messages) == 0 {
			continue
		}

		// Wrap batch in array
		batchData, err := json.Marshal(messages)
		if err != nil {
			continue
		}

		for client := range h.clients {
			if client.sessionID != sessionID {
				continue
			}
			select {
			case client.send <- batchData:
			default:
				// Client too slow, drop messages (backpressure)
			}
		}
	}
}

// HandleWebSocket is the HTTP handler for WebSocket upgrade.
func (h *Hub) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	sessionID := r.URL.Query().Get("session_id")
	if sessionID == "" {
		http.Error(w, "session_id required", http.StatusBadRequest)
		return
	}

	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Upgrade error: %v", err)
		return
	}

	client := &Client{
		conn:      conn,
		sessionID: sessionID,
		send:      make(chan []byte, 256),
	}

	h.register <- client

	go h.writePump(client)
	go h.readPump(client)
}

func (h *Hub) writePump(c *Client) {
	pingTicker := time.NewTicker(30 * time.Second)
	defer func() {
		pingTicker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.conn.WriteMessage(websocket.BinaryMessage, message); err != nil {
				return
			}

		case <-pingTicker.C:
			c.conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (h *Hub) readPump(c *Client) {
	defer func() {
		h.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(512)
	c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		if _, _, err := c.conn.ReadMessage(); err != nil {
			break
		}
	}
}
