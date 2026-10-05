import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface BalloonPopStageProps {
  partnerName: string;
  onNext: () => void;
}

interface CharInfo {
  index: number;
  char: string;
  wordIndex: number;
}

// Target sentence broken down by words
const WORDS = ['HAPPY', 'BIRTHDAY', 'CUTIE', '&', 'YOU', 'ARE', 'AMAZING'];

// Color palette for balloons: All shades of romantic pink and red
const BALLOON_COLORS = [
  { bg: 'from-rose-500 to-pink-600', shadow: 'rgba(244,63,94,0.45)', text: 'text-rose-100', glow: '#f43f5e' },
  { bg: 'from-red-600 to-rose-700', shadow: 'rgba(225,29,72,0.45)', text: 'text-red-100', glow: '#e11d48' },
  { bg: 'from-pink-400 to-rose-500', shadow: 'rgba(244,114,182,0.45)', text: 'text-pink-100', glow: '#f472b6' },
  { bg: 'from-red-500 to-red-700', shadow: 'rgba(239,68,68,0.45)', text: 'text-red-100', glow: '#dc2626' },
  { bg: 'from-pink-500 to-rose-600', shadow: 'rgba(236,72,153,0.45)', text: 'text-pink-100', glow: '#ec4899' },
  { bg: 'from-rose-600 to-red-600', shadow: 'rgba(244,63,94,0.45)', text: 'text-rose-100', glow: '#be123c' },
];

