package influx

import (
	"context"
	"fmt"
	"log"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	"github.com/influxdata/influxdb-client-go/v2/api"
	"github.com/influxdata/influxdb-client-go/v2/api/write"

	mqttpkg "github.com/czech-rocket-society/telemetry/internal/mqtt"
)

// Writer handles batch writing of telemetry data to InfluxDB.
type Writer struct {
	client   influxdb2.Client
	writeAPI api.WriteAPI
	bucket   string
	org      string
}

// NewWriter creates a new InfluxDB writer with non-blocking batch writes.
func NewWriter(url, token, org, bucket string) *Writer {
	client := influxdb2.NewClientWithOptions(url, token,
		influxdb2.DefaultOptions().
			SetBatchSize(500).
			SetFlushInterval(100). // ms
			SetRetryInterval(1000).
			SetMaxRetries(3),
	)

	writeAPI := client.WriteAPI(org, bucket)

	// Log write errors
	go func() {
		for err := range writeAPI.Errors() {
			log.Printf("[InfluxDB] Write error: %v", err)
		}
	}()

	return &Writer{
		client:   client,
		writeAPI: writeAPI,
		bucket:   bucket,
		org:      org,
	}
}

// Write converts a telemetry message to an InfluxDB point and queues it.
func (w *Writer) Write(msg mqttpkg.TelemetryMessage) {
	// Use device timestamp as the point timestamp if available, otherwise server receive time
	pointTime := msg.ReceivedAt
	var deviceTs *time.Time
	if tsVal, ok := msg.Payload["ts"]; ok {
		switch v := tsVal.(type) {
		case float64:
			dt := time.UnixMilli(int64(v))
			deviceTs = &dt
			pointTime = dt
		}
	}

	// Build fields from payload (exclude "ts")
	fields := make(map[string]interface{})
	for k, v := range msg.Payload {
		if k == "ts" {
			continue
		}
		fields[k] = v
	}

	if len(fields) == 0 {
		return
	}

	// Store both timestamps as fields for latency analysis
	fields["server_received_at"] = msg.ReceivedAt.UnixMilli()
	if deviceTs != nil {
		fields["device_ts"] = deviceTs.UnixMilli()
		fields["latency_ms"] = msg.ReceivedAt.Sub(*deviceTs).Milliseconds()
	}

	point := write.NewPoint(
		"telemetry",
		map[string]string{
			"session_id":  msg.SessionID,
			"device_type": msg.DeviceType,
			"device_id":   msg.DeviceID,
			"data_type":   msg.DataType,
		},
		fields,
		pointTime,
	)

	w.writeAPI.WritePoint(point)
}

// QuerySessions returns distinct session IDs from InfluxDB.
func (w *Writer) QuerySessions(ctx context.Context) ([]string, error) {
	queryAPI := w.client.QueryAPI(w.org)

	query := fmt.Sprintf(`
		import "influxdata/influxdb/schema"
		schema.tagValues(
			bucket: "%s",
			tag: "session_id",
			start: -30d
		)
	`, w.bucket)

	result, err := queryAPI.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer result.Close()

	var sessions []string
	for result.Next() {
		if v, ok := result.Record().Value().(string); ok {
			sessions = append(sessions, v)
		}
	}
	return sessions, result.Err()
}

// QueryDevices returns distinct device IDs for a session.
func (w *Writer) QueryDevices(ctx context.Context, sessionID string) ([]map[string]string, error) {
	queryAPI := w.client.QueryAPI(w.org)

	query := fmt.Sprintf(`
		from(bucket: "%s")
			|> range(start: -30d)
			|> filter(fn: (r) => r["session_id"] == "%s")
			|> keep(columns: ["device_type", "device_id"])
			|> distinct(column: "device_id")
	`, w.bucket, sessionID)

	result, err := queryAPI.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer result.Close()

	seen := make(map[string]bool)
	var devices []map[string]string
	for result.Next() {
		record := result.Record()
		deviceType, _ := record.ValueByKey("device_type").(string)
		deviceID, _ := record.Value().(string)
		key := deviceType + "/" + deviceID
		if !seen[key] {
			seen[key] = true
			devices = append(devices, map[string]string{
				"device_type": deviceType,
				"device_id":   deviceID,
			})
		}
	}
	return devices, result.Err()
}

// QueryHistory returns historical telemetry data.
func (w *Writer) QueryHistory(ctx context.Context, sessionID, deviceID, from, to, resolution string) ([]map[string]interface{}, error) {
	queryAPI := w.client.QueryAPI(w.org)

	startRange := "-30d"
	if from != "" {
		startRange = from
	}
	stopRange := "now()"
	if to != "" {
		stopRange = to
	}

	aggregation := ""
	if resolution != "" {
		aggregation = fmt.Sprintf(`|> aggregateWindow(every: %s, fn: last, createEmpty: false)`, resolution)
	}

	deviceFilter := ""
	if deviceID != "" {
		deviceFilter = fmt.Sprintf(`|> filter(fn: (r) => r["device_id"] == "%s")`, deviceID)
	}

	query := fmt.Sprintf(`
		from(bucket: "%s")
			|> range(start: %s, stop: %s)
			|> filter(fn: (r) => r["session_id"] == "%s")
			%s
			%s
			|> sort(columns: ["_time"])
	`, w.bucket, startRange, stopRange, sessionID, deviceFilter, aggregation)

	result, err := queryAPI.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer result.Close()

	var rows []map[string]interface{}
	for result.Next() {
		record := result.Record()
		row := map[string]interface{}{
			"time":        record.Time().UnixMilli(),
			"field":       record.Field(),
			"value":       record.Value(),
			"session_id":  record.ValueByKey("session_id"),
			"device_type": record.ValueByKey("device_type"),
			"device_id":   record.ValueByKey("device_id"),
			"data_type":   record.ValueByKey("data_type"),
		}
		rows = append(rows, row)
	}
	return rows, result.Err()
}

// DeleteSession deletes all data points for a given session from InfluxDB.
func (w *Writer) DeleteSession(ctx context.Context, sessionID string) error {
	deleteAPI := w.client.DeleteAPI()
	predicate := fmt.Sprintf(`session_id="%s"`, sessionID)
	return deleteAPI.DeleteWithName(ctx, w.org, w.bucket, time.Unix(0, 0), time.Now(), predicate)
}

// Close flushes pending writes and closes the client.
func (w *Writer) Close() {
	w.writeAPI.Flush()
	w.client.Close()
}
