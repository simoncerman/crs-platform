package mqtt

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
	"sync"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

// TelemetryMessage represents a parsed MQTT telemetry message.
type TelemetryMessage struct {
	SessionID  string                 `json:"session_id"`
	DeviceType string                 `json:"device_type"`
	DeviceID   string                 `json:"device_id"`
	DataType   string                 `json:"data_type"`
	Payload    map[string]interface{} `json:"payload"`
	ReceivedAt time.Time              `json:"received_at"`
}

// MessageHandler is called for each parsed telemetry message.
type MessageHandler func(msg TelemetryMessage)

// Subscriber manages MQTT connections and message routing.
type Subscriber struct {
	client   mqtt.Client
	handlers []MessageHandler
	mu       sync.RWMutex
}

// NewSubscriber creates a new MQTT subscriber.
func NewSubscriber(broker string) *Subscriber {
	s := &Subscriber{}

	opts := mqtt.NewClientOptions().
		AddBroker(fmt.Sprintf("tcp://%s", broker)).
		SetClientID(fmt.Sprintf("crs-telemetry-%d", time.Now().UnixNano())).
		SetAutoReconnect(true).
		SetConnectRetry(true).
		SetConnectRetryInterval(2 * time.Second).
		SetOnConnectHandler(func(c mqtt.Client) {
			log.Println("[MQTT] Connected to broker")
			s.subscribe(c)
		}).
		SetConnectionLostHandler(func(c mqtt.Client, err error) {
			log.Printf("[MQTT] Connection lost: %v", err)
		})

	s.client = mqtt.NewClient(opts)
	return s
}

// OnMessage registers a handler for parsed telemetry messages.
func (s *Subscriber) OnMessage(h MessageHandler) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.handlers = append(s.handlers, h)
}

// Connect establishes the MQTT connection.
func (s *Subscriber) Connect() error {
	token := s.client.Connect()
	token.Wait()
	return token.Error()
}

// Close disconnects from the broker.
func (s *Subscriber) Close() {
	s.client.Disconnect(1000)
}

func (s *Subscriber) subscribe(c mqtt.Client) {
	topics := map[string]byte{
		"+/rocket/+/telemetry/#":     1,
		"+/test-stand/+/telemetry/#": 1,
	}

	token := c.SubscribeMultiple(topics, s.handleMessage)
	token.Wait()
	if token.Error() != nil {
		log.Printf("[MQTT] Subscribe error: %v", token.Error())
		return
	}
	log.Println("[MQTT] Subscribed to telemetry topics")
}

func (s *Subscriber) handleMessage(c mqtt.Client, m mqtt.Message) {
	msg, err := parseTopic(m.Topic())
	if err != nil {
		log.Printf("[MQTT] Invalid topic %s: %v", m.Topic(), err)
		return
	}

	var payload map[string]interface{}
	if err := json.Unmarshal(m.Payload(), &payload); err != nil {
		log.Printf("[MQTT] Invalid JSON on %s: %v", m.Topic(), err)
		return
	}

	msg.Payload = payload
	msg.ReceivedAt = time.Now()

	s.mu.RLock()
	handlers := s.handlers
	s.mu.RUnlock()

	for _, h := range handlers {
		h(msg)
	}
}

// parseTopic extracts session, device type, device ID, and data type from topic.
// Format: {session_id}/{device_type}/{device_id}/telemetry/{data_type}
func parseTopic(topic string) (TelemetryMessage, error) {
	parts := strings.Split(topic, "/")
	if len(parts) < 5 || parts[3] != "telemetry" {
		return TelemetryMessage{}, fmt.Errorf("unexpected topic format: %s", topic)
	}

	return TelemetryMessage{
		SessionID:  parts[0],
		DeviceType: parts[1],
		DeviceID:   parts[2],
		DataType:   strings.Join(parts[4:], "/"),
	}, nil
}
