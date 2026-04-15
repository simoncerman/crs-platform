# Architektura telemetrického systému CRS

## 1. Celkový přehled systému

```mermaid
graph TB
    subgraph EXT["Fyzický svět"]
        SIM["Simulátor / Raketa<br/><i>MQTT publish</i>"]
    end

    subgraph RAILWAY["Railway Cloud"]
        subgraph BROKER["Mosquitto MQTT Broker"]
            MQTT_TCP["TCP :1883"]
            MQTT_WS["WebSocket :9001"]
        end

        subgraph GOSERVER["Go Telemetry Server :8082"]
            MQTTSUB["MQTT Subscriber"]
            WSHUB["WebSocket Hub<br/><i>16ms micro-batching</i>"]
            INFLUXW["InfluxDB Writer<br/><i>batch 500 / flush 100ms</i>"]
            RESTAPI["REST API<br/><i>chi router</i>"]
        end

        INFLUX[("InfluxDB 2.7<br/>bucket: telemetry<br/>retence: 52 týdnů")]

        subgraph WEB["Next.js 16 Web App :3000"]
            LIVE["Živá telemetrie<br/>/telemetrie/live/[id]"]
            PLAYBACK["Přehrávání záznamu<br/>/telemetrie/playback/[id]"]
            OVERVIEW["Přehled sessions<br/>/telemetrie"]
            ADMIN["Admin panel<br/>/admin/telemetry"]
        end
    end

    subgraph BROWSER["Prohlížeč (libovolný počítač)"]
        MQTTJS["mqtt.js klient<br/><i>Kanál B — přímý MQTT</i>"]
        WSNAT["WebSocket klient<br/><i>Kanál A — Go WS</i>"]
        UI["React UI<br/>TelemetryProvider"]
    end

    %% Simulator connections
    SIM -->|"MQTT TCP / WSS<br/>QoS 0"| MQTT_TCP

    %% Broker to Go server
    MQTT_TCP -->|"subscribe<br/>+/rocket/+/telemetry/#"| MQTTSUB
    MQTTSUB --> INFLUXW
    MQTTSUB --> WSHUB

    %% InfluxDB
    INFLUXW -->|"Line Protocol<br/>HTTP batch write"| INFLUX
    RESTAPI -->|"Flux query"| INFLUX

    %% Browser Channel B (Direct MQTT)
    MQTT_WS <-->|"wss:// (TLS terminated)"| MQTTJS
    MQTTJS --> UI

    %% Browser Channel A (Go WebSocket)
    WSHUB <-->|"wss:// (binary batches)"| WSNAT
    WSNAT --> UI

    %% REST API calls
    RESTAPI -->|"JSON"| PLAYBACK
    RESTAPI -->|"JSON"| OVERVIEW
    RESTAPI -->|"JSON"| ADMIN

    %% UI rendering
    UI --> LIVE

    classDef broker fill:#e74c3c,stroke:#c0392b,color:#fff
    classDef goserver fill:#2ecc71,stroke:#27ae60,color:#fff
    classDef influx fill:#9b59b6,stroke:#8e44ad,color:#fff
    classDef web fill:#3498db,stroke:#2980b9,color:#fff
    classDef browser fill:#f39c12,stroke:#e67e22,color:#fff
    classDef ext fill:#95a5a6,stroke:#7f8c8d,color:#fff

    class MQTT_TCP,MQTT_WS broker
    class MQTTSUB,WSHUB,INFLUXW,RESTAPI goserver
    class INFLUX influx
    class LIVE,PLAYBACK,OVERVIEW,ADMIN web
    class MQTTJS,WSNAT,UI browser
    class SIM ext
```

## 2. Datový tok — živá telemetrie

