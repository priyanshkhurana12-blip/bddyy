import React, { useState } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { LoveReason } from '../types/anniversary';
import { sound } from '../utils/audio';

interface ReasonsStageProps {
  reasons: LoveReason[];
  partnerName: string;
  senderName: string;
  onRestart: () => void;
}

export const ReasonsStage: React.FC<ReasonsStageProps> = ({
  reasons,
  partnerName,
  senderName,
  onRestart
}) => {
  const [activeReason, setActiveReason] = useState<number | null>(null);

  const handleCelebrate = () => {
    sound.playMagicSparkle();
    try {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#fda4af', '#fef08a', '#ffffff']
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-start relative z-10 select-none max-w-4xl mx-auto text-center">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="font-script text-3xl md:text-4xl text-rose-300">
          A Thousand Reasons & More
        </span>
        <h2 className="text-3xl md:text-5xl font-display font-bold gold-gradient-text mt-1">
          Why I Adore You, {partnerName}
        </h2>
        <p className="mt-2 text-sm md:text-base text-slate-300/80 font-serif italic max-w-md mx-auto">
          Here are just a few of the million reasons you make my world complete on your 19th birthday.
        </p>
      </motion.div>

      {/* Grid of Reasons */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-12">
        {reasons.map((reason, idx) => {
          const isSelected = activeReason === idx;
          return (
            <motion.div
              key={reason.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => {
                setActiveReason(isSelected ? null : idx);
                sound.playTone(440 + idx * 40, 0.2, 'sine', 0.1);
              }}
              className={`p-6 rounded-2xl text-left border transition-all cursor-pointer backdrop-blur-md relative overflow-hidden ${
                isSelected
                  ? 'bg-gradient-to-br from-rose-950/60 to-amber-950/60 border-amber-400/60 shadow-xl shadow-rose-500/10'
                  : 'bg-white/[0.03] border-white/10 hover:border-amber-400/30 hover:bg-white/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl p-2 rounded-xl bg-white/5 border border-white/10">
                  {reason.emoji || '❤️'}
                </span>
                <h3 className="font-serif text-lg font-bold text-amber-200">
                  {reason.title}
                </h3>
              </div>
              <p className="text-sm text-slate-300/90 leading-relaxed font-serif pl-1">
                {reason.description}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Love Promise Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="w-full p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-amber-500/10 border border-amber-400/30 backdrop-blur-md relative mb-12"
      >
        <p className="font-script text-3xl text-rose-300 mb-2">
          My Birthday Wish & Promise
        </p>
        <p className="font-serif text-base md:text-lg text-slate-100 italic max-w-xl mx-auto">
          "I promise to celebrate you, hold your hand through every season, and make you smile just as brightly as you make me smile every day."
        </p>
        <p className="font-serif text-xs text-amber-300/80 tracking-widest uppercase mt-4">
          Forever Yours, {senderName}
        </p>
      </motion.div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={handleCelebrate}
          className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold rounded-full shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <span>🎉</span>
          <span>Celebrate Kajal's 19th Birthday!</span>
        </button>

        <button
          onClick={onRestart}
          className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold rounded-full transition-all cursor-pointer flex items-center gap-2 active:scale-95"
        >
          <span>🔄</span>
          <span>Relive The Surprise</span>
        </button>
      </div>
    </div>
  );
};
