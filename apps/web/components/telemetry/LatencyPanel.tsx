'use client';

import React, { memo } from 'react';
import { useTelemetry } from './TelemetryProvider';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B/s`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB/s`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB/s`;
}

export const LatencyPanel = memo(function LatencyPanel() {
  const { channelA, channelB, channel } = useTelemetry();

  const delta = Math.abs(channelA.latency - channelB.latency);
  const activeBps = channel === 'A' ? channelA.bytesPerSec : channelB.bytesPerSec;

  return (
    <div className="flex flex-wrap items-center gap-6 gap-y-1 text-xs text-moon-gray">
      <div className="flex items-center gap-2">
        <span className={channel === 'A' || channel === 'both' ? 'text-aurora-cyan' : ''}>
          Kanál A:
        </span>
        <span className="font-mono text-stellar-white">
          {channelA.isConnected ? `${channelA.latency}ms` : 'offline'}
        </span>
        <span className="text-moon-gray/50">
          ({channelA.messagesPerSec}/s)
        </span>
      </div>

      <div className="border-l border-cosmic-blue/30 h-4" />

      <div className="flex items-center gap-2">
        <span className={channel === 'B' || channel === 'both' ? 'text-aurora-cyan' : ''}>
          Kanál B:
        </span>
        <span className="font-mono text-stellar-white">
          {channelB.isConnected ? `${channelB.latency}ms` : 'offline'}
        </span>
        <span className="text-moon-gray/50">
          ({channelB.messagesPerSec}/s)
        </span>
      </div>

      <div className="border-l border-cosmic-blue/30 h-4" />

      <div className="flex items-center gap-2">
        <span>Tok:</span>
        <span className="font-mono text-stellar-white">{formatBytes(activeBps)}</span>
      </div>

      {channel === 'both' && (
        <>
          <div className="border-l border-cosmic-blue/30 h-4" />
          <div className="flex items-center gap-2">
            <span>Delta:</span>
            <span className="font-mono text-crs-ignition">{delta}ms</span>
          </div>
        </>
      )}
    </div>
  );
});
