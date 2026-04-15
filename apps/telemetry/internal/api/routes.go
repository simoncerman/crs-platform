package api

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"github.com/czech-rocket-society/telemetry/internal/config"
	"github.com/czech-rocket-society/telemetry/internal/influx"
	"github.com/czech-rocket-society/telemetry/internal/ws"
)

// NewRouter creates the HTTP router with all API routes.
func NewRouter(hub *ws.Hub, writer *influx.Writer, cfg *config.Config) http.Handler {
	r := chi.NewRouter()

	origins := strings.Split(cfg.CORSOrigins, ",")
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
	}

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   origins,
		AllowedMethods:   []string{"GET", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: true,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// WebSocket endpoint
	r.Get("/ws/telemetry", hub.HandleWebSocket)

	// API routes
	r.Route("/api", func(r chi.Router) {
		r.Get("/sessions", sessionsHandler(writer))
		r.Get("/sessions/{sessionID}/devices", devicesHandler(writer))
		r.Delete("/sessions/{sessionID}", deleteSessionHandler(writer))
		r.Get("/history", historyHandler(writer))
		r.Get("/history/export", exportHandler(writer))
	})

	return r
}

func sessionsHandler(w *influx.Writer) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		sessions, err := w.QuerySessions(r.Context())
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if sessions == nil {
			sessions = []string{}
		}
		rw.Header().Set("Content-Type", "application/json")
		json.NewEncoder(rw).Encode(map[string]interface{}{
			"sessions": sessions,
		})
	}
}

func devicesHandler(w *influx.Writer) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "sessionID")
		devices, err := w.QueryDevices(r.Context(), sessionID)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if devices == nil {
			devices = []map[string]string{}
		}
		rw.Header().Set("Content-Type", "application/json")
		json.NewEncoder(rw).Encode(map[string]interface{}{
			"devices": devices,
		})
	}
}

func deleteSessionHandler(w *influx.Writer) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		sessionID := chi.URLParam(r, "sessionID")
		if sessionID == "" {
			http.Error(rw, "sessionID required", http.StatusBadRequest)
			return
		}
		if err := w.DeleteSession(r.Context(), sessionID); err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		rw.Header().Set("Content-Type", "application/json")
		json.NewEncoder(rw).Encode(map[string]interface{}{
			"deleted": sessionID,
		})
	}
}

func historyHandler(w *influx.Writer) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		sessionID := r.URL.Query().Get("session_id")
		if sessionID == "" {
			http.Error(rw, "session_id required", http.StatusBadRequest)
			return
		}
		deviceID := r.URL.Query().Get("device_id")
		from := r.URL.Query().Get("from")
		to := r.URL.Query().Get("to")
		resolution := r.URL.Query().Get("resolution")

		data, err := w.QueryHistory(r.Context(), sessionID, deviceID, from, to, resolution)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if data == nil {
			data = []map[string]interface{}{}
		}
		rw.Header().Set("Content-Type", "application/json")
		json.NewEncoder(rw).Encode(map[string]interface{}{
			"data": data,
		})
	}
}

func exportHandler(w *influx.Writer) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		sessionID := r.URL.Query().Get("session_id")
		if sessionID == "" {
			http.Error(rw, "session_id required", http.StatusBadRequest)
			return
		}
		format := r.URL.Query().Get("format")
		if format == "" {
			format = "json"
		}

		data, err := w.QueryHistory(r.Context(), sessionID, "", "", "", "")
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		if data == nil {
			data = []map[string]interface{}{}
		}

		switch format {
		case "csv":
			rw.Header().Set("Content-Type", "text/csv")
			rw.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.csv", sessionID))
			csvWriter := csv.NewWriter(rw)
			headers := []string{"time", "field", "value", "session_id", "device_type", "device_id", "data_type"}
			csvWriter.Write(headers)
			for _, row := range data {
				record := make([]string, len(headers))
				for i, h := range headers {
					record[i] = fmt.Sprintf("%v", row[h])
				}
				csvWriter.Write(record)
			}
			csvWriter.Flush()

		default:
			rw.Header().Set("Content-Type", "application/json")
			rw.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%s.json", sessionID))
			json.NewEncoder(rw).Encode(map[string]interface{}{
				"session_id": sessionID,
				"data":       data,
			})
		}
	}
}
