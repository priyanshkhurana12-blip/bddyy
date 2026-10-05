import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LoveLetter } from '../types/anniversary';
import { sound } from '../utils/audio';

interface LoveLetterStageProps {
  letter: LoveLetter;
  partnerName: string;
  senderName: string;
  onNext: () => void;
}

export const LoveLetterStage: React.FC<LoveLetterStageProps> = ({
  letter,
  partnerName,
  senderName,
  onNext
}) => {
  const [isUnsealed, setIsUnsealed] = useState(false);

  const handleBreakSeal = () => {
    if (isUnsealed) return;
    sound.playMagicSparkle();
    setIsUnsealed(true);
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-center relative z-10 select-none max-w-3xl mx-auto">
      {/* Stage Header */}
      <div className="text-center mb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-amber-400/80 font-medium">
          Confidential & From The Heart
        </span>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-white mt-1">
          A Letter For {partnerName}
        </h2>
      </div>

      {/* Envelope & Parchment Container */}
      <div className="w-full flex flex-col items-center">
        {!isUnsealed ? (
          /* Sealed Envelope View */
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg aspect-[4/3] bg-gradient-to-br from-[#1c1524] to-[#2a1d36] rounded-2xl border border-amber-500/30 p-8 shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center relative cursor-pointer group hover:border-amber-400/50 transition-colors"
            onClick={handleBreakSeal}
          >
            {/* Ambient Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 to-amber-500/10 rounded-2xl pointer-events-none" />

            <p className="font-script text-3xl text-amber-200/90 mb-4">
              For My Billu
            </p>

            {/* Wax Seal */}
            <motion.div
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-rose-700 via-rose-800 to-rose-950 border-2 border-rose-400/60 shadow-[0_8px_20px_rgba(225,29,72,0.5)] flex items-center justify-center relative group"
            >
              {/* Inner ring */}
              <div className="w-16 h-16 rounded-full border border-rose-300/40 flex items-center justify-center">
                <span className="text-2xl text-rose-100 drop-shadow">❤️</span>
              </div>
            </motion.div>

            <motion.p
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mt-6 text-xs md:text-sm text-amber-200/80 font-serif italic"
            >
              Tap the wax seal to break & read the letter
            </motion.p>
          </motion.div>
        ) : (
          /* Unfolded Parchment Letter View */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full bg-[#fdfbf7] text-[#2c1d11] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-6 md:p-12 relative overflow-hidden border border-[#e5d8b8]"
          >
            {/* Vintage paper texture effects */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-900/10 pointer-events-none" />

            {/* Gold foil header ornament */}
            <div className="text-center mb-6">
              <div className="text-amber-700/60 text-lg">❦ ❧</div>
              <h3 className="text-xl md:text-2xl font-serif font-bold text-[#3d2415] tracking-wide mt-1">
                {letter.title || 'A Love Letter to You'}
              </h3>
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-700/40 to-transparent mx-auto mt-2" />
            </div>

            {/* Salutation */}
            <p className="font-serif italic text-lg text-[#3d2415] font-semibold mb-4">
              {letter.salutation || `To my dearest ${partnerName},`}
            </p>

            {/* Paragraphs */}
            <div className="space-y-4 font-serif text-[#332215] text-sm md:text-base leading-relaxed">
              {letter.paragraphs.map((p, idx) => (
                <p key={idx} className="indent-4 md:indent-6">
                  {p}
                </p>
              ))}
            </div>

            {/* Sign-off */}
            <div className="mt-8 text-right font-serif">
              <p className="italic text-sm text-[#5c3e29]">{letter.signOff}</p>
              <p className="font-script text-3xl md:text-4xl text-[#7c2d12] mt-1">
                {senderName}
              </p>
            </div>

            {/* P.S. */}
            {letter.ps && letter.ps.trim() !== '' && (
              <div className="mt-6 pt-4 border-t border-amber-900/10 font-serif italic text-xs md:text-sm text-[#784f33]">
                {letter.ps}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Proceed to Memories Button */}
      <AnimatePresence>
        {isUnsealed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex justify-center"
          >
            <button
              onClick={onNext}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold tracking-wide rounded-full shadow-xl shadow-amber-500/25 active:scale-95 transition-all cursor-pointer text-sm md:text-base flex items-center gap-3"
            >
              <span>🎈</span>
              <span>Pop The Balloons ➜</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
