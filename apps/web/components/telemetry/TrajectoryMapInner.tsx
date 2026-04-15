'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Polyline, CircleMarker, useMap } from 'react-leaflet';
import { useTelemetry } from './TelemetryProvider';
import 'leaflet/dist/leaflet.css';

// Haversine distance in meters
function distanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Component that auto-pans the map to follow the current position
function MapFollower({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current) {
      map.setView([lat, lon], 15);
      initializedRef.current = true;
    } else {
      map.panTo([lat, lon], { animate: true, duration: 0.5 });
    }
  }, [lat, lon, map]);

  return null;
}

export default function TrajectoryMapInner() {
  const { state } = useTelemetry();

  const history = state.positionHistory;
  const current = state.position;

  // Default center (Czech Republic)
  const defaultCenter: [number, number] = [50.2103, 15.8327];
  const center = current ? [current.lat, current.lon] as [number, number] : defaultCenter;

  const trajectory: [number, number][] = history.map((p) => [p.lat, p.lon]);

  return (
    <div className="w-full rounded-lg overflow-hidden border border-cosmic-blue/30">
      <MapContainer
        center={center}
        zoom={15}
        className="w-full md:!h-[280px]"
        style={{ height: '200px', background: '#0a0e27' }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Follow current position */}
        {current && <MapFollower lat={current.lat} lon={current.lon} />}

        {/* Trajectory line */}
        {trajectory.length > 1 && (
          <Polyline
            positions={trajectory}
            pathOptions={{ color: '#64f4d2', weight: 2, opacity: 0.7 }}
          />
        )}

        {/* Start marker */}
        {trajectory.length > 0 && (
          <CircleMarker
            center={trajectory[0]}
            radius={5}
            pathOptions={{ color: '#fb923c', fillColor: '#fb923c', fillOpacity: 0.8, weight: 2 }}
          />
        )}

        {/* Current position marker */}
        {current && (
          <CircleMarker
            center={[current.lat, current.lon]}
            radius={6}
            pathOptions={{ color: '#64f4d2', fillColor: '#64f4d2', fillOpacity: 1, weight: 2 }}
          />
        )}
      </MapContainer>
      {current && (
        <div className="flex justify-between px-2 py-1.5 text-xs text-moon-gray font-mono">
          <span>{current.lat.toFixed(6)}°N</span>
          <span>{current.lon.toFixed(6)}°E</span>
          <span>Alt: {current.alt.toFixed(1)} m</span>
          <span>
            Drift: {history.length > 0
              ? distanceMeters(history[0].lat, history[0].lon, current.lat, current.lon).toFixed(0)
              : '0'} m
          </span>
        </div>
      )}
    </div>
  );
}
