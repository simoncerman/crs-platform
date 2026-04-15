'use client';

import React, { memo, useState, useEffect } from 'react';
import { useTelemetry, type ChannelMode } from './TelemetryProvider';

export const StatusBar = memo(function StatusBar() {
  const { channel, setChannel, channelA, channelB, sessionId, state, isStale, resetData, backfillData, isBackfilling } = useTelemetry();
  const [clock, setClock] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setClock(new Date().toLocaleTimeString('cs-CZ'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const isLive = channel === 'A'
    ? channelA.isConnected
    : channel === 'B'
    ? channelB.isConnected
    : channelA.isConnected || channelB.isConnected;

  const activeHz = channel === 'A'
    ? channelA.messagesPerSec
    : channelB.messagesPerSec;

  const deviceId = state.sensors
    ? 'sim-1'
    : '---';

  const channels: { value: ChannelMode; label: string }[] = [
    { value: 'A', label: 'A' },
    { value: 'B', label: 'B' },
    { value: 'both', label: 'A+B' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-deep-space/80 backdrop-blur-sm border border-cosmic-blue/30 rounded-lg px-4 py-2">
      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2.5 h-2.5 rounded-full ${
              isLive && !isStale
                ? 'bg-red-500 animate-pulse'
                : isLive && isStale
                ? 'bg-amber-500 animate-[pulse_0.5s_ease-in-out_infinite]'
                : 'bg-moon-gray/50'
            }`}
          />
          <span className={`text-sm font-bold ${
            isLive && !isStale
              ? 'text-red-400'
              : isLive && isStale
              ? 'text-amber-400'
              : 'text-moon-gray'
          }`}>
            {isLive && !isStale ? 'LIVE' : isLive && isStale ? 'NO DATA' : 'OFFLINE'}
          </span>
        </div>

        <div className="border-l border-cosmic-blue/30 h-5" />

        {/* Device */}
        <span className="text-sm text-stellar-white font-mono">{deviceId}</span>

        <div className="border-l border-cosmic-blue/30 h-5" />

        {/* Session */}
        <span className="text-xs text-moon-gray">{sessionId}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Clock */}
        <span className="text-sm text-stellar-white/80 font-mono">{clock}</span>

        <div className="border-l border-cosmic-blue/30 h-5" />

        {/* Hz */}
        <span className="text-xs text-moon-gray">
          <span className="font-mono text-aurora-cyan">{activeHz}</span> msg/s
        </span>

        <div className="border-l border-cosmic-blue/30 h-5" />

        {/* Backfill */}
        <button
          onClick={backfillData}
          disabled={isBackfilling}
          className={`px-2 py-0.5 text-xs rounded border border-transparent transition-colors ${
            isBackfilling
              ? 'text-aurora-cyan/50 cursor-wait'
              : 'text-moon-gray hover:text-aurora-cyan hover:bg-aurora-cyan/10 hover:border-aurora-cyan/30'
          }`}
          title="Donahrát historická data z databáze"
        >
          {isBackfilling ? 'Nahrávám...' : 'DONAHRÁT'}
        </button>

        {/* Reset */}
        <button
          onClick={resetData}
          className="px-2 py-0.5 text-xs rounded text-moon-gray hover:text-red-400 hover:bg-red-400/10 border border-transparent hover:border-red-400/30 transition-colors"
          title="Vymazat data a připravit na nový start"
        >
          RESET
        </button>

        <div className="border-l border-cosmic-blue/30 h-5" />

        {/* Channel selector */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-moon-gray mr-1">Kanál:</span>
          {channels.map((ch) => (
            <button
              key={ch.value}
              onClick={() => setChannel(ch.value)}
              className={`px-2 py-0.5 text-xs rounded transition-colors ${
                channel === ch.value
                  ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/50'
                  : 'text-moon-gray hover:text-stellar-white border border-transparent'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});
