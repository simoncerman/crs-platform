// Benchmark tool for comparing MQTT QoS levels.
// Publishes messages at configurable rates and measures latency, throughput, and loss.
//
// Usage:
//   go run cmd/benchmark/main.go [flags]
//
// Requires a running MQTT broker (Mosquitto) on localhost:1883.

package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"math"
	"os"
	"sort"
	"sync"
	"sync/atomic"
	"text/tabwriter"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
)

type Result struct {
	QoS          byte
	Hz           int
	MessagesSent int
	MessagesRecv int
	LossPercent  float64
	AvgLatencyMs float64
	P50LatencyMs float64
	P95LatencyMs float64
	P99LatencyMs float64
	MaxLatencyMs float64
}

func main() {
	broker := flag.String("broker", "localhost:1883", "MQTT broker address (host:port or wss://host URL)")
	useWS := flag.Bool("ws", false, "Use WebSocket (wss://) instead of TCP")
	duration := flag.Int("duration", 10, "Test duration in seconds per run")
	flag.Parse()

	rates := []int{1, 5, 10, 25, 50, 100, 200, 500}
	qosLevels := []byte{0, 1, 2}

	var results []Result

	for _, hz := range rates {
		for _, qos := range qosLevels {
			log.Printf("=== Testing QoS %d @ %d Hz for %ds ===", qos, hz, *duration)
			r := runBenchmark(*broker, *useWS, qos, hz, *duration)
			results = append(results, r)
			log.Printf("    Sent: %d | Recv: %d | Loss: %.1f%% | Avg: %.2fms | P95: %.2fms",
				r.MessagesSent, r.MessagesRecv, r.LossPercent, r.AvgLatencyMs, r.P95LatencyMs)
			// Small pause between runs to let broker settle
			time.Sleep(1 * time.Second)
		}
	}

	fmt.Println()
	printTable(results)
	fmt.Println()
	printCSV(results)
}

func brokerURL(broker string, useWS bool) string {
	if useWS {
		return fmt.Sprintf("wss://%s", broker)
	}
	return fmt.Sprintf("tcp://%s", broker)
}

func runBenchmark(broker string, useWS bool, qos byte, hz int, durationSec int) Result {
	topic := fmt.Sprintf("benchmark/qos%d/%dhz", qos, hz)
	url := brokerURL(broker, useWS)

	// --- Subscriber ---
	var received int64
	var mu sync.Mutex
	var latencies []float64

	subOpts := mqtt.NewClientOptions().
		AddBroker(url).
		SetClientID(fmt.Sprintf("bench-sub-%d-%d-%d", qos, hz, time.Now().UnixNano())).
		SetCleanSession(true)

	subClient := mqtt.NewClient(subOpts)
	if token := subClient.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("Subscriber connect failed: %v", token.Error())
	}
	defer subClient.Disconnect(250)

	subClient.Subscribe(topic, qos, func(_ mqtt.Client, msg mqtt.Message) {
		recvTime := time.Now().UnixMicro()
		var payload struct {
			Seq int   `json:"seq"`
			Ts  int64 `json:"ts"` // microseconds
		}
		if err := json.Unmarshal(msg.Payload(), &payload); err != nil {
			return
		}
		latencyMs := float64(recvTime-payload.Ts) / 1000.0
		atomic.AddInt64(&received, 1)
		mu.Lock()
		latencies = append(latencies, latencyMs)
		mu.Unlock()
	})

	// Small delay to ensure subscription is active
	time.Sleep(500 * time.Millisecond)

	// --- Publisher ---
	pubOpts := mqtt.NewClientOptions().
		AddBroker(url).
		SetClientID(fmt.Sprintf("bench-pub-%d-%d-%d", qos, hz, time.Now().UnixNano())).
		SetCleanSession(true)

	pubClient := mqtt.NewClient(pubOpts)
	if token := pubClient.Connect(); token.Wait() && token.Error() != nil {
		log.Fatalf("Publisher connect failed: %v", token.Error())
	}
	defer pubClient.Disconnect(250)

	interval := time.Duration(float64(time.Second) / float64(hz))
	totalMessages := hz * durationSec
	sent := 0

	ticker := time.NewTicker(interval)
	defer ticker.Stop()

	deadline := time.After(time.Duration(durationSec) * time.Second)

	for seq := 0; ; seq++ {
		select {
		case <-deadline:
			goto done
		case <-ticker.C:
			// ~1 KB payload simulating extended telemetry with multiple sensor arrays
			payload, _ := json.Marshal(map[string]interface{}{
				"seq":          seq,
				"ts":           time.Now().UnixMicro(),
				"alt":          1523.4,
				"lat":          49.195061,
				"lon":          16.606836,
				"vx":           12.35,
				"vy":           -3.21,
				"vz":           145.82,
				"speed":        146.4,
				"temp":         -12.3,
				"pressure":     845.2,
				"battery":      87.5,
				"gyro":         [3]float64{0.012, -0.034, 0.001},
				"accel":        [3]float64{0.15, -9.78, 0.42},
				"mag":          [3]float64{23.1, -5.4, 41.2},
				"phase":        "ascent",
				"gps_sats":     12,
				"gps_hdop":     0.8,
				"baro_alt":     1521.8,
				"ext_temp":     -15.2,
				"int_temp":     32.1,
				"motor_temp":   89.4,
				"tank_pressure": 245.6,
				"valve_pos":    0.78,
				"thrust":       1850.3,
				"fuel_mass":    2.34,
				"oxidizer_mass": 4.12,
				"roll_rate":    0.52,
				"pitch_rate":   -0.13,
				"yaw_rate":     0.08,
				"quaternion":   [4]float64{0.707, 0.0, 0.707, 0.0},
				"voltage":      7.42,
				"current":      0.85,
				"rssi":         -67,
				"snr":          12.5,
				"packet_loss":  0.02,
				"uptime_ms":    185432,
				"log":          "Nominal flight, all systems green. Stage separation armed.",
			})
			pubClient.Publish(topic, qos, false, payload)
			sent++
		}
	}

