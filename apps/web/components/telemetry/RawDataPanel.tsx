'use client';

import React, { memo, useState, useRef, useEffect } from 'react';
import { useTelemetry } from './TelemetryProvider';

export const RawDataPanel = memo(function RawDataPanel() {
  const { rawMessages } = useTelemetry();
  const [open, setOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (open && autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [rawMessages, open, autoScroll]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    setAutoScroll(scrollHeight - scrollTop - clientHeight < 40);
  };

  const typeColor: Record<string, string> = {
    position: 'text-green-400',
    velocity: 'text-blue-400',
    sensors: 'text-yellow-400',
  };

  return (
    <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-cosmic-blue/10 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-moon-gray">Raw Data</span>
          <span className="text-xs text-moon-gray/50 font-mono">
            ({rawMessages.length} zpráv)
          </span>
        </div>
        <span className="text-moon-gray text-xs">{open ? '▲ Skrýt' : '▼ Zobrazit'}</span>
      </button>

      {open && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-[250px] overflow-y-auto border-t border-cosmic-blue/20 px-3 py-2 font-mono text-[11px] leading-relaxed bg-cosmic-black/50"
        >
          {rawMessages.length === 0 && (
            <div className="text-moon-gray/50 text-center py-4">
              Zatím žádná data...
            </div>
          )}
          {rawMessages.map((msg, i) => {
            const time = new Date(msg.timestamp).toLocaleTimeString('cs-CZ', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              fractionalSecondDigits: 3,
            });
            return (
              <div key={i} className="flex gap-2 py-0.5 border-b border-cosmic-blue/10 last:border-0">
                <span className="text-moon-gray/60 shrink-0">{time}</span>
                <span className={`shrink-0 w-[70px] ${typeColor[msg.dataType] || 'text-moon-gray'}`}>
                  {msg.dataType}
                </span>
                <span className="text-moon-gray/40 shrink-0 w-[50px]">{msg.deviceId}</span>
                <span className="text-stellar-white/70 truncate">
                  {JSON.stringify(msg.payload)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});
