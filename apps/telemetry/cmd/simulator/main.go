package main

import (
	"crypto/tls"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math"
	"math/rand"
	"os"
	"os/signal"
	"syscall"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/joho/godotenv"
)

type flightPhase int

const (
	phaseCountdown flightPhase = iota
	phaseLaunch
	phaseAscent
	phaseCoast
	phaseApogee
	phaseDescent
	phaseLanding
	phaseComplete
)

func (p flightPhase) String() string {
	return [...]string{"countdown", "launch", "ascent", "coast", "apogee", "descent", "landing", "complete"}[p]
}

type flightState struct {
	phase     flightPhase
	t         float64 // elapsed seconds
	altitude  float64
	speed     float64
	vx, vy, vz float64
	lat, lon  float64
	temp      float64
	pressure  float64
	battery   float64
	gyro      [3]float64
}

func main() {
	_ = godotenv.Load()

	broker := flag.String("broker", "", "MQTT broker address (default from env or localhost:1883)")
	session := flag.String("session", "demo-sim", "Session ID for MQTT topics")
	deviceID := flag.String("device", "sim-1", "Device ID")
	hz := flag.Int("hz", 20, "Publishing frequency in Hz")
	duration := flag.Int("duration", 120, "Total flight duration in seconds")
	realistic := flag.Bool("realistic", false, "Realistic profile: 20min ground + 4min flight")
	useWS := flag.Bool("ws", false, "Use WebSocket transport (required for Railway)")
	useTLS := flag.Bool("tls", false, "Use TLS for MQTT connection (for Railway deployment)")
	blackoutStart := flag.Float64("blackout-start", 0, "Blackout start time in seconds (0 = auto during ascent)")
	blackoutDuration := flag.Float64("blackout-duration", 3.0, "Blackout duration in seconds")
	flag.Parse()

	brokerAddr := *broker
	if brokerAddr == "" {
		brokerAddr = os.Getenv("MQTT_BROKER")
	}
	if brokerAddr == "" {
		brokerAddr = "localhost:1883"
	}

	log.Println("=== CRS Telemetry Simulator ===")
	log.Printf("Session: %s, Device: %s", *session, *deviceID)
	log.Printf("Frequency: %d Hz, Duration: %d s", *hz, *duration)
	log.Printf("Broker: %s", brokerAddr)
	log.Printf("Blackout: %.1fs duration", *blackoutDuration)

	// MQTT connection
	var scheme string
	if *useWS {
		if *useTLS {
			scheme = "wss://"
		} else {
			scheme = "ws://"
		}
	} else {
		if *useTLS {
			scheme = "tls://"
		} else {
			scheme = "tcp://"
		}
	}

	opts := mqtt.NewClientOptions().
		AddBroker(scheme + brokerAddr).
		SetClientID(fmt.Sprintf("crs-simulator-%d", time.Now().UnixMilli())).
		SetAutoReconnect(true)

	if *useTLS {
		opts.SetTLSConfig(&tls.Config{InsecureSkipVerify: false})
	}

	client := mqtt.NewClient(opts)
	token := client.Connect()
	token.Wait()
	if token.Error() != nil {
		log.Fatalf("Failed to connect to MQTT: %v", token.Error())
	}
	defer client.Disconnect(1000)
	log.Println("Connected to MQTT broker")

	topicPrefix := fmt.Sprintf("%s/rocket/%s/telemetry", *session, *deviceID)
	interval := time.Duration(float64(time.Second) / float64(*hz))
	totalSteps := *duration * *hz

	state := &flightState{
		phase:    phaseCountdown,
		lat:      50.2103,
		lon:      15.8327,
		temp:     20.0,
		pressure: 1013.25,
		battery:  100.0,
	}

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	step := 0
	dt := 1.0 / float64(*hz)
	totalDuration := float64(*duration)

	var pt phaseTimings
	if *realistic {
		pt = realisticTimings(totalDuration)
		log.Println("Profile: REALISTIC (20min ground + 4min flight)")
	} else {
		pt = demoTimings(totalDuration)
		log.Println("Profile: DEMO")
	}

	// Determine blackout window
	blackoutStartTime := *blackoutStart
	if blackoutStartTime == 0 {
		// Auto: during powered ascent
		blackoutStartTime = pt.countdownEnd + 1.5 // 1.5s after launch
	}
	blackoutEndTime := blackoutStartTime + *blackoutDuration
	log.Printf("Blackout window: %.1fs - %.1fs", blackoutStartTime, blackoutEndTime)

	log.Println("Starting simulation...")

	for {
		select {
		case <-quit:
			log.Println("Simulator stopped")
			return
		case <-ticker.C:
			if step >= totalSteps {
				log.Println("Flight simulation complete")
				return
			}

			state.t = float64(step) * dt
			updatePhysics(state, dt, totalDuration, pt)

			// Blackout — simulate radio signal loss during ascent
			if state.t >= blackoutStartTime && state.t < blackoutEndTime {
				if step%(5**hz) == 0 {
					log.Printf("[t=%.1fs] *** BLACKOUT — no signal ***", state.t)
				}
				step++
				continue
			}

			ts := time.Now().UnixMilli()

			// Publish unified telemetry payload on all three topics
			payload := map[string]interface{}{
				// Position
				"alt": round(state.altitude, 1),
				"lat": round(state.lat, 6),
				"lon": round(state.lon, 6),
				// Velocity
				"vx":    round(state.vx, 2),
				"vy":    round(state.vy, 2),
				"vz":    round(state.vz, 2),
				"speed": round(state.speed, 2),
				// Sensors
				"temp":     round(state.temp, 1),
				"pressure": round(state.pressure, 1),
				"battery":  round(state.battery, 1),
				"gyro":     [3]float64{round(state.gyro[0], 3), round(state.gyro[1], 3), round(state.gyro[2], 3)},
				"phase":    state.phase.String(),
				// Timestamp
				"ts": ts,
			}

			// Publish unified payload on position topic (contains all data)
			publish(client, topicPrefix+"/position", payload)

			if step%(5**hz) == 0 {
				log.Printf("[t=%.1fs] Phase: %s | Alt: %.0fm | Speed: %.1fm/s | Temp: %.1f°C",
					state.t, state.phase, state.altitude, state.speed, state.temp)
			}

			step++
		}
	}
}