```mermaid
sequenceDiagram
    participant S as Simulátor
    participant M as Mosquitto Broker
    participant G as Go Server
    participant I as InfluxDB
    participant B as Prohlížeč

    Note over S,B: Kanál A (Go WebSocket) + zápis do InfluxDB
    S->>M: MQTT publish<br/>{session}/rocket/{device}/telemetry/{type}
    M->>G: MQTT message callback
    par Paralelní zpracování
        G->>I: Batch write (500 bodů / 100ms)
        G->>B: WebSocket batch (16ms interval)
    end

    Note over S,B: Kanál B (Přímý MQTT)
    S->>M: MQTT publish
    M->>B: MQTT-over-WebSocket<br/>(mqtt.js v prohlížeči)

    Note over B: TelemetryProvider<br/>sjednocuje oba kanály
```

## 3. Datový tok — přehrávání záznamu

```mermaid
sequenceDiagram
    participant B as Prohlížeč
    participant G as Go Server (REST API)
    participant I as InfluxDB

    B->>G: GET /api/sessions
    G->>I: Flux: schema.tagValues(tag: "session_id")
    I-->>G: ["quick-test", "demo-sim", ...]
    G-->>B: { sessions: [...] }

    B->>G: GET /api/history?session_id=quick-test&resolution=1s
    G->>I: Flux: from(bucket) |> filter |> aggregateWindow(every: 1s, fn: last)
    I-->>G: Downsampled data points
    G-->>B: [{ time, field, value, session_id, device_type, ... }]

    Note over B: Playback s ovládáním rychlosti (0.5x–20x)<br/>Grafy: výška, rychlost, teplota, tlak
```

## 4. MQTT topic hierarchie

```mermaid
graph LR
    ROOT["{session_id}"] --> DTYPE["rocket | test-stand"]
    DTYPE --> DEVICE["{device_id}"]
    DEVICE --> TEL["telemetry"]
    TEL --> POS["position<br/><code>alt, lat, lon, ts</code>"]
    TEL --> VEL["velocity<br/><code>vx, vy, vz, speed, ts</code>"]
    TEL --> SENS["sensors<br/><code>temp, pressure, battery,<br/>gyro[3], phase, ts</code>"]

    style ROOT fill:#e74c3c,color:#fff
    style DTYPE fill:#e67e22,color:#fff
    style DEVICE fill:#f1c40f,color:#333
    style TEL fill:#2ecc71,color:#fff
    style POS fill:#3498db,color:#fff
    style VEL fill:#3498db,color:#fff
    style SENS fill:#3498db,color:#fff
```

## 5. Komponentová architektura frontendu

```mermaid
graph TB
    subgraph PAGE["Stránka /telemetrie/live/[sessionId]"]
        TP["TelemetryProvider<br/><i>Context + state management</i>"]

        subgraph HOOKS["Datové kanály"]
            H_MQTT["useDirectMqtt<br/>(Kanál B)"]
            H_WS["useGoWebSocket<br/>(Kanál A)"]
        end

        subgraph COMPONENTS["UI Komponenty"]
            SB["StatusBar<br/>stav, hodiny, msg/s"]
            FP["FlightPhase<br/>aktuální fáze letu"]
            GP["GaugePanel<br/>vizuální ukazatele"]
            TM["TrajectoryMap<br/>GPS trajektorie"]
            AC["AltitudeChart<br/>výška vs čas"]
            VC["VelocityChart<br/>rychlost vs čas"]
            SI["SensorInfo<br/>tabulka senzorů"]
            LP["LatencyPanel<br/>latence, tok dat"]
            RD["RawDataPanel<br/>posledních 50 zpráv"]
        end
    end

    H_MQTT --> TP
    H_WS --> TP
    TP --> SB
    TP --> FP
    TP --> GP
    TP --> TM
    TP --> AC
    TP --> VC
    TP --> SI
    TP --> LP
    TP --> RD

    classDef provider fill:#9b59b6,stroke:#8e44ad,color:#fff
    classDef hook fill:#e74c3c,stroke:#c0392b,color:#fff
    classDef comp fill:#3498db,stroke:#2980b9,color:#fff

    class TP provider
    class H_MQTT,H_WS hook
    class SB,FP,GP,TM,AC,VC,SI,LP,RD comp
```

## 6. Fáze letu simulátoru

