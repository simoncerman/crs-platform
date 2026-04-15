package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/czech-rocket-society/telemetry/internal/api"
	"github.com/czech-rocket-society/telemetry/internal/config"
	"github.com/czech-rocket-society/telemetry/internal/influx"
	mqttpkg "github.com/czech-rocket-society/telemetry/internal/mqtt"
	"github.com/czech-rocket-society/telemetry/internal/ws"
)

func main() {
	cfg := config.Load()

	log.Println("=== CRS Telemetry Server ===")
	log.Printf("MQTT Broker: %s", cfg.MQTTBroker)
	log.Printf("InfluxDB: %s (org: %s, bucket: %s)", cfg.InfluxURL, cfg.InfluxOrg, cfg.InfluxBucket)
	log.Printf("WebSocket port: %s", cfg.WSPort)

	// InfluxDB writer
	influxWriter := influx.NewWriter(cfg.InfluxURL, cfg.InfluxToken, cfg.InfluxOrg, cfg.InfluxBucket)
	defer influxWriter.Close()

	// WebSocket hub
	hub := ws.NewHub()
	go hub.Run()

	// MQTT subscriber
	subscriber := mqttpkg.NewSubscriber(cfg.MQTTBroker)
	subscriber.OnMessage(func(msg mqttpkg.TelemetryMessage) {
		influxWriter.Write(msg)
		hub.Broadcast(msg)
	})

	if err := subscriber.Connect(); err != nil {
		log.Fatalf("Failed to connect to MQTT: %v", err)
	}
	defer subscriber.Close()

	// HTTP server
	router := api.NewRouter(hub, influxWriter, cfg)
	addr := fmt.Sprintf(":%s", cfg.WSPort)
	server := &http.Server{Addr: addr, Handler: router}

	go func() {
		log.Printf("HTTP/WS server listening on %s", addr)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("HTTP server error: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down...")
}
