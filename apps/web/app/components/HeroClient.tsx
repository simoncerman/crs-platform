'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

function NebulaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let isVisible = true;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // Pause animation when not visible
    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // Pre-render static nebula to offscreen canvas
    let nebulaCache: HTMLCanvasElement | null = null;
    function renderNebula() {
      nebulaCache = document.createElement('canvas');
      nebulaCache.width = width;
      nebulaCache.height = height;
      const nctx = nebulaCache.getContext('2d')!;

      const nb1 = nctx.createRadialGradient(
        width * 0.2, height * 0.3, 0,
        width * 0.2, height * 0.3, width * 0.35
      );
      nb1.addColorStop(0, 'rgba(77, 159, 255, 0.06)');
      nb1.addColorStop(0.4, 'rgba(100, 244, 210, 0.03)');
      nb1.addColorStop(1, 'transparent');
      nctx.fillStyle = nb1;
      nctx.fillRect(0, 0, width, height);

      const nb2 = nctx.createRadialGradient(
        width * 0.75, height * 0.6, 0,
        width * 0.75, height * 0.6, width * 0.3
      );
      nb2.addColorStop(0, 'rgba(243, 182, 0, 0.04)');
      nb2.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
      nb2.addColorStop(1, 'transparent');
      nctx.fillStyle = nb2;
      nctx.fillRect(0, 0, width, height);
    }
    renderNebula();

    // Generate stars once
    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.3 + 0.05,
      brightness: Math.random(),
      phase: Math.random() * Math.PI * 2,
      hasGlow: false,
    }));
    // Mark which stars get glow (pre-compute)
    for (const star of stars) {
      star.hasGlow = star.size > 1.5;
    }

    // Flying rockets
    const rockets: {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; size: number; flameLen: number;
    }[] = [];
    let rocketTimer = 0;

    const draw = (time: number) => {
      if (!isVisible) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw cached nebula
      if (nebulaCache) {
        ctx.drawImage(nebulaCache, 0, 0);
      }

      // Draw stars with twinkling
      const t = time * 0.001;
      for (const star of stars) {
        const twinkle = 0.4 + 0.6 * Math.sin(t * star.speed * 2 + star.phase);
        const alpha = star.brightness * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(248, 249, 252, ${alpha})`;
        ctx.fill();

        // Simple glow for bright stars (no gradient, just a larger faded circle)
        if (star.hasGlow) {
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(100, 244, 210, ${alpha * 0.08})`;
          ctx.fill();
        }
      }

      // Flying rockets - launch from bottom, fly straight up
      rocketTimer++;
      if (rocketTimer > 350 + Math.random() * 400) {
        rocketTimer = 0;
        rockets.push({
          x: width * 0.05 + Math.random() * width * 0.9,
          y: height + 10,
          vx: 0,
          vy: -(1.5 + Math.random() * 1.5),
          life: 0,
          maxLife: 200 + Math.random() * 150,
          size: 1.5 + Math.random() * 1.5,
          flameLen: 55 + Math.random() * 15,
        });
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.x += r.vx;
        r.y += r.vy;
        r.life++;

        const progress = r.life / r.maxLife;
        const alpha = progress < 0.1 ? progress / 0.1 : progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;

        // Rocket head — triangle pointing up
        const headY = r.y;
        ctx.beginPath();
        ctx.moveTo(r.x, headY - r.size * 3);
        ctx.lineTo(r.x - r.size * 1.2, headY + r.size * 1.5);
        ctx.lineTo(r.x + r.size * 1.2, headY + r.size * 1.5);
        ctx.closePath();
        ctx.fillStyle = `rgba(248, 249, 252, ${alpha * 0.9})`;
        ctx.fill();

        // Long flame trail — straight down from rocket base
        const flameBase = headY + r.size * 1.5;

        // Outer flame (orange/gold)
        const flameGrad = ctx.createLinearGradient(r.x, flameBase, r.x, flameBase + r.flameLen);
        flameGrad.addColorStop(0, `rgba(243, 182, 0, ${alpha * 0.9})`);
        flameGrad.addColorStop(0.3, `rgba(251, 146, 60, ${alpha * 0.7})`);
        flameGrad.addColorStop(0.7, `rgba(243, 182, 0, ${alpha * 0.3})`);
        flameGrad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.moveTo(r.x - r.size * 1.2, flameBase);
        ctx.lineTo(r.x, flameBase + r.flameLen);
        ctx.lineTo(r.x + r.size * 1.2, flameBase);
        ctx.closePath();
        ctx.fillStyle = flameGrad;
        ctx.fill();

        // Inner flame (bright core)
        const innerLen = r.flameLen * 0.45;
        ctx.beginPath();
        ctx.moveTo(r.x - r.size * 0.4, flameBase);
        ctx.lineTo(r.x, flameBase + innerLen);
        ctx.lineTo(r.x + r.size * 0.4, flameBase);
        ctx.closePath();
        ctx.fillStyle = `rgba(255, 250, 220, ${alpha * 0.7})`;
        ctx.fill();

        // Engine glow (simple circle, no gradient)
        ctx.beginPath();
        ctx.arc(r.x, flameBase, r.size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243, 182, 0, ${alpha * 0.2})`;
        ctx.fill();

        if (r.life >= r.maxLife) rockets.splice(i, 1);
      }

      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
      for (const star of stars) {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      }
      renderNebula();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
}

// Orbital ring (static border circle that rotates)
function OrbitalRing({ delay = 0, size = 500, opacity = 0.08 }: { delay?: number; size?: number; opacity?: number }) {
  return (
    <motion.div
      className="absolute rounded-full border pointer-events-none"
      style={{
        width: size,
        height: size,
        left: '50%',
        top: '50%',
        marginLeft: -size / 2,
        marginTop: -size / 2,
        borderColor: `rgba(100, 244, 210, ${opacity})`,
      }}
      initial={{ rotate: 0, scale: 0.8, opacity: 0 }}
      animate={{ rotate: 360, scale: 1, opacity: 1 }}
      transition={{
        rotate: { duration: 60 + delay * 10, repeat: Infinity, ease: 'linear' },
        scale: { duration: 2, delay: delay * 0.3 },
        opacity: { duration: 2, delay: delay * 0.3 },
      }}
    />
  );
}

// Planet that orbits on a ring — fades in, orbits continuously, then fades out after a while
function OrbitingPlanet({ ringSize }: { ringSize: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext('2d');
    if (!maybeCtx) return;
    const ctx = maybeCtx;

    const padding = 40; // extra space for glow
    const size = ringSize + padding * 2;
    canvas.width = size;
    canvas.height = size;

    const center = size / 2;
    const radius = ringSize / 2;
    const colors = ['#64f4d2', '#F3B600', '#8b5cf6', '#4d9fff'];

    let animId: number;
    let planet: {
      angle: number;
      speed: number;
      color: string;
      size: number;
      hasRing: boolean;
      opacity: number;
      phase: 'in' | 'orbit' | 'out' | 'wait';
      timer: number;
      orbitDuration: number;
    } = {
      angle: 0, speed: 0, color: '', size: 0, hasRing: false,
      opacity: 0, phase: 'wait', timer: 120 + Math.random() * 180,
      orbitDuration: 0,
    };

    function spawnPlanet() {
      planet.angle = Math.random() * Math.PI * 2;
      planet.speed = 0.003 + Math.random() * 0.002; // radians per frame
      planet.color = colors[Math.floor(Math.random() * colors.length)];
      planet.size = 10 + Math.random() * 8;
      planet.hasRing = Math.random() > 0.4;
      planet.opacity = 0;
      planet.phase = 'in';
      planet.timer = 0;
      planet.orbitDuration = 600 + Math.random() * 600; // frames to orbit before fading out
    }

    function draw() {
      ctx.clearRect(0, 0, size, size);

      if (planet.phase === 'wait') {
        planet.timer--;
        if (planet.timer <= 0) spawnPlanet();
        animId = requestAnimationFrame(draw);
        return;
      }

      // Update phase
      if (planet.phase === 'in') {
        planet.opacity = Math.min(1, planet.opacity + 0.015);
        if (planet.opacity >= 1) {
          planet.phase = 'orbit';
          planet.timer = planet.orbitDuration;
        }
      } else if (planet.phase === 'orbit') {
        planet.timer--;
        if (planet.timer <= 0) planet.phase = 'out';
      } else if (planet.phase === 'out') {
        planet.opacity = Math.max(0, planet.opacity - 0.01);
        if (planet.opacity <= 0) {
          planet.phase = 'wait';
          planet.timer = 300 + Math.random() * 500; // wait before next
          animId = requestAnimationFrame(draw);
          return;
        }
      }

      // Move
      planet.angle += planet.speed;

      const px = center + Math.cos(planet.angle) * radius;
      const py = center + Math.sin(planet.angle) * radius;
      const ps = planet.size;
      const alpha = planet.opacity;

      // Glow
      ctx.beginPath();
      ctx.arc(px, py, ps * 2, 0, Math.PI * 2);
      const glow = ctx.createRadialGradient(px, py, 0, px, py, ps * 2);
      glow.addColorStop(0, planet.color + hex(alpha * 0.2));
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.arc(px, py, ps / 2, 0, Math.PI * 2);
      const bodyGrad = ctx.createRadialGradient(
        px - ps * 0.15, py - ps * 0.15, 0,
        px, py, ps / 2
      );
      bodyGrad.addColorStop(0, planet.color + hex(alpha));
      bodyGrad.addColorStop(1, `rgba(10, 14, 39, ${alpha * 0.9})`);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Ring
      if (planet.hasRing) {
        ctx.save();
        ctx.translate(px, py);
        ctx.scale(1, 0.35);
        ctx.beginPath();
        ctx.arc(0, 0, ps * 0.9, 0, Math.PI * 2);
        ctx.strokeStyle = planet.color + hex(alpha * 0.4);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();
      }

      animId = requestAnimationFrame(draw);
    }

    // hex helper: converts 0-1 alpha to 2-char hex
    function hex(a: number) {
      return Math.round(Math.max(0, Math.min(1, a)) * 255).toString(16).padStart(2, '0');
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [ringSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute pointer-events-none"
      style={{
        width: ringSize + 80,
        height: ringSize + 80,
        left: '50%',
        top: '50%',
        marginLeft: -(ringSize + 80) / 2,
        marginTop: -(ringSize + 80) / 2,
        zIndex: 3,
        opacity: 0.5,
      }}
    />
  );
}

export function HeroClient({ stats }: { stats: { label: string; value: string }[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden min-h-[85vh] sm:min-h-screen flex items-center pt-20"
    >
      <NebulaCanvas />

      <div className="absolute inset-0 bg-gradient-to-b from-cosmic-blue/30 via-transparent to-deep-space pointer-events-none" style={{ zIndex: 1 }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(10,14,39,0.4)_100%)] pointer-events-none" style={{ zIndex: 1 }} />

      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
        <OrbitalRing delay={0} size={600} opacity={0.05} />
        <OrbitalRing delay={1} size={800} opacity={0.03} />
        <OrbitalRing delay={2} size={1000} opacity={0.02} />
        <OrbitingPlanet ringSize={600} />
        <OrbitingPlanet ringSize={1000} />
      </div>

      <motion.div
        className="relative mx-auto max-w-6xl text-center px-6 lg:px-8"
        style={{ y: heroY, opacity: heroOpacity, zIndex: 2 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="inline-block mb-4 sm:mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="font-accent text-xs sm:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase text-aurora-cyan/70 border border-aurora-cyan/20 px-4 py-2 rounded-full backdrop-blur-sm bg-aurora-cyan/5">
              Český raketový spolek
            </span>
          </motion.div>

          <h1 className="font-heading text-5xl font-bold tracking-tight text-stellar-white sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9]">
            Czech Rocket
          </h1>
          <motion.h1
            className="font-heading text-5xl font-bold tracking-tight sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9]"
            style={{
              backgroundImage: 'linear-gradient(135deg, #64f4d2 0%, #4d9fff 40%, #64f4d2 60%, #F3B600 100%)',
              backgroundSize: '300% 100%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          >
            Society
          </motion.h1>
        </motion.div>

        <motion.p
          className="mt-5 sm:mt-8 text-base leading-relaxed text-moon-gray sm:text-xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          Všichni jsme kdysi chtěli ke hvězdám. My jsme se rozhodli to zkusit doopravdy.{' '}
          <span className="text-aurora-cyan">Pojď do toho s námi.</span>
        </motion.p>

        <motion.div
          className="mt-8 sm:mt-12 flex items-center justify-center gap-3 sm:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link href="/projekty">
            <motion.div
              className="group relative rounded-full px-6 py-3 sm:px-8 sm:py-4 font-heading font-bold text-deep-space shadow-2xl overflow-hidden cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #64f4d2, #4d9fff)' }}
              whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(100, 244, 210, 0.4)' }}
              whileTap={{ scale: 0.97 }}
            >
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, #4d9fff, #64f4d2)' }}
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
              <span className="relative z-10 text-base sm:text-lg">Naše projekty</span>
            </motion.div>
          </Link>

          <Link href="/nabor">
            <motion.div
              className="group font-heading text-base sm:text-lg text-stellar-white/90 flex items-center gap-2 cursor-pointer border border-stellar-white/20 rounded-full px-6 py-3 sm:px-8 sm:py-4 backdrop-blur-sm bg-stellar-white/5 hover:border-aurora-cyan/50 hover:bg-aurora-cyan/5 transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Připoj se
              <motion.span
                className="text-aurora-cyan"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          </Link>
        </motion.div>

        <motion.div
          className="mt-10 sm:mt-20 grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center relative"
              whileHover={{ scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              {i > 0 && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-8 bg-gradient-to-b from-transparent via-aurora-cyan/30 to-transparent" />
              )}
              <div className="font-heading text-3xl sm:text-4xl font-bold bg-gradient-to-r from-aurora-cyan to-aurora-blue bg-clip-text text-transparent">
                {stat.value}
              </div>
              <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-moon-gray/80 font-accent uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:block"
        style={{ zIndex: 2 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-10 rounded-full border border-aurora-cyan/30 flex items-start justify-center p-2 backdrop-blur-sm bg-aurora-cyan/5">
            <motion.div
              className="w-1 h-2 rounded-full bg-aurora-cyan/60"
              animate={{ y: [0, 14, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