```mermaid
stateDiagram-v2
    [*] --> Countdown: t=0
    Countdown --> Launch: ignition
    Launch --> Ascent: motor burn
    Ascent --> Coast: engine cutoff
    Coast --> Apogee: peak altitude
    Apogee --> Descent: drogue chute
    Descent --> Landing: main chute
    Landing --> Complete: touchdown
    Complete --> [*]

    state Countdown {
        note right of Countdown
            Demo: 5% délky
            Realistický: 20 min
            Alt: 0 m, Speed: 0 m/s
            Temp: ~18°C
        end note
    }

    state Ascent {
        note right of Ascent
            120→300 m/s
            Max výška: 3000 m
            Temp: 20→80°C
        end note
    }

    state Descent {
        note right of Descent
            Drogue: -25 m/s
            Main chute: -6 m/s
            ~200s (realistický)
        end note
    }
```

## 7. Nasazení na Railway

```mermaid
graph TB
    subgraph RAILWAY["Railway projekt"]
        subgraph SVC1["Mosquitto"]
            M_IMG["eclipse-mosquitto:2.0"]
            M_PORT["Port: 9001 (WS)"]
            M_VOL[("Volume:<br/>/mosquitto/data")]
            M_DOM["mosquitto-production-*.railway.app"]
        end

        subgraph SVC2["InfluxDB"]
            I_IMG["influxdb:2.7-alpine"]
            I_NET["Pouze interní síť<br/>influxdb.railway.internal:8086"]
            I_VOL[("Volume:<br/>/var/lib/influxdb2")]
        end

        subgraph SVC3["Go Telemetry"]
            G_IMG["Dockerfile:<br/>apps/telemetry/"]
            G_PORT["Port: 8082"]
            G_DOM["telemetry-production-*.railway.app"]
        end

        subgraph SVC4["Next.js Web"]
            W_IMG["apps/web"]
            W_PORT["Port: 3000"]
            W_DOM["web-production-*.railway.app"]
        end

        subgraph SVC5["Hono API"]
            A_IMG["apps/api"]
            A_PORT["Port: 3001"]
        end

        PG[("PostgreSQL 16")]
    end

    %% Internal connections
    G_IMG -->|"mqtt<br/>mosquitto.railway.internal:1883"| M_IMG
    G_IMG -->|"http<br/>influxdb.railway.internal:8086"| I_IMG
    A_IMG --> PG

    %% TLS termination
    INTERNET((Internet)) -->|"wss://"| M_DOM
    INTERNET -->|"wss://"| G_DOM
    INTERNET -->|"https://"| W_DOM

    classDef svc fill:#2d3436,stroke:#636e72,color:#dfe6e9
    classDef vol fill:#6c5ce7,stroke:#a29bfe,color:#fff
    classDef dom fill:#00b894,stroke:#00cec9,color:#fff
    classDef db fill:#fdcb6e,stroke:#ffeaa7,color:#333

    class M_IMG,I_IMG,G_IMG,W_IMG,A_IMG svc
    class M_VOL,I_VOL vol
    class M_DOM,G_DOM,W_DOM dom
    class PG db
```

## 8. Porty a protokoly

| Komponenta | Protokol | Port | Popis |
|---|---|---|---|
| Mosquitto (TCP) | MQTT | 1883 | Interní komunikace (Go server, simulátor lokálně) |
| Mosquitto (WS) | MQTT-over-WebSocket | 9001 | Prohlížeč — přímý kanál B |
| Go Telemetry | HTTP + WebSocket | 8082 | REST API + kanál A |
| InfluxDB | HTTP | 8086 | Time-series databáze |
| Next.js Web | HTTP | 3000 | Frontend |
| Hono API | HTTP | 3001 | Backend REST API |
| PostgreSQL | TCP | 5432 | Relační databáze |

> **Poznámka:** Railway automaticky terminuje TLS — prohlížeč se připojuje přes `wss://` / `https://`, Railway přeposílá jako plain `ws://` / `http://` do kontejneru.