done:
	// Wait for stragglers
	time.Sleep(2 * time.Second)

	mu.Lock()
	defer mu.Unlock()

	recv := int(atomic.LoadInt64(&received))
	lossPercent := 0.0
	if sent > 0 {
		lossPercent = float64(sent-recv) / float64(sent) * 100
		if lossPercent < 0 {
			lossPercent = 0 // QoS 1 can cause duplicates
		}
	}

	sort.Float64s(latencies)

	result := Result{
		QoS:          qos,
		Hz:           hz,
		MessagesSent: sent,
		MessagesRecv: recv,
		LossPercent:  math.Round(lossPercent*100) / 100,
	}

	if len(latencies) > 0 {
		sum := 0.0
		for _, l := range latencies {
			sum += l
		}
		result.AvgLatencyMs = math.Round(sum/float64(len(latencies))*100) / 100
		result.P50LatencyMs = percentile(latencies, 50)
		result.P95LatencyMs = percentile(latencies, 95)
		result.P99LatencyMs = percentile(latencies, 99)
		result.MaxLatencyMs = math.Round(latencies[len(latencies)-1]*100) / 100
	}

	_ = totalMessages
	return result
}

func percentile(sorted []float64, p float64) float64 {
	if len(sorted) == 0 {
		return 0
	}
	idx := int(math.Ceil(p/100*float64(len(sorted)))) - 1
	if idx < 0 {
		idx = 0
	}
	if idx >= len(sorted) {
		idx = len(sorted) - 1
	}
	return math.Round(sorted[idx]*100) / 100
}

func printTable(results []Result) {
	w := tabwriter.NewWriter(os.Stdout, 0, 0, 2, ' ', 0)
	fmt.Fprintln(w, "QoS\tHz\tSent\tRecv\tLoss%\tAvg(ms)\tP50(ms)\tP95(ms)\tP99(ms)\tMax(ms)")
	fmt.Fprintln(w, "---\t---\t---\t---\t---\t---\t---\t---\t---\t---")
	for _, r := range results {
		fmt.Fprintf(w, "%d\t%d\t%d\t%d\t%.1f%%\t%.2f\t%.2f\t%.2f\t%.2f\t%.2f\n",
			r.QoS, r.Hz, r.MessagesSent, r.MessagesRecv, r.LossPercent,
			r.AvgLatencyMs, r.P50LatencyMs, r.P95LatencyMs, r.P99LatencyMs, r.MaxLatencyMs)
	}
	w.Flush()
}

func printCSV(results []Result) {
	fmt.Println("# CSV output (for pgfplots)")
	fmt.Println("qos,hz,sent,recv,loss_pct,avg_ms,p50_ms,p95_ms,p99_ms,max_ms")
	for _, r := range results {
		fmt.Printf("%d,%d,%d,%d,%.2f,%.2f,%.2f,%.2f,%.2f,%.2f\n",
			r.QoS, r.Hz, r.MessagesSent, r.MessagesRecv, r.LossPercent,
			r.AvgLatencyMs, r.P50LatencyMs, r.P95LatencyMs, r.P99LatencyMs, r.MaxLatencyMs)
	}
}
