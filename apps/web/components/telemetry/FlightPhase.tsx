'use client';

import React, { memo } from 'react';
import { useTelemetry } from './TelemetryProvider';

const PHASES = [
  { key: 'countdown', label: 'Odpočet', color: '#a8b2d1' },
  { key: 'launch', label: 'Start', color: '#fb923c' },
  { key: 'ascent', label: 'Stoupání', color: '#F3B600' },
  { key: 'coast', label: 'Setrvačnost', color: '#4d9fff' },
  { key: 'apogee', label: 'Apogeum', color: '#64f4d2' },
  { key: 'descent', label: 'Sestup', color: '#8b5cf6' },
  { key: 'landing', label: 'Přistání', color: '#22c55e' },
  { key: 'complete', label: 'Dokončeno', color: '#a8b2d1' },
];

export const FlightPhase = memo(function FlightPhase() {
  const { state } = useTelemetry();
  const currentPhase = state.sensors?.phase || 'countdown';

  const currentIdx = PHASES.findIndex((p) => p.key === currentPhase);

  return (
    <div className="flex items-center gap-1">
      {PHASES.map((phase, i) => {
        const isActive = phase.key === currentPhase;
        const isPast = i < currentIdx;

        return (
          <div key={phase.key} className="flex items-center">
            <div
              className={`px-2 py-1 rounded text-xs transition-all ${
                isActive
                  ? 'font-bold border'
                  : isPast
                  ? 'opacity-50'
                  : 'opacity-30'
              }`}
              style={{
                color: isActive || isPast ? phase.color : '#a8b2d1',
                borderColor: isActive ? phase.color : 'transparent',
                backgroundColor: isActive ? `${phase.color}20` : 'transparent',
              }}
            >
              {phase.label}
            </div>
            {i < PHASES.length - 1 && (
              <div
                className="w-3 h-px mx-0.5"
                style={{
                  backgroundColor: isPast ? phase.color : '#1a1f3a',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});
