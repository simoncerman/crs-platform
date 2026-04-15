'use client';

import React, { memo } from 'react';
import { useTelemetry } from './TelemetryProvider';

interface GaugeProps {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}

function Gauge({ label, value, unit, max, color }: GaugeProps) {
  const percentage = Math.min(Math.max(value / max, 0), 1);
  const r = 38;
  const circumference = 2 * Math.PI * r;
  // 270° arc = 75% of full circle
  const arcLength = circumference * 0.75;
  const gapLength = circumference * 0.25;
  // How much of the arc to fill
  const filledLength = arcLength * percentage;
  const unfilledLength = arcLength - filledLength;

  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="80" viewBox="5 5 90 80">
        {/* Background arc — 270° starting from bottom-left */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke="#1a1f3a"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${gapLength}`}
          transform="rotate(135, 50, 50)"
        />
        {/* Value arc */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${filledLength} ${circumference - filledLength}`}
          transform="rotate(135, 50, 50)"
          style={{ transition: 'stroke-dasharray 0.3s ease' }}
        />
        <text x="50" y="50" textAnchor="middle" fill="#f8f9fc" fontSize="16" fontWeight="bold">
          {value.toFixed(0)}
        </text>
        <text x="50" y="64" textAnchor="middle" fill="#a8b2d1" fontSize="10">
          {unit}
        </text>
      </svg>
      <span className="text-xs text-moon-gray">{label}</span>
    </div>
  );
}

export const GaugePanel = memo(function GaugePanel() {
  const { state } = useTelemetry();

  const altitude = state.position?.alt ?? 0;
  const speed = state.velocity?.speed ?? 0;
  const temp = state.sensors?.temp ?? 0;
  const battery = state.sensors?.battery ?? 0;

  return (
    <div className="grid grid-cols-2 gap-6 h-full place-content-start pt-2">
      <Gauge label="Výška" value={altitude} unit="m" max={3500} color="#64f4d2" />
      <Gauge label="Rychlost" value={speed} unit="m/s" max={350} color="#4d9fff" />
      <Gauge label="Teplota" value={temp} unit="°C" max={100} color="#fb923c" />
      <Gauge label="Baterie" value={battery} unit="%" max={100} color="#22c55e" />
    </div>
  );
});
