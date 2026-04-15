'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TelemetryProvider, useTelemetry } from '@/components/telemetry/TelemetryProvider';
import { StatusBar } from '@/components/telemetry/StatusBar';
import { FlightPhase } from '@/components/telemetry/FlightPhase';
import { GaugePanel } from '@/components/telemetry/GaugePanel';
import { TrajectoryMap } from '@/components/telemetry/TrajectoryMap';
import { AltitudeChart } from '@/components/telemetry/charts/AltitudeChart';
import { VelocityChart } from '@/components/telemetry/charts/VelocityChart';
import { LatencyPanel } from '@/components/telemetry/LatencyPanel';
import { RawDataPanel } from '@/components/telemetry/RawDataPanel';

export default function LiveTelemetryPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return (
    <TelemetryProvider sessionId={sessionId}>
      <div className="min-h-screen bg-cosmic-black text-stellar-white pt-20">
        {/* Header */}
        <header className="bg-deep-space/80 backdrop-blur-sm border-b border-cosmic-blue/30 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <Link
                href="/telemetrie"
                className="text-sm text-moon-gray hover:text-aurora-cyan transition-colors"
              >
                &larr; Zpět na přehled
              </Link>
              <h1 className="text-2xl font-heading font-bold mt-1">
                Živá telemetrie
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-moon-gray">
                Session: <span className="font-mono text-aurora-cyan">{sessionId}</span>
              </span>
              <Link
                href={`/telemetrie/playback/${sessionId}`}
                className="text-sm bg-cosmic-blue/30 hover:bg-cosmic-blue/50 text-stellar-white px-3 py-1.5 rounded border border-cosmic-blue/30 transition-colors"
              >
                Přehrát záznam
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-4">
          {/* Status bar */}
          <StatusBar />

          {/* Flight phase */}
          <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg px-4 py-3">
            <FlightPhase />
          </div>

          {/* Main grid: chart + sensors side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Altitude chart */}
            <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-moon-gray mb-3">Výška vs čas</h3>
              <AltitudeChart />
            </div>

            {/* Right: Gauges */}
            <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-moon-gray mb-3">Senzory</h3>
              <GaugePanel />
            </div>
          </div>

          {/* Second row: velocity + sensor data + map */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-moon-gray mb-3">Rychlost vs čas</h3>
              <VelocityChart />
            </div>

            <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-moon-gray mb-3">Senzorová data</h3>
              <SensorInfo />
            </div>

            <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
              <h3 className="text-sm font-medium text-moon-gray mb-3">GPS Trajektorie</h3>
              <TrajectoryMap />
            </div>
          </div>

          {/* Max values */}
          <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
            <h3 className="text-sm font-medium text-moon-gray mb-3">Maximální hodnoty</h3>
            <MaxValues />
          </div>

          {/* Latency panel */}
          <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg px-4 py-3">
            <LatencyPanel />
          </div>

          {/* Raw data */}
          <RawDataPanel />
        </main>
      </div>
    </TelemetryProvider>
  );
}

function MaxValues() {
  const { state } = useTelemetry();

  const maxAlt = state.positionHistory.reduce((max, p) => Math.max(max, p.alt), 0);
  const maxSpeed = state.velocityHistory.reduce((max, v) => Math.max(max, v.speed), 0);
  const maxTemp = state.sensorHistory.reduce((max, s) => Math.max(max, s.temp), 0);
  const minBattery = state.sensorHistory.length > 0
    ? state.sensorHistory.reduce((min, s) => Math.min(min, s.battery), 100)
    : 0;

  const items = [
    { label: 'Max výška', value: `${maxAlt.toFixed(1)} m`, color: 'text-aurora-cyan' },
    { label: 'Max rychlost', value: `${maxSpeed.toFixed(1)} m/s`, color: 'text-blue-400' },
    { label: 'Max teplota', value: `${maxTemp.toFixed(1)} °C`, color: 'text-orange-400' },
    { label: 'Min baterie', value: `${minBattery.toFixed(1)} %`, color: 'text-green-400' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col items-center">
          <span className={`text-2xl font-mono font-bold ${item.color}`}>{item.value}</span>
          <span className="text-xs text-moon-gray mt-1">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function SensorInfo() {
  const { state } = useTelemetry();

  const sensors = state.sensors;

  const rows = [
    { label: 'Teplota', value: sensors ? `${sensors.temp.toFixed(1)} °C` : '---' },
    { label: 'Tlak', value: sensors ? `${sensors.pressure.toFixed(1)} hPa` : '---' },
    { label: 'Baterie', value: sensors ? `${sensors.battery.toFixed(1)} %` : '---' },
    {
      label: 'Gyro (x,y,z)',
      value: sensors
        ? `${sensors.gyro[0]?.toFixed(3)}, ${sensors.gyro[1]?.toFixed(3)}, ${sensors.gyro[2]?.toFixed(3)}`
        : '---',
    },
    { label: 'Fáze letu', value: sensors?.phase || '---' },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <div key={row.label} className="flex justify-between items-center">
          <span className="text-sm text-moon-gray">{row.label}</span>
          <span className="text-sm font-mono text-stellar-white">{row.value}</span>
        </div>
      ))}
    </div>
  );
}