type phaseTimings struct {
	countdownEnd float64
	launchEnd    float64
	ascentEnd    float64
	coastEnd     float64
	apogeeEnd    float64
	descentEnd   float64
	landingEnd   float64
}

func demoTimings(d float64) phaseTimings {
	// 10s ground, 3s powered ascent, 5s coast, 2s apogee, 85s descent, 5s landing, rest on ground
	return phaseTimings{
		countdownEnd: 10,
		launchEnd:    13,   // 3s powered acceleration
		ascentEnd:    18,   // 5s coasting upward (engine off, still climbing)
		coastEnd:     19,   // brief coast at top
		apogeeEnd:    20,   // peak ~10s after launch
		descentEnd:   110,  // ~90s descent on parachute
		landingEnd:   115,  // 5s final landing
		// after landingEnd -> phaseComplete (on ground until duration ends)
	}
}

func realisticTimings(d float64) phaseTimings {
	// 20 min ground, 2s ignition, 18s powered ascent, 5s coast, 3s apogee, ~200s descent, 12s landing
	ground := 1200.0 // 20 min
	return phaseTimings{
		countdownEnd: ground,
		launchEnd:    ground + 2,
		ascentEnd:    ground + 20,
		coastEnd:     ground + 25,
		apogeeEnd:    ground + 28,
		descentEnd:   ground + 228,
		landingEnd:   ground + 240,
	}
}

