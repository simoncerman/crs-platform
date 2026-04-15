'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import type { TelemetryDataPoint } from './useDirectMqtt';

interface UseGoWebSocketOptions {
  sessionId: string;
  enabled?: boolean;
}

interface UseGoWebSocketReturn {
  data: TelemetryDataPoint | null;
  isConnected: boolean;
  latency: number;
  error: string | null;
  messagesPerSec: number;
  bytesPerSec: number;
}

const TELEMETRY_WS_URL = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL || 'ws://localhost:8082';

export function useGoWebSocket({ sessionId, enabled = true }: UseGoWebSocketOptions): UseGoWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latency, setLatency] = useState(0);
  const [messagesPerSec, setMessagesPerSec] = useState(0);
  const [bytesPerSec, setBytesPerSec] = useState(0);

  const dataRef = useRef<TelemetryDataPoint | null>(null);
  const [data, setData] = useState<TelemetryDataPoint | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const msgCountRef = useRef(0);
  const byteCountRef = useRef(0);
  const rafRef = useRef<number>(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const reconnectAttemptRef = useRef(0);

  const scheduleUpdate = useCallback(() => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      setData(dataRef.current);
    });
  }, []);

  const connect = useCallback(() => {
    if (!enabled || !sessionId) return;

    try {
      const ws = new WebSocket(`${TELEMETRY_WS_URL}/ws/telemetry?session_id=${sessionId}`);
      wsRef.current = ws;

      ws.binaryType = 'arraybuffer';

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const rawSize = typeof event.data === 'string' ? event.data.length : (event.data as ArrayBuffer).byteLength;
          byteCountRef.current += rawSize;
          const text = typeof event.data === 'string'
            ? event.data
            : new TextDecoder().decode(event.data);

          // Go backend sends batched messages as JSON array
          const batch = JSON.parse(text);
          const messages = Array.isArray(batch) ? batch : [batch];

          for (const rawMsg of messages) {
            const msg = typeof rawMsg === 'string' ? JSON.parse(rawMsg) : rawMsg;
            const now = Date.now();
            const ts = msg.payload?.ts;
            const msgLatency = ts ? now - ts : 0;

            const point: TelemetryDataPoint = {
              sessionId: msg.session_id,
              deviceType: msg.device_type,
              deviceId: msg.device_id,
              dataType: msg.data_type,
              payload: msg.payload,
              receivedAt: now,
              latency: msgLatency,
            };

            dataRef.current = point;
            setLatency(msgLatency);
            msgCountRef.current++;
          }

          scheduleUpdate();
        } catch {
          // Ignore parse errors
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Exponential backoff reconnect
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptRef.current), 30000);
        reconnectAttemptRef.current++;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        setError('WebSocket connection error');
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [sessionId, enabled, scheduleUpdate]);

  useEffect(() => {
    connect();

    const mpsInterval = setInterval(() => {
      setMessagesPerSec(msgCountRef.current);
      setBytesPerSec(byteCountRef.current);
      msgCountRef.current = 0;
      byteCountRef.current = 0;
    }, 1000);

    return () => {
      clearInterval(mpsInterval);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect]);

  return { data, isConnected, latency, error, messagesPerSec, bytesPerSec };
}