export const BalloonPopStage: React.FC<BalloonPopStageProps> = ({
  partnerName,
  onNext
}) => {
  // Flatten characters with metadata
  const characters: CharInfo[] = [];
  let charCounter = 0;
  WORDS.forEach((word, wIdx) => {
    for (let i = 0; i < word.length; i++) {
      characters.push({
        index: charCounter,
        char: word[i],
        wordIndex: wIdx
      });
      charCounter++;
    }
  });

  const totalChars = characters.length; // 22 characters
  const [poppedSet, setPoppedSet] = useState<Set<number>>(new Set());
  const [lastPopped, setLastPopped] = useState<number | null>(null);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; char: string; color: string }>>([]);

  const isAllPopped = poppedSet.size === totalChars;

  // Sound and confetti on completion
  useEffect(() => {
    if (isAllPopped) {
      sound.playMagicSparkle();

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#ec4899', '#38bdf8', '#a855f7', '#fbbf24']
      });

      const timer = setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 80,
          origin: { x: 0, y: 0.6 }
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 80,
          origin: { x: 1, y: 0.6 }
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [isAllPopped]);

  // Pop a specific balloon
  const handlePop = useCallback((index: number, e?: React.MouseEvent) => {
    if (poppedSet.has(index)) return;

    sound.playBalloonPop(index);

    // Spawn floating pop sparkle
    if (e) {
      const rect = e.currentTarget.getBoundingClientRect();
      const sparkColor = BALLOON_COLORS[index % BALLOON_COLORS.length].glow;
      const newSpark = {
        id: Date.now() + Math.random(),
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        char: characters[index].char,
        color: sparkColor
      };
      setSparkles(prev => [...prev, newSpark]);
      setTimeout(() => {
        setSparkles(prev => prev.filter(s => s.id !== newSpark.id));
      }, 1200);
    }

    setPoppedSet(prev => new Set(prev).add(index));
    setLastPopped(index);
  }, [poppedSet, characters]);

  // Pop the next available balloon
  const handlePopNext = () => {
    for (let i = 0; i < totalChars; i++) {
      if (!poppedSet.has(i)) {
        handlePop(i);
        break;
      }
    }
  };

  // Reset / Inflate balloons again
  const handleReset = () => {
    setPoppedSet(new Set());
    setLastPopped(null);
    sound.playTone(440, 0.2, 'triangle', 0.2);
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center relative select-none">
      {/* Sparkles Floating Up on Pop */}
      {sparkles.map(s => (
        <motion.div
          key={s.id}
          initial={{ opacity: 1, scale: 0.5, y: 0 }}
          animate={{ opacity: 0, scale: 1.8, y: -80 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ left: s.x, top: s.y, color: s.color }}
          className="fixed pointer-events-none z-50 font-display font-black text-2xl -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_10px_currentColor]"
        >
          {s.char}
        </motion.div>
      ))}

      {/* Main Glass Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl w-full flex flex-col items-center text-center"
      >
        {/* Header Title */}
        <div className="mb-6">
          <span className="font-script text-3xl md:text-4xl text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
            ✨ Pop The Balloons ✨
          </span>
          <h1 className="mt-1 text-2xl md:text-4xl font-display font-bold gold-gradient-text tracking-wide drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
            A Secret Birthday Message For {partnerName}
          </h1>
          <p className="mt-1.5 text-xs md:text-sm text-slate-300/80 font-serif italic max-w-md mx-auto">
            Pop each floating balloon to reveal the hidden phrase! 🎈
          </p>
        </div>

        {/* The Phrase Board (Glowing Letter Slots) */}
        <div className="w-full max-w-3xl my-4 p-5 md:p-7 rounded-2xl bg-white/[0.04] border border-amber-500/25 backdrop-blur-md shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-amber-500/5 to-purple-500/5 pointer-events-none" />

          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs text-amber-300/80 mb-4 px-1 font-serif">
            <span>Secret Message Board:</span>
            <span className="font-mono font-semibold">
              {poppedSet.size} / {totalChars} Letters Revealed
            </span>
          </div>

          {/* Words Container */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 sm:gap-x-6 gap-y-3">
            {WORDS.map((word, wIdx) => {
              // Get character indices belonging to this word
              const wordChars = characters.filter(c => c.wordIndex === wIdx);

              return (
                <div
                  key={wIdx}
                  className="flex items-center gap-1 sm:gap-1.5 p-1 rounded-xl bg-black/20 border border-white/5"
                >
                  {wordChars.map(({ index, char }) => {
                    const isRevealed = poppedSet.has(index);
                    const isJustPopped = lastPopped === index;

                    return (
                      <motion.div
                        key={index}
                        initial={false}
                        animate={
                          isRevealed
                            ? isJustPopped
                              ? { scale: [0.6, 1.25, 1], rotate: [0, -6, 0] }
                              : { scale: 1 }
                            : { scale: 1 }
                        }
                        transition={{ duration: 0.35, ease: 'easeOut' }}
                        className={`w-7 h-9 sm:w-9 sm:h-11 md:w-10 md:h-12 flex items-center justify-center rounded-md sm:rounded-lg font-display text-sm sm:text-lg md:text-xl font-bold transition-all ${
                          isRevealed
                            ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-rose-500 text-slate-950 shadow-md shadow-amber-500/30 border border-amber-300'
                            : 'bg-white/[0.03] border border-amber-500/20 text-slate-600'
                        }`}
                      >
                        {isRevealed ? (
                          <span>{char}</span>
                        ) : (
                          <span className="text-[10px] text-amber-400/40">?</span>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Completed Message Banner */}
          <AnimatePresence>
            {isAllPopped && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 20 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5 }}
                className="pt-4 border-t border-amber-400/20 text-center"
              >
                <motion.p
                  animate={{ scale: [0.98, 1.02, 0.98] }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                  className="font-script text-2xl md:text-3xl text-rose-300 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                >
                  "Happy Birthday Cutie & You Are Amazing, {partnerName}!" 💖
                </motion.p>
                <p className="mt-1 text-xs md:text-sm text-amber-200/90 font-serif italic">
                  Always remember how deeply cherished and truly special you are.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Quick controls bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 my-4">
          {!isAllPopped ? (
            <button
              onClick={handlePopNext}
              className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <span>🎯</span>
              <span>Pop Next Balloon</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <span>🔄</span>
                <span>Inflate Again 🎈</span>
              </button>
              <button
                onClick={onNext}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs md:text-sm font-bold shadow-lg shadow-amber-500/25 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <span>📸</span>
                <span>Continue to Memories ➜</span>
              </button>
            </>
          )}
        </div>

        {/* Floating Balloons Cluster / Field */}
        <div className="w-full mt-4 p-4 md:p-6 rounded-2xl bg-black/20 border border-white/5 backdrop-blur-sm">
          <p className="text-[11px] text-amber-300/70 font-serif mb-4 italic">
            Tap any balloon below to pop it and release its letter:
          </p>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 gap-3 md:gap-4 justify-items-center">
            {characters.map(({ index, char }) => {
              const isPopped = poppedSet.has(index);
              const color = BALLOON_COLORS[index % BALLOON_COLORS.length];
              const floatDelay = (index * 0.15) % 2;
              const floatDuration = 2.2 + (index % 4) * 0.3;

              return (
                <div key={index} className="w-14 h-24 flex flex-col items-center justify-center">
                  <AnimatePresence mode="wait">
                    {!isPopped ? (
                      <motion.div
                        key="balloon"
                        onClick={(e) => handlePop(index, e)}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{
                          scale: 1,
                          opacity: 1,
                          y: [-4, 5, -4],
                          rotate: [-3, 3, -3]
                        }}
                        exit={{
                          scale: [1, 1.4, 0],
                          opacity: [1, 0.8, 0],
                          transition: { duration: 0.25 }
                        }}
                        transition={{
                          y: { repeat: Infinity, duration: floatDuration, ease: 'easeInOut', delay: floatDelay },
                          rotate: { repeat: Infinity, duration: floatDuration + 0.5, ease: 'easeInOut', delay: floatDelay }
                        }}
                        whileHover={{ scale: 1.15, cursor: 'pointer' }}
                        whileTap={{ scale: 0.9 }}
                        className="relative flex flex-col items-center group cursor-pointer"
                        title={`Tap to pop balloon #${index + 1}`}
                      >
                        {/* Balloon Oval */}
                        <div
                          style={{
                            boxShadow: `0 8px 18px ${color.shadow}`
                          }}
                          className={`w-11 h-14 rounded-full bg-gradient-to-br ${color.bg} relative flex items-center justify-center shadow-lg transition-transform`}
                        >
                          {/* Top-Left Gloss Highlight */}
                          <div className="absolute top-1.5 left-2 w-3 h-4 rounded-full bg-white/40 blur-[0.5px] transform -rotate-25 pointer-events-none" />

                          {/* Balloon Number Badge */}
                          <span className={`text-[10px] font-mono font-bold ${color.text} drop-shadow-sm select-none`}>
                            {index + 1}
                          </span>
                        </div>

                        {/* Balloon Knot */}
                        <div className={`w-2 h-1.5 -mt-0.5 rounded-b-sm bg-gradient-to-r ${color.bg}`} />

                        {/* Dangling String */}
                        <div className="w-0.5 h-6 bg-slate-400/40 rounded-full origin-top transform group-hover:scale-y-110 transition-transform" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="popped-tile"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.5 }}
                        className="w-10 h-10 rounded-full border border-dashed border-amber-400/30 flex items-center justify-center text-[11px] text-amber-200/50 font-mono"
                      >
                        {char}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA when all revealed */}
        {isAllPopped && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <button
              onClick={onNext}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold rounded-full shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2 text-sm md:text-base mx-auto"
            >
              <span>📸</span>
              <span>Step Into Our Memories ➜</span>
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