func updatePhysics(s *flightState, dt, totalDuration float64, pt phaseTimings) {
	// Determine phase
	switch {
	case s.t < pt.countdownEnd:
		s.phase = phaseCountdown
	case s.t < pt.launchEnd:
		s.phase = phaseLaunch
	case s.t < pt.ascentEnd:
		s.phase = phaseAscent
	case s.t < pt.coastEnd:
		s.phase = phaseCoast
	case s.t < pt.apogeeEnd:
		s.phase = phaseApogee
	case s.t < pt.descentEnd:
		s.phase = phaseDescent
	case s.t < pt.landingEnd:
		s.phase = phaseLanding
	default:
		s.phase = phaseComplete
	}

	maxAlt := 3000.0

	switch s.phase {
	case phaseCountdown:
		// Stationary on ground — normal ambient readings
		s.altitude = 0
		s.speed = 0
		s.vz = 0
		s.temp = 18 + noise(1.5)
		s.pressure = 1013.25 + noise(0.3)

	case phaseLaunch:
		// 3s powered acceleration — aggressive thrust
		progress := (s.t - pt.countdownEnd) / (pt.launchEnd - pt.countdownEnd)
		s.vz = progress * 350 // accelerate to ~350 m/s
		s.speed = math.Abs(s.vz)
		s.altitude = progress * progress * maxAlt * 0.3

	case phaseAscent:
		// Engine off, coasting upward — decelerating but still climbing
		progress := (s.t - pt.launchEnd) / (pt.ascentEnd - pt.launchEnd)
		s.vz = 350 * (1 - progress*0.9) // 350 -> ~35 m/s
		s.speed = math.Abs(s.vz) + noise(3)
		s.altitude = maxAlt*0.3 + progress*maxAlt*0.6

	case phaseCoast:
		// Brief coast near apex
		progress := (s.t - pt.ascentEnd) / (pt.coastEnd - pt.ascentEnd)
		s.vz = 35 * (1 - progress)
		s.speed = math.Abs(s.vz)
		s.altitude = maxAlt*0.9 + progress*maxAlt*0.1

	case phaseApogee:
		// Peak altitude, near zero velocity
		progress := (s.t - pt.coastEnd) / (pt.apogeeEnd - pt.coastEnd)
		s.vz = 5 * (1 - progress*3)
		s.speed = math.Abs(s.vz)
		s.altitude = maxAlt - progress*progress*20

	case phaseDescent:
		// ~90s descent on parachute
		progress := (s.t - pt.apogeeEnd) / (pt.descentEnd - pt.apogeeEnd)
		if progress < 0.05 {
			// Free fall before drogue
			s.vz = -10 - progress*400
		} else if progress < 0.1 {
			// Drogue chute deploys
			s.vz = -30 + (progress-0.05)*300
		} else {
			// Main chute — steady descent
			s.vz = -15 - (1-progress)*5 + noise(0.8)
		}
		s.speed = math.Abs(s.vz)
		s.altitude = maxAlt * (1 - progress)
		if s.altitude < 0 {
			s.altitude = 0
		}

	case phaseLanding:
		// Final gentle touchdown
		progress := (s.t - pt.descentEnd) / (pt.landingEnd - pt.descentEnd)
		s.vz = -3 * (1 - progress)
		s.speed = math.Abs(s.vz)
		s.altitude = 30 * (1 - progress)
		if s.altitude < 0 {
			s.altitude = 0
		}

	case phaseComplete:
		// On ground — flight computer still running
		s.altitude = 0
		s.speed = 0
		s.vz = 0
	}

	// Horizontal drift — rocket drifts NE during flight (~200m total)
	// 1° lat ≈ 111km, so 200m ≈ 0.0018°
	if s.phase == phaseCountdown || s.phase == phaseComplete {
		s.vx = noise(0.05)
		s.vy = noise(0.05)
	} else if s.phase >= phaseLaunch && s.phase <= phaseApogee {
		// During ascent: consistent NE drift + noise
		s.vx = 8 + noise(2)
		s.vy = 5 + noise(2)
	} else {
		// During descent: wind carries parachute
		s.vx = 3 + noise(1)
		s.vy = 2 + noise(1)
	}
	s.lat += s.vx * dt * 0.000005
	s.lon += s.vy * dt * 0.000007

	// Temperature (skip for countdown — handled above)
	if s.phase >= phaseLaunch && s.phase <= phaseCoast {
		progress := (s.t - pt.countdownEnd) / (pt.coastEnd - pt.countdownEnd)
		s.temp = 20 + progress*60 + noise(2)
	} else if s.phase >= phaseApogee && s.phase <= phaseLanding {
		progress := (s.t - pt.apogeeEnd) / (pt.landingEnd - pt.apogeeEnd)
		s.temp = 80 - progress*55 + noise(2)
	} else if s.phase == phaseComplete {
		s.temp = 22 + noise(1)
	}

	// Pressure decreases with altitude
	s.pressure = 1013.25 * math.Exp(-s.altitude/8500)

	// Battery drain — slow on ground, faster in flight
	if s.phase == phaseCountdown {
		s.battery -= dt * 0.005 // ~6% over 20 min
	} else if s.phase != phaseComplete {
		s.battery -= dt * 0.15
		if s.battery < 0 {
			s.battery = 0
		}
	}

	// Gyroscope
	if s.phase >= phaseLaunch && s.phase <= phaseDescent {
		s.gyro = [3]float64{noise(0.5), noise(0.5), noise(0.3)}
	} else {
		s.gyro = [3]float64{noise(0.02), noise(0.02), noise(0.02)}
	}
}

func publish(client mqtt.Client, topic string, payload map[string]interface{}) {
	data, err := json.Marshal(payload)
	if err != nil {
		return
	}
	client.Publish(topic, 1, false, data)
}

func noise(amplitude float64) float64 {
	return (rand.Float64()*2 - 1) * amplitude
}

func round(val float64, decimals int) float64 {
	pow := math.Pow(10, float64(decimals))
	return math.Round(val*pow) / pow
}
