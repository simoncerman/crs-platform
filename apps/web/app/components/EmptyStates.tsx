'use client';

import { useEffect, useRef } from 'react';

// ── Floating Astronaut — for empty articles ────────────────────────
export function FloatingAstronaut({ message = 'Zatím tu nic není.' }: { message?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    canvas.width = 300;
    canvas.height = 300;
    let animId: number;
    let t = 0;

    // Stars
    const stars = Array.from({ length: 40 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 300,
      size: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, 300, 300);
      t += 0.02;

      // Stars
      for (const s of stars) {
        const alpha = 0.3 + 0.5 * Math.sin(t * 0.8 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 249, 252, ${alpha})`;
        ctx.fill();
      }

      // Astronaut body — floating with bobbing
      const cx = 150;
      const cy = 140 + Math.sin(t * 0.7) * 8;
      const rot = Math.sin(t * 0.3) * 0.08;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // Backpack
      ctx.fillStyle = '#222d4a';
      ctx.fillRect(-18, -12, 8, 35);

      // Body (suit)
      ctx.fillStyle = '#e8edf2';
      ctx.beginPath();
      ctx.roundRect(-12, -8, 28, 38, 6);
      ctx.fill();

      // Helmet
      ctx.fillStyle = '#d0d8e4';
      ctx.beginPath();
      ctx.arc(2, -14, 16, 0, Math.PI * 2);
      ctx.fill();

      // Visor
      ctx.fillStyle = '#1a1f3a';
      ctx.beginPath();
      ctx.arc(4, -14, 11, -0.4, Math.PI + 0.4);
      ctx.fill();

      // Visor reflection
      ctx.fillStyle = 'rgba(100, 244, 210, 0.25)';
      ctx.beginPath();
      ctx.arc(0, -17, 5, 0, Math.PI * 2);
      ctx.fill();

      // Arms
      ctx.strokeStyle = '#e8edf2';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      // Left arm (waving)
      const armAngle = Math.sin(t * 1.2) * 0.4 - 0.3;
      ctx.beginPath();
      ctx.moveTo(-10, 4);
      ctx.lineTo(-10 + Math.cos(armAngle) * 20, 4 + Math.sin(armAngle) * 20);
      ctx.stroke();
      // Right arm
      ctx.beginPath();
      ctx.moveTo(14, 4);
      ctx.lineTo(26, 18);
      ctx.stroke();

      // Legs
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(0, 30);
      ctx.lineTo(-8, 48);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(8, 30);
      ctx.lineTo(16, 48);
      ctx.stroke();

      // Tether line
      ctx.strokeStyle = 'rgba(100, 244, 210, 0.3)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(-18, 10);
      ctx.quadraticCurveTo(-60, 30 + Math.sin(t) * 10, -80, -20);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.restore();

      // Small floating newspaper/document
      const docX = cx + 50 + Math.sin(t * 0.5) * 15;
      const docY = cy - 30 + Math.cos(t * 0.6) * 10;
      ctx.save();
      ctx.translate(docX, docY);
      ctx.rotate(Math.sin(t * 0.4) * 0.2 + 0.1);
      ctx.fillStyle = 'rgba(248, 249, 252, 0.15)';
      ctx.fillRect(-8, -10, 16, 20);
      ctx.fillStyle = 'rgba(100, 244, 210, 0.2)';
      ctx.fillRect(-5, -7, 10, 2);
      ctx.fillRect(-5, -3, 8, 1.5);
      ctx.fillRect(-5, 0, 10, 1.5);
      ctx.fillRect(-5, 3, 6, 1.5);
      ctx.restore();

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <canvas ref={canvasRef} width={300} height={300} className="mb-4 opacity-80" />
      <p className="text-stellar-white/50 text-base">{message}</p>
      <p className="text-stellar-white/30 text-sm mt-1">Žádné zprávy z vesmíru...</p>
    </div>
  );
}

// ── Rocket on Launchpad — for empty events ─────────────────────────
export function RocketOnPad({ message = 'Zatím nejsou naplánovány žádné události.' }: { message?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    canvas.width = 300;
    canvas.height = 300;
    let animId: number;
    let t = 0;

    // Stars
    const stars = Array.from({ length: 30 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 200,
      size: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, 300, 300);
      t += 0.02;

      // Stars
      for (const s of stars) {
        const alpha = 0.2 + 0.4 * Math.sin(t * 0.5 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 249, 252, ${alpha})`;
        ctx.fill();
      }

      // Ground
      ctx.fillStyle = '#1a1f3a';
      ctx.fillRect(0, 260, 300, 40);
      ctx.fillStyle = '#222d4a';
      ctx.fillRect(0, 258, 300, 4);

      // Launch tower
      ctx.strokeStyle = '#4a5568';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(130, 258);
      ctx.lineTo(130, 140);
      ctx.stroke();
      // Tower arm
      ctx.beginPath();
      ctx.moveTo(130, 170);
      ctx.lineTo(148, 175);
      ctx.stroke();

      // Rocket body
      const rx = 155;
      const ry = 155;

      // Body
      ctx.fillStyle = '#e8edf2';
      ctx.beginPath();
      ctx.moveTo(rx, ry - 60);
      ctx.quadraticCurveTo(rx + 12, ry - 50, rx + 12, ry + 30);
      ctx.lineTo(rx - 12, ry + 30);
      ctx.quadraticCurveTo(rx - 12, ry - 50, rx, ry - 60);
      ctx.fill();

      // Nose cone
      ctx.fillStyle = '#F3B600';
      ctx.beginPath();
      ctx.moveTo(rx, ry - 70);
      ctx.quadraticCurveTo(rx + 8, ry - 55, rx + 8, ry - 45);
      ctx.lineTo(rx - 8, ry - 45);
      ctx.quadraticCurveTo(rx - 8, ry - 55, rx, ry - 70);
      ctx.fill();

      // Window
      ctx.fillStyle = '#64f4d2';
      ctx.globalAlpha = 0.5 + 0.3 * Math.sin(t * 2);
      ctx.beginPath();
      ctx.arc(rx, ry - 25, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Fins
      ctx.fillStyle = '#222d4a';
      ctx.beginPath();
      ctx.moveTo(rx - 12, ry + 20);
      ctx.lineTo(rx - 22, ry + 40);
      ctx.lineTo(rx - 12, ry + 35);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rx + 12, ry + 20);
      ctx.lineTo(rx + 22, ry + 40);
      ctx.lineTo(rx + 12, ry + 35);
      ctx.fill();

      // Nozzle
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.moveTo(rx - 6, ry + 30);
      ctx.lineTo(rx - 8, ry + 40);
      ctx.lineTo(rx + 8, ry + 40);
      ctx.lineTo(rx + 6, ry + 30);
      ctx.fill();

      // Subtle engine glow (pulsing)
      const glowAlpha = 0.1 + 0.08 * Math.sin(t * 3);
      ctx.beginPath();
      ctx.arc(rx, ry + 42, 12, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(rx, ry + 42, 0, rx, ry + 42, 12);
      glow.addColorStop(0, `rgba(243, 182, 0, ${glowAlpha})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fill();

      // Countdown text
      const countdown = Math.floor((Math.sin(t * 0.3) + 1) * 5);
      ctx.fillStyle = 'rgba(100, 244, 210, 0.3)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`T-${countdown}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`, rx, 275);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <canvas ref={canvasRef} width={300} height={300} className="mb-4 opacity-80" />
      <p className="text-stellar-white/50 text-base">{message}</p>
      <p className="text-stellar-white/30 text-sm mt-1">Raketa čeká na startovní rampě...</p>
    </div>
  );
}

// ── Blueprint — for empty projects ─────────────────────────────────
export function BlueprintDrawing({ message = 'Zatím nejsou k dispozici žádné projekty.' }: { message?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    canvas.width = 300;
    canvas.height = 250;
    let animId: number;
    let t = 0;

    // Blueprint grid
    function drawGrid() {
      ctx.strokeStyle = 'rgba(77, 159, 255, 0.06)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x < 300; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 250);
        ctx.stroke();
      }
      for (let y = 0; y < 250; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(300, y);
        ctx.stroke();
      }
    }

    // Rocket schematic points
    const schematic = [
      [150, 30], [162, 50], [164, 80], [164, 140],
      [175, 155], [175, 175], [164, 170], [164, 190],
      [158, 195], [142, 195], [136, 190], [136, 170],
      [125, 175], [125, 155], [136, 140], [136, 80],
      [138, 50], [150, 30],
    ];

    function draw() {
      ctx.clearRect(0, 0, 300, 250);
      t += 0.008;

      drawGrid();

      // Draw schematic progressively
      const progress = (Math.sin(t * 0.5) + 1) / 2; // 0 to 1 oscillating
      const pointsToDraw = Math.floor(progress * schematic.length);

      ctx.strokeStyle = 'rgba(77, 159, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      for (let i = 0; i <= pointsToDraw && i < schematic.length; i++) {
        const [x, y] = schematic[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Dimension lines
      if (pointsToDraw > 10) {
        ctx.strokeStyle = 'rgba(243, 182, 0, 0.2)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([2, 2]);

        // Height line
        ctx.beginPath();
        ctx.moveTo(185, 30);
        ctx.lineTo(185, 195);
        ctx.stroke();

        // Width line
        ctx.beginPath();
        ctx.moveTo(125, 210);
        ctx.lineTo(175, 210);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels
        ctx.fillStyle = 'rgba(243, 182, 0, 0.25)';
        ctx.font = '9px monospace';
        ctx.fillText('165cm', 188, 115);
        ctx.fillText('40cm', 140, 222);
      }

      // Blinking cursor at current draw point
      if (pointsToDraw < schematic.length) {
        const [cx, cy] = schematic[pointsToDraw];
        const blink = Math.sin(t * 20) > 0;
        if (blink) {
          ctx.fillStyle = 'rgba(77, 159, 255, 0.6)';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <canvas ref={canvasRef} width={300} height={250} className="mb-4 opacity-80" />
      <p className="text-stellar-white/50 text-base">{message}</p>
      <p className="text-stellar-white/30 text-sm mt-1">Schémata se teprve kreslí...</p>
    </div>
  );
}

// ── Helmet — for empty members ─────────────────────────────────────
export function EmptyHelmet({ message = 'Zatím nejsou k dispozici žádní členové.' }: { message?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    canvas.width = 200;
    canvas.height = 200;
    let animId: number;
    let t = 0;

    function draw() {
      ctx.clearRect(0, 0, 200, 200);
      t += 0.02;

      const cx = 100;
      const cy = 95;

      // Helmet outer
      ctx.fillStyle = '#d0d8e4';
      ctx.beginPath();
      ctx.arc(cx, cy, 55, 0, Math.PI * 2);
      ctx.fill();

      // Helmet inner shadow
      ctx.fillStyle = '#b8c4d4';
      ctx.beginPath();
      ctx.arc(cx + 2, cy + 2, 52, 0, Math.PI * 2);
      ctx.fill();

      // Visor
      ctx.fillStyle = '#0a0e27';
      ctx.beginPath();
      ctx.ellipse(cx + 3, cy, 38, 42, 0, -0.5, Math.PI + 0.5);
      ctx.fill();

      // Visor reflection — moving
      const refX = cx - 8 + Math.sin(t * 0.5) * 5;
      const refY = cy - 15 + Math.cos(t * 0.7) * 3;
      ctx.fillStyle = 'rgba(100, 244, 210, 0.15)';
      ctx.beginPath();
      ctx.ellipse(refX, refY, 12, 18, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Second reflection
      ctx.fillStyle = 'rgba(77, 159, 255, 0.1)';
      ctx.beginPath();
      ctx.ellipse(cx + 15, cy + 10, 6, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Stars reflected in visor
      for (let i = 0; i < 5; i++) {
        const sx = cx - 20 + i * 12 + Math.sin(t * 0.3 + i) * 3;
        const sy = cy - 10 + Math.cos(t * 0.4 + i * 2) * 8;
        const alpha = 0.2 + 0.15 * Math.sin(t + i);
        ctx.beginPath();
        ctx.arc(sx, sy, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 249, 252, ${alpha})`;
        ctx.fill();
      }

      // Question mark in visor
      ctx.fillStyle = `rgba(100, 244, 210, ${0.15 + 0.1 * Math.sin(t * 1.5)})`;
      ctx.font = 'bold 28px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', cx + 3, cy + 10);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <canvas ref={canvasRef} width={200} height={200} className="mb-4 opacity-80" />
      <p className="text-stellar-white/50 text-base">{message}</p>
      <p className="text-stellar-white/30 text-sm mt-1">Posádka se teprve sestavuje...</p>
    </div>
  );
}

// ── Satellite — for empty partners ──────────────────────────────────
export function OrbitingSatellite({ message = 'Zatím nemáme žádné partnery.' }: { message?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    canvas.width = 300;
    canvas.height = 300;
    let animId: number;
    let t = 0;

    const stars = Array.from({ length: 35 }, () => ({
      x: Math.random() * 300,
      y: Math.random() * 300,
      size: Math.random() * 1.5 + 0.5,
      phase: Math.random() * Math.PI * 2,
    }));

    function draw() {
      ctx.clearRect(0, 0, 300, 300);
      t += 0.015;

      // Stars
      for (const s of stars) {
        const alpha = 0.2 + 0.4 * Math.sin(t * 0.6 + s.phase);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 249, 252, ${alpha})`;
        ctx.fill();
      }

      const cx = 150;
      const cy = 150;

      // Earth
      ctx.beginPath();
      ctx.arc(cx, cy, 40, 0, Math.PI * 2);
      const earthGrad = ctx.createRadialGradient(cx - 10, cy - 10, 5, cx, cy, 40);
      earthGrad.addColorStop(0, '#4d9fff');
      earthGrad.addColorStop(0.5, '#1D00C8');
      earthGrad.addColorStop(1, '#0a0e27');
      ctx.fillStyle = earthGrad;
      ctx.fill();

      // Continents (simple shapes)
      ctx.fillStyle = 'rgba(100, 244, 210, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx - 8, cy - 10, 12, 8, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 12, cy + 8, 8, 12, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Atmosphere glow
      ctx.beginPath();
      ctx.arc(cx, cy, 46, 0, Math.PI * 2);
      const atmosGrad = ctx.createRadialGradient(cx, cy, 38, cx, cy, 46);
      atmosGrad.addColorStop(0, 'rgba(77, 159, 255, 0.15)');
      atmosGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmosGrad;
      ctx.fill();

      // Orbit path (ellipse)
      ctx.strokeStyle = 'rgba(248, 249, 252, 0.06)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 5]);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 85, 35, 0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Satellite position on orbit
      const satAngle = t * 0.8;
      const satX = cx + Math.cos(satAngle) * 85 * Math.cos(0.4) - Math.sin(satAngle) * 35 * Math.sin(0.4);
      const satY = cy + Math.cos(satAngle) * 85 * Math.sin(0.4) + Math.sin(satAngle) * 35 * Math.cos(0.4);

      // Only draw satellite when "in front" of earth (simple z-check)
      const behindEarth = Math.sin(satAngle) > 0.3 && Math.abs(satX - cx) < 35 && Math.abs(satY - cy) < 35;

      if (!behindEarth) {
        ctx.save();
        ctx.translate(satX, satY);
        ctx.rotate(satAngle * 0.5);

        // Solar panels
        ctx.fillStyle = '#4d9fff';
        ctx.globalAlpha = 0.7;
        ctx.fillRect(-14, -2, 10, 4);
        ctx.fillRect(4, -2, 10, 4);
        // Panel lines
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-9, -2); ctx.lineTo(-9, 2);
        ctx.moveTo(-4, -2); ctx.lineTo(-4, 2);
        ctx.moveTo(9, -2); ctx.lineTo(9, 2);
        ctx.stroke();
        ctx.globalAlpha = 1;

        // Body
        ctx.fillStyle = '#d0d8e4';
        ctx.fillRect(-4, -3, 8, 6);

        // Antenna
        ctx.strokeStyle = '#d0d8e4';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.lineTo(0, -8);
        ctx.stroke();
        ctx.fillStyle = '#F3B600';
        ctx.beginPath();
        ctx.arc(0, -8, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Signal waves (pulsing)
        const signalAlpha = 0.15 + 0.1 * Math.sin(t * 4);
        ctx.strokeStyle = `rgba(243, 182, 0, ${signalAlpha})`;
        ctx.lineWidth = 0.8;
        for (let i = 1; i <= 3; i++) {
          ctx.beginPath();
          ctx.arc(0, -8, 3 + i * 4, -Math.PI * 0.7, -Math.PI * 0.3);
          ctx.stroke();
        }

        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <canvas ref={canvasRef} width={300} height={300} className="mb-4 opacity-80" />
      <p className="text-stellar-white/50 text-base">{message}</p>
      <p className="text-stellar-white/30 text-sm mt-1">Hledáme spojence pro naši misi...</p>
    </div>
  );
}

// ── Loading Rocket — global loading state ──────────────────────────
export function LoadingRocket() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    const w = 280;
    const h = 320;
    canvas.width = w;
    canvas.height = h;
    let animId: number;
    let t = 0;

    // Streaming stars (moving downward to simulate flight)
    const streamStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      speed: 2 + Math.random() * 5,
      size: Math.random() * 2 + 0.5,
      brightness: 0.3 + Math.random() * 0.7,
    }));

    // Smoke particles behind rocket
    const smokeParticles: { x: number; y: number; size: number; life: number; maxLife: number; vx: number }[] = [];

    function draw() {
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, w, h);
      t += 0.03;

      const cx = w / 2;
      const bobX = Math.sin(t * 1.5) * 3;
      const bobY = Math.sin(t * 2.5) * 2;
      const rocketY = 110;

      // Streaming stars
      for (const s of streamStars) {
        s.y += s.speed;
        if (s.y > h) {
          s.y = -5;
          s.x = Math.random() * w;
        }
        // Stretch based on speed
        const stretch = s.speed * 1.5;
        ctx.strokeStyle = `rgba(248, 249, 252, ${s.brightness * 0.4})`;
        ctx.lineWidth = s.size * 0.5;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - stretch);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }

      // Spawn smoke
      if (Math.random() > 0.3) {
        smokeParticles.push({
          x: cx + bobX + (Math.random() - 0.5) * 8,
          y: rocketY + bobY + 88,
          size: 3 + Math.random() * 4,
          life: 0,
          maxLife: 30 + Math.random() * 20,
          vx: (Math.random() - 0.5) * 1.5,
        });
      }

      // Draw & update smoke
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.y += 2.5;
        p.x += p.vx;
        p.size *= 1.03;
        p.life++;
        const alpha = (1 - p.life / p.maxLife) * 0.3;
        if (alpha <= 0) { smokeParticles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 200, 210, ${alpha})`;
        ctx.fill();
      }

      // Engine glow
      const glowY = rocketY + bobY + 85;
      ctx.beginPath();
      ctx.arc(cx + bobX, glowY, 25, 0, Math.PI * 2);
      const engineGlow = ctx.createRadialGradient(cx + bobX, glowY, 0, cx + bobX, glowY, 25);
      engineGlow.addColorStop(0, `rgba(243, 182, 0, ${0.4 + 0.1 * Math.sin(t * 8)})`);
      engineGlow.addColorStop(0.5, 'rgba(251, 146, 60, 0.15)');
      engineGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = engineGlow;
      ctx.fill();

      // Flame — outer
      const flameH = 35 + Math.sin(t * 10) * 8;
      const flameGrad = ctx.createLinearGradient(cx + bobX, rocketY + bobY + 82, cx + bobX, rocketY + bobY + 82 + flameH);
      flameGrad.addColorStop(0, 'rgba(243, 182, 0, 0.9)');
      flameGrad.addColorStop(0.3, 'rgba(251, 146, 60, 0.7)');
      flameGrad.addColorStop(0.7, 'rgba(243, 182, 0, 0.3)');
      flameGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.moveTo(cx + bobX - 10, rocketY + bobY + 82);
      ctx.lineTo(cx + bobX, rocketY + bobY + 82 + flameH);
      ctx.lineTo(cx + bobX + 10, rocketY + bobY + 82);
      ctx.closePath();
      ctx.fillStyle = flameGrad;
      ctx.fill();

      // Flame — inner bright core
      const innerH = flameH * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + bobX - 4, rocketY + bobY + 82);
      ctx.lineTo(cx + bobX, rocketY + bobY + 82 + innerH);
      ctx.lineTo(cx + bobX + 4, rocketY + bobY + 82);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 250, 220, 0.8)';
      ctx.fill();

      // Rocket body
      const rx = cx + bobX;
      const ry = rocketY + bobY;

      ctx.fillStyle = '#e8edf2';
      ctx.beginPath();
      ctx.moveTo(rx, ry - 45);
      ctx.quadraticCurveTo(rx + 16, ry - 30, rx + 16, ry + 40);
      ctx.lineTo(rx - 16, ry + 40);
      ctx.quadraticCurveTo(rx - 16, ry - 30, rx, ry - 45);
      ctx.fill();

      // Stripe
      ctx.fillStyle = 'rgba(29, 0, 200, 0.15)';
      ctx.fillRect(rx - 16, ry + 5, 32, 6);

      // Nose cone
      ctx.fillStyle = '#64f4d2';
      ctx.beginPath();
      ctx.moveTo(rx, ry - 58);
      ctx.quadraticCurveTo(rx + 12, ry - 42, rx + 12, ry - 30);
      ctx.lineTo(rx - 12, ry - 30);
      ctx.quadraticCurveTo(rx - 12, ry - 42, rx, ry - 58);
      ctx.fill();

      // Window
      ctx.fillStyle = '#0a0e27';
      ctx.beginPath();
      ctx.arc(rx, ry - 8, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(100, 244, 210, ${0.3 + 0.2 * Math.sin(t * 3)})`;
      ctx.beginPath();
      ctx.arc(rx - 2, ry - 10, 3.5, 0, Math.PI * 2);
      ctx.fill();

      // Fins
      ctx.fillStyle = '#222d4a';
      ctx.beginPath();
      ctx.moveTo(rx - 16, ry + 28);
      ctx.lineTo(rx - 28, ry + 48);
      ctx.lineTo(rx - 16, ry + 42);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rx + 16, ry + 28);
      ctx.lineTo(rx + 28, ry + 48);
      ctx.lineTo(rx + 16, ry + 42);
      ctx.fill();

      // Nozzle
      ctx.fillStyle = '#4a5568';
      ctx.beginPath();
      ctx.moveTo(rx - 7, ry + 40);
      ctx.lineTo(rx - 9, ry + 48);
      ctx.lineTo(rx + 9, ry + 48);
      ctx.lineTo(rx + 7, ry + 40);
      ctx.fill();

      // CRS text on body
      ctx.fillStyle = 'rgba(29, 0, 200, 0.2)';
      ctx.font = 'bold 8px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CRS', rx, ry + 25);

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="min-h-screen bg-deep-space flex flex-col items-center justify-center animate-loading-fade-in">
      <canvas ref={canvasRef} width={280} height={320} className="mb-4" />
      <p className="text-stellar-white/40 text-sm font-accent tracking-widest uppercase animate-pulse">
        Načítání...
      </p>
    </div>
  );
}
