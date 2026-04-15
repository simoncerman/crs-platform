'use client';

import React, { memo, useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTelemetry } from '../TelemetryProvider';

function formatTime(ts: number): string {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}`;
}

export const AltitudeChart = memo(function AltitudeChart() {
  const { state, isStale } = useTelemetry();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const history = state.positionHistory;

  // Build chart data — just ts and alt from history
  const data: { ts: number; alt: number }[] = [];
  const step = history.length > 2000 ? Math.ceil(history.length / 2000) : 1;
  for (let i = 0; i < history.length; i += step) {
    data.push({ ts: history[i].ts, alt: history[i].alt });
  }
  if (history.length > 0 && (history.length - 1) % step !== 0) {
    data.push({ ts: history[history.length - 1].ts, alt: history[history.length - 1].alt });
  }

  // Extend to now for flat line when stale
  if (data.length > 0) {
    const lastTs = data[data.length - 1].ts;
    if (now - lastTs > 500) {
      data.push({ ts: now, alt: data[data.length - 1].alt });
    }
  }

  const domainStart = data.length > 0 ? data[0].ts : now;

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={[domainStart, now]}
            tickFormatter={formatTime}
            tick={{ fill: '#a8b2d1', fontSize: 11 }}
            axisLine={{ stroke: '#1a1f3a' }}
          />
          <YAxis
            tick={{ fill: '#a8b2d1', fontSize: 11 }}
            axisLine={{ stroke: '#1a1f3a' }}
            label={{ value: 'm', position: 'insideLeft', fill: '#a8b2d1', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0e27',
              border: '1px solid #64f4d2',
              borderRadius: '8px',
              color: '#f8f9fc',
            }}
            labelFormatter={(ts) => formatTime(ts as number)}
            formatter={(value) => [`${Number(value).toFixed(1)} m`, 'Výška']}
          />
          <Line
            type="monotone"
            dataKey="alt"
            stroke={isStale ? '#f59e0b' : '#64f4d2'}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
