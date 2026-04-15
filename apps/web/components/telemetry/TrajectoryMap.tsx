'use client';

import React, { memo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTelemetry } from './TelemetryProvider';

// Dynamically import map to avoid SSR issues with Leaflet
const MapInner = dynamic(() => import('./TrajectoryMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[200px] bg-deep-space/50 rounded-lg border border-cosmic-blue/30 flex items-center justify-center">
      <span className="text-moon-gray text-sm">Načítám mapu...</span>
    </div>
  ),
});

export const TrajectoryMap = memo(function TrajectoryMap() {
  return <MapInner />;
});
