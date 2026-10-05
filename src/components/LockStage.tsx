import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';

interface LockStageProps {
  correctPasskey: string;
  onUnlocked: () => void;
  partnerName: string;
}

export const LockStage: React.FC<LockStageProps> = ({
  correctPasskey,
  onUnlocked,
  partnerName
}) => {
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleUnlock = () => {
    if (inputVal.trim() === correctPasskey.trim()) {
      setError(false);
      sound.playMagicSparkle();
      onUnlocked();
    } else {
      setError(true);
      setShake(true);
      sound.playTone(200, 0.25, 'sawtooth', 0.2);
      setTimeout(() => setShake(false), 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleUnlock();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10 select-none">
      <motion.div
        initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8 }}
        className={`w-full max-w-sm p-8 rounded-3xl bg-white/[0.04] border border-amber-500/30 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center relative overflow-hidden ${
          shake ? 'animate-shake' : ''
        }`}
      >
        {/* Amber back aura */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Lock Icon */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow-lg mb-4"
        >
          🔒
        </motion.div>

        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-display font-bold gold-gradient-text tracking-wide">
          Private Surprise
        </h1>

        <p className="mt-1 text-xs md:text-sm text-slate-300/80 font-serif">
          Enter the passkey to unlock your birthday surprise
        </p>

        {/* Passkey Input */}
        <div className="w-full mt-6">
          <input
            type="text"
            value={inputVal}
            onChange={e => {
              setInputVal(e.target.value);
              if (error) setError(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Enter passkey"
            maxLength={10}
            inputMode="numeric"
            autoFocus
            className="w-full px-4 py-3 text-center text-lg tracking-widest bg-white/[0.06] border border-amber-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all font-mono"
          />
        </div>

        {/* Unlock Button */}
        <button
          onClick={handleUnlock}
          className="w-full mt-6 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold tracking-wider rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <span>🔓</span>
          <span>Unlock</span>
        </button>

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
          >
            <span>❌</span>
            <span>Wrong passkey, try again!</span>
          </motion.div>
        )}

        <div className="mt-6 text-[11px] text-slate-400/70 font-serif italic">
          Crafted with love for {partnerName}
        </div>
      </motion.div>
    </div>
  );
};
