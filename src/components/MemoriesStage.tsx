import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto } from '../types/anniversary';
import { sound } from '../utils/audio';

interface MemoriesStageProps {
  memories: MemoryPhoto[];
  partnerName: string;
  onNext: () => void;
  onOpenCustomize?: () => void;
}

export const MemoriesStage: React.FC<MemoriesStageProps> = ({
  memories,
  partnerName: _partnerName,
  onNext,
  onOpenCustomize
}) => {
  const [revealedCount, setRevealedCount] = useState<number>(0);
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [isAutoRevealing, setIsAutoRevealing] = useState<boolean>(true);

  // Progressive photo reveal with camera shutter & flash effect
  useEffect(() => {
    if (!isAutoRevealing) return;

    if (revealedCount < memories.length) {
      const timer = setTimeout(() => {
        sound.playCameraShutter();
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 300);

        setRevealedCount(prev => prev + 1);
      }, revealedCount === 0 ? 500 : 1500);

      return () => clearTimeout(timer);
    } else {
      setIsAutoRevealing(false);
    }
  }, [revealedCount, memories.length, isAutoRevealing]);

  const handleManualSnap = () => {
    sound.playCameraShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    if (revealedCount < memories.length) {
      setRevealedCount(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-start relative z-10 select-none max-w-6xl mx-auto">
      {/* Screen Camera Flash Overlay */}
      {isFlashing && (
        <div className="fixed inset-0 z-50 bg-white/90 pointer-events-none camera-flash-overlay" />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center text-center mb-6"
      >
        <span className="font-script text-3xl text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
          Precious Moments
        </span>
        <h2 className="text-3xl md:text-4xl font-display font-bold gold-gradient-text mt-1">
          Our Shared Memories
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-serif">
          {revealedCount} of {memories.length} moments developed · Tap any polaroid to view full story
        </p>

        {/* Upload / Customize Button on Stage */}
        {onOpenCustomize && (
          <button
            onClick={onOpenCustomize}
            className="mt-3 px-4 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>📷</span>
            <span>Upload / Edit Your Photos</span>
          </button>
        )}
      </motion.div>

      {/* Development Controls Row */}
      {revealedCount < memories.length && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <button
            onClick={handleManualSnap}
            className="px-5 py-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold rounded-full backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/10"
          >
            <span>📷</span>
            <span>Snap Next Photo ({revealedCount}/{memories.length})</span>
          </button>
          <button
            onClick={() => {
              setRevealedCount(memories.length);
              setIsAutoRevealing(false);
            }}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs rounded-full transition-all cursor-pointer"
          >
            Reveal All
          </button>
        </div>
      )}

      {/* Polaroid Gallery Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 p-4">
        {memories.slice(0, revealedCount).map((photo, idx) => (
          <motion.div
            key={photo.id || idx}
            initial={{ opacity: 0, scale: 0.6, y: 50, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: photo.rotate || 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 14 }}
            whileHover={{ scale: 1.05, rotate: 0, zIndex: 30 }}
            onClick={() => setSelectedPhoto(photo)}
            className="bg-white p-3 pb-6 rounded shadow-[0_12px_30px_rgba(0,0,0,0.5)] cursor-pointer transition-all border border-slate-200/50 group relative"
          >
            {/* Washi tape on top of polaroid */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-amber-200/60 backdrop-blur-sm -rotate-2 shadow-sm border border-amber-300/40" />

            {/* Quick Edit icon on hover */}
            {onOpenCustomize && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCustomize();
                }}
                className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white text-[11px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title="Edit this photo"
              >
                ✏️
              </button>
            )}

            {/* Photo frame */}
            <div className="aspect-[4/3] w-full bg-slate-900 overflow-hidden rounded-sm relative">
              <img
                src={photo.src}
                alt={photo.caption}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Polaroid handwritten caption */}
            <div className="mt-3 px-1 text-center">
              <p className="font-serif text-[#2a1c10] text-sm md:text-base font-semibold leading-snug">
                {photo.caption}
              </p>
              <div className="mt-1 flex items-center justify-center gap-2 text-[11px] text-amber-900/60 font-serif italic">
                <span>{photo.date}</span>
                {photo.location && (
                  <>
                    <span>•</span>
                    <span>{photo.location}</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox / Zoom Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              onClick={e => e.stopPropagation()}
              className="bg-white p-4 md:p-6 rounded-xl max-w-2xl w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>

              <div className="w-full max-h-[60vh] overflow-hidden rounded-lg bg-black flex items-center justify-center">
                <img
                  src={selectedPhoto.src}
                  alt={selectedPhoto.caption}
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>

              <div className="mt-4">
                <h3 className="font-serif text-xl font-bold text-slate-900">
                  {selectedPhoto.caption}
                </h3>
                <div className="flex items-center justify-center gap-3 text-xs text-slate-500 font-serif italic mt-1">
                  <span>{selectedPhoto.date}</span>
                  {selectedPhoto.location && (
                    <>
                      <span>•</span>
                      <span>📍 {selectedPhoto.location}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Proceed Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-12 flex justify-center"
      >
        <button
          onClick={onNext}
          className="px-8 py-4 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold tracking-wide rounded-full shadow-xl shadow-rose-500/20 active:scale-95 transition-all cursor-pointer text-sm md:text-base flex items-center gap-3"
        >
          <span>💖</span>
          <span>Tap to Continue to Birthday Video ➜</span>
        </button>
      </motion.div>
    </div>
  );
};
