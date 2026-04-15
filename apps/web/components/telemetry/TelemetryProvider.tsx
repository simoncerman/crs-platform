'use client';

import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { useDirectMqtt, type TelemetryDataPoint } from './hooks/useDirectMqtt';
import { useGoWebSocket } from './hooks/useGoWebSocket';

export type ChannelMode = 'A' | 'B' | 'both';

export interface PositionData {
  alt: number;
  lat: number;
  lon: number;
  ts: number;
}

export interface VelocityData {
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  ts: number;
}

export interface SensorData {
  temp: number;
  pressure: number;
  battery: number;
  gyro: number[];
  phase: string;
  ts: number;
}

export interface TelemetryState {
  position: PositionData | null;
  velocity: VelocityData | null;
  sensors: SensorData | null;
  positionHistory: PositionData[];
  velocityHistory: VelocityData[];
  sensorHistory: SensorData[];
}

export interface RawMessage {
  timestamp: number;
  dataType: string;
  deviceId: string;
  payload: Record<string, unknown>;
}

interface TelemetryContextType {
  state: TelemetryState;
  channel: ChannelMode;
  setChannel: (ch: ChannelMode) => void;
  isStale: boolean;
  channelA: {
    isConnected: boolean;
    latency: number;
    error: string | null;
    messagesPerSec: number;
    bytesPerSec: number;
  };
  channelB: {
    isConnected: boolean;
    latency: number;
    error: string | null;
    messagesPerSec: number;
    bytesPerSec: number;
  };
  sessionId: string;
  rawMessages: RawMessage[];
  resetData: () => void;
  backfillData: () => Promise<void>;
  isBackfilling: boolean;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

const RAW_BUFFER_SIZE = 50;
const STALE_THRESHOLD_MS = 1000; // 1 second without data

function pushToRing<T>(arr: T[], item: T, maxSize: number): T[] {
  const next = [...arr, item];
  if (next.length > maxSize) {
    return next.slice(next.length - maxSize);
  }
  return next;
}

interface TelemetryProviderProps {
  sessionId: string;
  children: React.ReactNode;
}

export function TelemetryProvider({ sessionId, children }: TelemetryProviderProps) {
  const [channel, setChannel] = useState<ChannelMode>('B');
  const [isStale, setIsStale] = useState(false);
  const [state, setState] = useState<TelemetryState>({
    position: null,
    velocity: null,
    sensors: null,
    positionHistory: [],
    velocityHistory: [],
    sensorHistory: [],
  });

  const [rawMessages, setRawMessages] = useState<RawMessage[]>([]);
  const rawRef = useRef(rawMessages);
  rawRef.current = rawMessages;

  const stateRef = useRef(state);
  stateRef.current = state;

  const lastDataRef = useRef<number>(0);
  const [isBackfilling, setIsBackfilling] = useState(false);

  const TELEMETRY_API = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://') || 'http://localhost:8082';

  const backfillData = useCallback(async () => {
    setIsBackfilling(true);
    try {
      const to = Date.now();
      const url = `${TELEMETRY_API}/api/history?session_id=${sessionId}&resolution=1s&to=${to}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch history');
      const json = await res.json();
      const rows = json.data as Array<{ time: number; field: string; value: number; data_type: string }>;
      if (!rows || rows.length === 0) return;

      // Group rows by timestamp
      const byTime = new Map<number, Record<string, number>>();
      for (const row of rows) {
        if (!byTime.has(row.time)) byTime.set(row.time, {});
        const entry = byTime.get(row.time)!;
        entry[row.field] = row.value;
      }

      // Convert to typed arrays sorted by time
      const timestamps = Array.from(byTime.keys()).sort((a, b) => a - b);
      const positions: PositionData[] = [];
      const velocities: VelocityData[] = [];
      const sensors: SensorData[] = [];

      for (const ts of timestamps) {
        const d = byTime.get(ts)!;
        positions.push({ alt: d.alt ?? 0, lat: d.lat ?? 0, lon: d.lon ?? 0, ts });
        velocities.push({ vx: d.vx ?? 0, vy: d.vy ?? 0, vz: d.vz ?? 0, speed: d.speed ?? 0, ts });
        sensors.push({
          temp: d.temp ?? 0, pressure: d.pressure ?? 0, battery: d.battery ?? 0,
          gyro: [d['gyro_0'] ?? 0, d['gyro_1'] ?? 0, d['gyro_2'] ?? 0],
          phase: '', ts,
        });
      }

      // Merge with existing data — backfilled data goes before live data
      setState((prev) => {
        const existingStart = prev.positionHistory.length > 0 ? prev.positionHistory[0].ts : Infinity;
        const newPositions = positions.filter(p => p.ts < existingStart);
        const newVelocities = velocities.filter(v => v.ts < existingStart);
        const newSensors = sensors.filter(s => s.ts < existingStart);

        return {
          ...prev,
          position: prev.position ?? positions[positions.length - 1] ?? null,
          velocity: prev.velocity ?? velocities[velocities.length - 1] ?? null,
          sensors: prev.sensors ?? sensors[sensors.length - 1] ?? null,
          positionHistory: [...newPositions, ...prev.positionHistory],
          velocityHistory: [...newVelocities, ...prev.velocityHistory],
          sensorHistory: [...newSensors, ...prev.sensorHistory],
        };
      });
    } catch (err) {
      console.error('Backfill error:', err);
    } finally {
      setIsBackfilling(false);
    }
  }, [sessionId, TELEMETRY_API]);

  const resetData = useCallback(() => {
    setState({
      position: null,
      velocity: null,
      sensors: null,
      positionHistory: [],
      velocityHistory: [],
      sensorHistory: [],
    });
    setRawMessages([]);
    lastDataRef.current = 0;
    setIsStale(false);
  }, []);

  // Stale detection — check every 500ms if data stopped arriving
  useEffect(() => {
    const interval = setInterval(() => {
      if (lastDataRef.current === 0) return;
      const elapsed = Date.now() - lastDataRef.current;
      setIsStale(elapsed > STALE_THRESHOLD_MS);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const channelB = useDirectMqtt({
    sessionId,
    enabled: channel === 'B' || channel === 'both',
  });

  const channelA = useGoWebSocket({
    sessionId,
    enabled: channel === 'A' || channel === 'both',
  });

  // Process incoming data from active channel
  const processData = useCallback((point: TelemetryDataPoint | null) => {
    if (!point) return;

    lastDataRef.current = Date.now();

    // Debug: check for zero altitude in payload
    const debugPayload = point.payload as Record<string, unknown>;
    if (debugPayload.alt === 0 || debugPayload.alt === undefined || debugPayload.alt === null) {
      console.warn('ZERO ALT in payload:', JSON.stringify(debugPayload).slice(0, 200), 'dataType:', point.dataType);
    }

    const raw: RawMessage = {
      timestamp: point.receivedAt,
      dataType: point.dataType,
      deviceId: point.deviceId,
      payload: point.payload,
    };
    setRawMessages(pushToRing(rawRef.current, raw, RAW_BUFFER_SIZE));

    const p = point.payload as Record<string, unknown>;
    const ts = (p.ts as number) || point.receivedAt;

    // Extract all data from unified payload
    const pos: PositionData = {
      alt: p.alt != null ? (p.alt as number) : 0,
      lat: p.lat != null ? (p.lat as number) : 0,
      lon: p.lon != null ? (p.lon as number) : 0,
      ts,
    };
    const vel: VelocityData = {
      vx: p.vx != null ? (p.vx as number) : 0,
      vy: p.vy != null ? (p.vy as number) : 0,
      vz: p.vz != null ? (p.vz as number) : 0,
      speed: p.speed != null ? (p.speed as number) : 0,
      ts,
    };
    const sen: SensorData = {
      temp: p.temp != null ? (p.temp as number) : 0,
      pressure: p.pressure != null ? (p.pressure as number) : 0,
      battery: p.battery != null ? (p.battery as number) : 0,
      gyro: (p.gyro as number[]) ?? [0, 0, 0],
      phase: (p.phase as string) ?? '',
      ts,
    };

    // Use functional updater to avoid stale state with rapid updates
    setState((prev) => ({
      ...prev,
      position: pos,
      velocity: vel,
      sensors: sen,
      positionHistory: [...prev.positionHistory, pos],
      velocityHistory: [...prev.velocityHistory, vel],
      sensorHistory: [...prev.sensorHistory, sen],
    }));
  }, []);

  // React to data from active channel
  const activeData = channel === 'A' ? channelA.data : channelB.data;

  useEffect(() => {
    processData(activeData);
  }, [activeData, processData]);

  // In 'both' mode, also process secondary channel (but primary drives UI)
  useEffect(() => {
    if (channel !== 'both') return;
    // In both mode, channel B (direct MQTT) is primary for display
    // Channel A data is tracked for latency comparison only
  }, [channel, channelA.data]);

  const value: TelemetryContextType = {
    state,
    channel,
    setChannel,
    isStale,
    channelA: {
      isConnected: channelA.isConnected,
      latency: channelA.latency,
      error: channelA.error,
      messagesPerSec: channelA.messagesPerSec,
      bytesPerSec: channelA.bytesPerSec,
    },
    channelB: {
      isConnected: channelB.isConnected,
      latency: channelB.latency,
      error: channelB.error,
      messagesPerSec: channelB.messagesPerSec,
      bytesPerSec: channelB.bytesPerSec,
    },
    sessionId,
    rawMessages,
    resetData,
    backfillData,
    isBackfilling,
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error('useTelemetry must be used within TelemetryProvider');
  }
  return ctx;
}
