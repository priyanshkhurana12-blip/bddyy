import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface GiftBoxStageProps {
  onOpen: () => void;
  partnerName: string;
}

export const GiftBoxStage: React.FC<GiftBoxStageProps> = ({ onOpen, partnerName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpenGift = () => {
    if (isOpen) return;
    setIsOpen(true);
    sound.playMagicSparkle();

    // Blast celebratory confetti in romantic colors
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#fda4af', '#fef08a', '#ffffff']
      });

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#f43f5e', '#fda4af']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#f43f5e', '#fda4af']
        });
      }, 300);
    } catch {
      // Confetti fallback
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10 select-none">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="flex flex-col items-center max-w-md w-full text-center"
      >
        {/* Title */}
        <div className="mb-8">
          <p className="font-serif italic text-amber-300/80 text-sm md:text-base tracking-wider uppercase mb-1">
            A Special 19th Birthday Delivery For
          </p>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-white drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
            {partnerName} ✨
          </h1>
        </div>

        {/* Gift Box Container */}
        <div
          onClick={handleOpenGift}
          className="relative w-64 h-64 cursor-pointer group flex items-center justify-center mb-8"
        >
          {/* Ambient Glow */}
          <div className="absolute inset-4 bg-gradient-to-r from-amber-500/20 to-rose-500/20 blur-2xl rounded-full group-hover:scale-110 transition-transform duration-500" />

          {/* Emerging surprise when opened */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.3 }}
                animate={{ opacity: 1, y: -95, scale: 1 }}
                transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.2 }}
                className="absolute z-30 flex flex-col items-center pointer-events-none"
              >
                <img
                  src="/cat-cake.png"
                  alt="Birthday kitten holding a cake with balloons"
                  className="w-44 md:w-52 h-auto drop-shadow-[0_12px_25px_rgba(0,0,0,0.6)] object-contain select-none"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 3D Gift Box Body & Lid */}
          <div className="relative z-20 flex flex-col items-center">
            {/* Lid */}
            <motion.div
              animate={
                isOpen
                  ? { y: -80, rotate: -20, opacity: 0 }
                  : { y: [0, -3, 0] }
              }
              transition={
                isOpen
                  ? { duration: 0.5 }
                  : { repeat: Infinity, duration: 2.5, ease: 'easeInOut' }
              }
              className="relative w-44 h-12 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 rounded-t-lg shadow-xl flex items-center justify-center border-b-2 border-amber-800"
            >
              {/* Ribbon Bow on top */}
              <div className="absolute -top-6 flex items-center justify-center">
                <div className="w-7 h-7 border-4 border-rose-500 rounded-full transform -rotate-45 shadow-sm" />
                <div className="w-7 h-7 border-4 border-rose-500 rounded-full transform rotate-45 shadow-sm -ml-2" />
                <div className="w-3.5 h-3.5 bg-rose-600 rounded-full absolute" />
              </div>

              {/* Vertical Lid Ribbon */}
              <div className="w-6 h-full bg-rose-500 shadow-inner" />
            </motion.div>

            {/* Box Body */}
            <motion.div
              animate={isOpen ? { scale: 0.95 } : { scale: 1 }}
              className="w-40 h-36 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-950 rounded-b-xl shadow-2xl relative flex items-center justify-center overflow-hidden border border-amber-500/30"
            >
              {/* Vertical Ribbon */}
              <div className="w-6 h-full bg-rose-500 shadow-inner" />

              {/* Horizontal Ribbon */}
              <div className="absolute w-full h-6 bg-rose-500 shadow-inner" />

              {/* Sparkle badge */}
              <div className="absolute z-10 w-8 h-8 rounded-full bg-amber-400/30 flex items-center justify-center text-xs">
                ✨
              </div>
            </motion.div>
          </div>
        </div>

        {/* Hint text / Proceed Button */}
        {!isOpen ? (
          <motion.p
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm md:text-base font-serif text-amber-200/90 tracking-wide"
          >
            🎁 Tap the gift to open your birthday surprise!
          </motion.p>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col items-center gap-3"
          >
            <button
              onClick={onOpen}
              className="mt-4 px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold tracking-wide rounded-full shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer text-sm md:text-base flex items-center gap-2"
            >
              <span>🎂</span>
              <span>Continue to Cake ➜</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
