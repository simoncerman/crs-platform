package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MQTTBroker   string
	InfluxURL    string
	InfluxToken  string
	InfluxOrg    string
	InfluxBucket string
	WSPort       string
	CORSOrigins  string
}

func Load() *Config {
	godotenv.Load()

	return &Config{
		MQTTBroker:   getEnv("MQTT_BROKER", "localhost:1883"),
		InfluxURL:    getEnv("INFLUX_URL", "http://localhost:8086"),
		InfluxToken:  getEnv("INFLUX_TOKEN", "dev-token-change-in-prod"),
		InfluxOrg:    getEnv("INFLUX_ORG", "czech-rocket-society"),
		InfluxBucket: getEnv("INFLUX_BUCKET", "telemetry"),
		WSPort:       getEnv("WS_PORT", "8082"),
		CORSOrigins:  getEnv("CORS_ORIGINS", "http://localhost:3000"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
