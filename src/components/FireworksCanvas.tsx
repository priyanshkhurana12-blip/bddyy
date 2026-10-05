import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';

interface FireworksCanvasProps {
  onDone: () => void;
  partnerName: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
  color: string;
  size: number;
  flicker: boolean;
}

export const FireworksCanvas: React.FC<FireworksCanvasProps> = ({ onDone, partnerName }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [countdown, setCountdown] = useState<number | null>(3);
  const [showHeartMessage, setShowHeartMessage] = useState(false);

  // Countdown timer: 3, 2, 1, then start fireworks
  useEffect(() => {
    if (countdown === null) return;

    sound.playCountdownChime(countdown);

    if (countdown > 1) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCountdown(null);
        sound.playFireworkBurst();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Canvas fireworks animation
  useEffect(() => {
    if (countdown !== null) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#f43f5e', '#fda4af', '#ffffff'];

    // Spawn standard golden burst
    const createBurst = (x: number, y: number, count = 70, customColor?: string) => {
      sound.playFireworkBurst();
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 1.5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          decay: Math.random() * 0.015 + 0.012,
          color: customColor || colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 2.8 + 1.2,
          flicker: Math.random() > 0.4
        });
      }
    };

    // Heart firework formation (parametric heart curve)
    const createHeartBurst = (cx: number, cy: number) => {
      sound.playFireworkBurst();
      setShowHeartMessage(true);
      const points = 120;
      for (let i = 0; i < points; i++) {
        const t = (i / points) * Math.PI * 2;
        // Heart curve formula
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        const scale = Math.min(width, height) * 0.014;
        const targetX = cx + hx * scale;
        const targetY = cy + hy * scale;

        const vx = (targetX - cx) * 0.06;
        const vy = (targetY - cy) * 0.06;

        particles.push({
          x: cx,
          y: cy,
          vx,
          vy,
          alpha: 1,
          decay: 0.007, // lasts longer
          color: i % 2 === 0 ? '#fb7185' : '#fef08a',
          size: 3.2,
          flicker: true
        });
      }
    };

    // Trigger initial burst
    createBurst(width * 0.5, height * 0.35, 90);

    // Sequence of bursts
    const timers: number[] = [
      window.setTimeout(() => createBurst(width * 0.28, height * 0.4, 75, '#fbbf24'), 700),
      window.setTimeout(() => createBurst(width * 0.72, height * 0.38, 75, '#f43f5e'), 1400),
      window.setTimeout(() => createBurst(width * 0.45, height * 0.28, 80, '#fef08a'), 2100),
      // Grand Heart Formation
      window.setTimeout(() => createHeartBurst(width * 0.5, height * 0.42), 3000),
      // Extra sparkle shower
      window.setTimeout(() => createBurst(width * 0.3, height * 0.25, 55, '#fef08a'), 3800),
      window.setTimeout(() => createBurst(width * 0.7, height * 0.25, 55, '#f43f5e'), 4400),
      window.setTimeout(() => createBurst(width * 0.5, height * 0.3, 70, '#fbbf24'), 5400)
    ];

    // Keep periodic firework bursts alive while the user enjoys the moment
    const interval = window.setInterval(() => {
      const randX = width * (0.2 + Math.random() * 0.6);
      const randY = height * (0.2 + Math.random() * 0.35);
      createBurst(randX, randY, Math.floor(Math.random() * 25 + 45));
    }, 1800);

    const render = () => {
      // Trail effect
      ctx.fillStyle = 'rgba(11, 9, 16, 0.2)';
      ctx.fillRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.vx *= 0.98; // friction
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.flicker ? 8 : 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      timers.forEach(t => clearTimeout(t));
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, [countdown, onDone]);

  return (
    <div className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[#0b0910] overflow-hidden select-none">
      {/* Skip Button */}
      <button
        onClick={onDone}
        className="absolute top-6 right-6 z-50 px-4 py-2 text-xs md:text-sm font-medium tracking-wide text-amber-200/80 hover:text-amber-100 bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-full border border-amber-500/20 transition-all cursor-pointer active:scale-95"
      >
        Skip ›
      </button>

      {/* Countdown overlay */}
      <AnimatePresence mode="wait">
        {countdown !== null && (
          <motion.div
            key={countdown}
            initial={{ scale: 0.35, opacity: 0, filter: 'blur(18px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.8, opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="text-8xl md:text-9xl font-display font-bold gold-gradient-text tracking-widest drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]">
              {countdown}
            </div>
            <div className="mt-4 text-sm md:text-base tracking-[0.3em] uppercase text-amber-300/80 font-medium">
              Preparing Your Surprise
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fireworks canvas */}
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${countdown === null ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Beautiful Happy Birthday Text Overlay when crackers burst */}
      <AnimatePresence>
        {countdown === null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 25, filter: 'blur(12px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="absolute z-30 flex flex-col items-center justify-center text-center pointer-events-none px-4 max-w-2xl"
          >
            {/* Soft decorative sparkling pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-amber-400/30 backdrop-blur-md mb-2 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
            >
              <span className="text-rose-400 text-sm animate-pulse">✨</span>
              <span className="font-serif italic text-xs md:text-sm text-amber-200 tracking-wider">
                Celebrating Your Special Day
              </span>
              <span className="text-rose-400 text-sm animate-pulse">✨</span>
            </motion.div>

            {/* Script Calligraphy */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="font-script text-4xl sm:text-6xl md:text-7xl text-rose-300 drop-shadow-[0_0_25px_rgba(244,63,94,0.7)]"
            >
              Happy Birthday
            </motion.p>

            {/* Grand Partner Name in Radiant Gold */}
            <motion.h1
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, duration: 0.9, type: 'spring' }}
              className="font-display font-extrabold text-4xl sm:text-6xl md:text-7xl gold-gradient-text tracking-wider uppercase mt-1 drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]"
            >
              {partnerName} 💖
            </motion.h1>

            {/* Warm Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="font-serif italic text-xs sm:text-sm md:text-base text-slate-200/90 mt-3 max-w-md leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
            >
              "May this 19th year bring endless happiness, gentle smiles, and all the love your heart can hold." ✨
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Heart message on canvas */}
      <AnimatePresence>
        {showHeartMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="absolute bottom-24 sm:bottom-28 z-40 text-center pointer-events-none px-4"
          >
            <p className="font-script text-2xl sm:text-3xl text-rose-300 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)]">
              Forever & Always
            </p>
            <p className="font-serif italic text-xs text-amber-200/90 mt-0.5">
              With all my love ❤️
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap to Continue Button after countdown */}
      <AnimatePresence>
        {countdown === null && (
          <motion.div
            initial={{ opacity: 0, y: 25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="absolute bottom-7 sm:bottom-9 z-50 flex flex-col items-center"
          >
            <button
              onClick={onDone}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-amber-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-rose-500/30 border border-amber-300/40 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 animate-pulse"
            >
              <span>💖</span>
              <span>Tap to Continue ➜</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
