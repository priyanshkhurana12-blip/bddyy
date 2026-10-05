import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface MainCakeStageProps {
  partnerName: string;
  anniversaryDate: string;
  celebrationTitle: string;
  anniversaryYearText: string;
  onOpenLetter: () => void;
}

export const MainCakeStage: React.FC<MainCakeStageProps> = ({
  partnerName,
  anniversaryDate: _anniversaryDate,
  celebrationTitle: _celebrationTitle,
  anniversaryYearText: _anniversaryYearText,
  onOpenLetter
}) => {
  const [candlesLit, setCandlesLit] = useState(true);
  const [showBlowEffect, setShowBlowEffect] = useState(false);

  const handleBlowCandles = () => {
    if (!candlesLit) return;
    sound.playBlowCandle();
    setShowBlowEffect(true);
    setCandlesLit(false);

    try {
      confetti({
        particleCount: 60,
        spread: 80,
        origin: { y: 0.7 },
        colors: ['#fef08a', '#fbbf24', '#f59e0b', '#fb7185']
      });
    } catch {
      // ignore
    }

    setTimeout(() => {
      setShowBlowEffect(false);
    }, 2000);
  };

  const candlePositions = [-38, -19, 0, 19, 38];

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center relative z-10 text-center select-none max-w-4xl mx-auto">
      {/* Hero Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <span className="font-script text-3xl md:text-4xl text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
          ✨ Forever My Favorite Human ✨
        </span>
        <h1 className="mt-1 text-3xl md:text-5xl font-display font-bold gold-gradient-text tracking-wide drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
          Happy 19th Birthday, {partnerName}! 🎂
        </h1>
        <p className="mt-2 text-sm md:text-base text-slate-300/80 font-serif italic max-w-lg mx-auto">
          19 looks so wonderful on you! Thank you for filling every day with your cute smile and boundless warmth. 💖
        </p>
      </motion.div>

      {/* Interactive Cake Scene */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative my-6 flex flex-col items-center"
      >
        {/* Ambient Candlelight Glow */}
        <div
          className={`absolute -top-12 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-1000 ${
            candlesLit ? 'bg-amber-500/25 opacity-100' : 'bg-transparent opacity-0'
          }`}
        />

        {/* The Cake */}
        <div className="relative flex flex-col items-center">
          {/* Candles Row */}
          <div className="relative h-14 w-48 flex justify-center items-end">
            {candlePositions.map((pos, idx) => (
              <div
                key={idx}
                style={{ transform: `translateX(${pos}px)` }}
                className="absolute bottom-0 flex flex-col items-center cursor-pointer group"
                onClick={handleBlowCandles}
              >
                {/* Flame */}
                <AnimatePresence>
                  {candlesLit && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      className="w-3.5 h-6 bg-gradient-to-t from-amber-500 via-yellow-300 to-white rounded-full animate-flame group-hover:scale-125 transition-transform"
                    />
                  )}
                </AnimatePresence>

                {/* Candle Wick */}
                <div className="w-0.5 h-2 bg-slate-900" />

                {/* Candle Stick */}
                <div className="w-2.5 h-10 bg-gradient-to-b from-amber-200 via-rose-200 to-amber-300 rounded-t-sm shadow-md" />
              </div>
            ))}
          </div>

          {/* Top Tier */}
          <div className="w-44 h-16 bg-gradient-to-b from-amber-100 via-rose-50 to-amber-200 rounded-t-2xl shadow-lg relative border-t-4 border-amber-300 flex items-center justify-center">
            {/* Frosting drips */}
            <div className="absolute top-0 inset-x-0 flex justify-between px-2 text-rose-300 text-xs">
              <span>🍓</span>
              <span>✨</span>
              <span>🍓</span>
              <span>✨</span>
              <span>🍓</span>
            </div>
            <div className="font-script text-rose-500 text-xl font-bold mt-2">
              Love You
            </div>
          </div>

          {/* Middle Tier */}
          <div className="w-60 h-20 bg-gradient-to-b from-rose-100 via-amber-100 to-rose-200 shadow-xl relative border-t-2 border-rose-300/40 flex items-center justify-center">
            <div className="flex gap-4 text-xs font-serif text-amber-800/70 uppercase tracking-widest font-semibold">
              <span>Forever</span>
              <span>•</span>
              <span>Always</span>
              <span>•</span>
              <span>Together</span>
            </div>
          </div>

          {/* Bottom Cake Plate & Stand */}
          <div className="w-72 h-4 bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 rounded-full shadow-2xl border-t border-yellow-100" />
          <div className="w-40 h-3 bg-amber-700/60 rounded-b-lg shadow-inner blur-[1px]" />
        </div>

        {/* Smoke drift when candles blown */}
        <AnimatePresence>
          {showBlowEffect && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 0.8, y: -40 }}
              exit={{ opacity: 0 }}
              className="absolute -top-10 text-slate-300 text-sm font-script pointer-events-none"
            >
              Wish made into the stars... ✨
            </motion.div>
          )}
        </AnimatePresence>

        {/* Blow Candles Action Button */}
        {candlesLit ? (
          <button
            onClick={handleBlowCandles}
            className="mt-6 px-6 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 hover:text-amber-100 font-medium text-sm rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg shadow-amber-500/10 flex items-center gap-2"
          >
            <span>🎂</span>
            <span>Tap to Blow Out Candles & Make a Wish</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 px-5 py-2 bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 font-medium text-sm rounded-full flex items-center gap-2"
          >
            <span>✨</span>
            <span>May all your wishes come true, sweetheart!</span>
          </motion.div>
        )}
      </motion.div>

      {/* Button to open Letter */}
      <motion.button
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        onClick={onOpenLetter}
        className="mt-6 px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold tracking-wide rounded-full shadow-xl shadow-rose-500/20 active:scale-95 transition-all cursor-pointer text-base flex items-center gap-3"
      >
        <span>💌</span>
        <span>Open Your Birthday Letter</span>
      </motion.button>
    </div>
  );
};
