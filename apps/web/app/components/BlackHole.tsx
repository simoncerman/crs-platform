'use client';

import { useEffect, useRef } from 'react';

export function BlackHole() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    let animId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const cx = width / 2;
    const cy = height / 2;

    // Particles orbiting and getting sucked in
    const particles: {
      angle: number;
      radius: number;
      speed: number;
      size: number;
      color: string;
      decay: number;
      originalRadius: number;
    }[] = [];

    function spawnParticle() {
      const angle = Math.random() * Math.PI * 2;
      const radius = 350 + Math.random() * 400;
      const colors = ['#64f4d2', '#4d9fff', '#F3B600', '#8b5cf6', '#f8f9fc', '#fb923c'];
      particles.push({
        angle,
        radius,
        speed: 0.003 + Math.random() * 0.008,
        size: 1 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        decay: 0.15 + Math.random() * 0.25,
        originalRadius: radius,
      });
    }

    // Initial particles
    for (let i = 0; i < 180; i++) spawnParticle();

    // Background stars (static)
    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      brightness: Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    function draw() {
      // Fill with deep-space background
      ctx.fillStyle = '#0a0e27';
      ctx.fillRect(0, 0, width, height);

      time += 0.016;

      // Stars
      for (const star of stars) {
        const twinkle = 0.3 + 0.7 * Math.sin(time * 0.5 + star.phase);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 249, 252, ${star.brightness * twinkle * 0.5})`;
        ctx.fill();
      }

      // Accretion disk glow — outer ring
      for (let r = 3; r >= 0; r--) {
        const diskRadius = 300 + r * 60;
        const grad = ctx.createRadialGradient(cx, cy, diskRadius * 0.7, cx, cy, diskRadius);
        const alpha = 0.03 - r * 0.005;
        grad.addColorStop(0, 'transparent');
        grad.addColorStop(0.5, `rgba(100, 244, 210, ${Math.max(0, alpha)})`);
        grad.addColorStop(0.7, `rgba(243, 182, 0, ${Math.max(0, alpha * 0.7)})`);
        grad.addColorStop(1, 'transparent');

        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 0.4);
        ctx.translate(-cx, -cy);
        ctx.beginPath();
        ctx.arc(cx, cy, diskRadius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      }

      // Particles — orbit and spiral inward
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Orbit
        p.angle += p.speed * (1 + (200 / Math.max(p.radius, 20)));
        // Spiral inward
        p.radius -= p.decay;

        if (p.radius < 15) {
          // Respawn
          p.angle = Math.random() * Math.PI * 2;
          p.radius = 200 + Math.random() * 300;
          p.originalRadius = p.radius;
          continue;
        }

        // Flatten orbit into ellipse (accretion disk)
        const flatness = 0.4;
        const px = cx + Math.cos(p.angle) * p.radius;
        const py = cy + Math.sin(p.angle) * p.radius * flatness;

        // Brightness increases as particle gets closer
        const proximity = 1 - (p.radius / p.originalRadius);
        const alpha = 0.3 + proximity * 0.7;
        const glowSize = p.size * (1 + proximity * 2);

        // Glow
        ctx.beginPath();
        ctx.arc(px, py, glowSize * 2, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(px, py, 0, px, py, glowSize * 2);
        glow.addColorStop(0, p.color + hex(alpha * 0.3));
        glow.addColorStop(1, 'transparent');
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, p.size * (0.5 + proximity * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color + hex(alpha);
        ctx.fill();
      }

      // Black hole center — true black circle with soft edge
      const holeRadius = 160;
      const edgeGrad = ctx.createRadialGradient(cx, cy, holeRadius * 0.6, cx, cy, holeRadius * 1.8);
      edgeGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
      edgeGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.95)');
      edgeGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
      edgeGrad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, holeRadius * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = edgeGrad;
      ctx.fill();

      // removed rings/lensing — clean black hole

      animId = requestAnimationFrame(draw);
    }

    function hex(a: number) {
      return Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
    }

    animId = requestAnimationFrame(draw);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
    />
  );
}
