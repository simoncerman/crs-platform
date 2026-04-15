'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import mqtt from 'mqtt';

export interface TelemetryDataPoint {
  sessionId: string;
  deviceType: string;
  deviceId: string;
  dataType: string;
  payload: Record<string, unknown>;
  receivedAt: number;
  latency: number;
}

interface UseDirectMqttOptions {
  sessionId: string;
  enabled?: boolean;
}

interface UseDirectMqttReturn {
  data: TelemetryDataPoint | null;
  isConnected: boolean;
  latency: number;
  error: string | null;
  messagesPerSec: number;
  bytesPerSec: number;
}

const MQTT_WS_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL || 'ws://localhost:9001';

export function useDirectMqtt({ sessionId, enabled = true }: UseDirectMqttOptions): UseDirectMqttReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState(0);
  const [messagesPerSec, setMessagesPerSec] = useState(0);
  const [bytesPerSec, setBytesPerSec] = useState(0);

  const dataRef = useRef<TelemetryDataPoint | null>(null);
  const [data, setData] = useState<TelemetryDataPoint | null>(null);
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const msgCountRef = useRef(0);
  const byteCountRef = useRef(0);
  const rafRef = useRef<number>(0);

  // Throttle state updates to requestAnimationFrame
  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setData(dataRef.current);
    });
  }, []);

  useEffect(() => {
    if (!enabled || !sessionId) return;

    const client = mqtt.connect(MQTT_WS_URL, {
      clientId: `crs-web-mqtt-${Date.now()}`,
      reconnectPeriod: 2000,
      connectTimeout: 5000,
    });

    clientRef.current = client;

    client.on('connect', () => {
      setIsConnected(true);
      setError(null);
      // Subscribe to all data for this session
      client.subscribe(`${sessionId}/#`, { qos: 0 });
    });

    client.on('error', (err) => {
      setError(err.message);
    });

    client.on('close', () => {
      setIsConnected(false);
    });

    client.on('message', (topic: string, payload: Buffer) => {
      try {
        byteCountRef.current += payload.length + topic.length;
        const parts = topic.split('/');
        if (parts.length < 5 || parts[3] !== 'telemetry') return;

        const parsed = JSON.parse(payload.toString());
        const now = Date.now();
        const msgLatency = parsed.ts ? now - parsed.ts : 0;

        const point: TelemetryDataPoint = {
          sessionId: parts[0],
          deviceType: parts[1],
          deviceId: parts[2],
          dataType: parts.slice(4).join('/'),
          payload: parsed,
          receivedAt: now,
          latency: msgLatency,
        };

        dataRef.current = point;
        setLatency(msgLatency);
        msgCountRef.current++;
        scheduleUpdate();
      } catch {
        // Ignore parse errors
      }
    });

    // Messages and bytes per second counter
    const mpsInterval = setInterval(() => {
      setMessagesPerSec(msgCountRef.current);
      setBytesPerSec(byteCountRef.current);
      msgCountRef.current = 0;
      byteCountRef.current = 0;
    }, 1000);

    return () => {
      clearInterval(mpsInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      client.end(true);
      clientRef.current = null;
    };
  }, [sessionId, enabled, scheduleUpdate]);

  return { data, isConnected, latency, error, messagesPerSec, bytesPerSec };
}
