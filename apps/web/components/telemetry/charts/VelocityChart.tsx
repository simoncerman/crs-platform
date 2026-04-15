'use client';

import React, { memo, useState, useEffect } from 'react';
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

export const VelocityChart = memo(function VelocityChart() {
  const { state, isStale } = useTelemetry();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(interval);
  }, []);

  const history = state.velocityHistory;
  const data = history.map((v) => ({ ts: v.ts, speed: v.speed, vz: v.vz }));

  // Extend line to "now" with last known value
  if (data.length > 0) {
    const last = data[data.length - 1];
    if (now - last.ts > 200) {
      data.push({ ts: now, speed: last.speed, vz: last.vz });
    }
  }

  return (
    <div className="w-full h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
          <XAxis
            dataKey="ts"
            type="number"
            domain={[data.length > 0 ? data[0].ts : now, now]}
            tickFormatter={formatTime}
            tick={{ fill: '#a8b2d1', fontSize: 11 }}
            axisLine={{ stroke: '#1a1f3a' }}
          />
          <YAxis
            tick={{ fill: '#a8b2d1', fontSize: 11 }}
            axisLine={{ stroke: '#1a1f3a' }}
            label={{ value: 'm/s', position: 'insideLeft', fill: '#a8b2d1', fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0a0e27',
              border: '1px solid #4d9fff',
              borderRadius: '8px',
              color: '#f8f9fc',
            }}
            labelFormatter={(ts) => formatTime(ts as number)}
            formatter={(value, name) => [
              `${Number(value).toFixed(1)} m/s`,
              name === 'speed' ? 'Rychlost' : 'Vz',
            ]}
          />
          <Line
            type="monotone"
            dataKey="speed"
            stroke={isStale ? '#f59e0b' : '#4d9fff'}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});
