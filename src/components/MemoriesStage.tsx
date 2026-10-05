import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MemoryPhoto } from '../types/anniversary';
import { sound } from '../utils/audio';

interface MemoriesStageProps {
  memories: MemoryPhoto[];
  partnerName: string;
  onNext: () => void;
  onUpdateMemories?: (newMemories: MemoryPhoto[]) => void;
}

export const MemoriesStage: React.FC<MemoriesStageProps> = ({
  memories,
  partnerName: _partnerName,
  onNext,
  onUpdateMemories
}) => {
  const [revealedCount, setRevealedCount] = useState<number>(memories.length);
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const singleReplaceIndexRef = useRef<number | null>(null);
  const singleReplaceInputRef = useRef<HTMLInputElement | null>(null);

  const handleManualSnap = () => {
    sound.playCameraShutter();
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 300);

    if (revealedCount < memories.length) {
      setRevealedCount(prev => prev + 1);
    }
  };

  // Compress and read image as data URL
  const readAndCompressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.82));
          } else {
            resolve(e.target?.result as string);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle uploading multiple photos
  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    sound.playMagicSparkle();
    const newPhotos: string[] = [];
    for (let i = 0; i < Math.min(files.length, 12); i++) {
      const dataUrl = await readAndCompressImage(files[i]);
      newPhotos.push(dataUrl);
    }

    const updated = memories.map((mem, idx) => {
      if (newPhotos[idx]) {
        return { ...mem, src: newPhotos[idx] };
      }
      return mem;
    });

    // If more photos uploaded than exist, append them
    if (newPhotos.length > memories.length) {
      for (let j = memories.length; j < newPhotos.length; j++) {
        updated.push({
          id: `mem-custom-${Date.now()}-${j}`,
          src: newPhotos[j],
          caption: 'Special Memory Together ❤️',
          date: 'Our Story',
          location: 'Precious Moments',
          rotate: ((j % 5) - 2) * 1.5
        });
      }
    }

    if (onUpdateMemories) {
      onUpdateMemories(updated);
    }
    setRevealedCount(updated.length);
  };

  // Handle single photo replacement
  const handleSingleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const index = singleReplaceIndexRef.current;
    if (!file || index === null || !memories[index]) return;

    const dataUrl = await readAndCompressImage(file);
    const updated = [...memories];
    updated[index] = { ...updated[index], src: dataUrl };

    if (onUpdateMemories) {
      onUpdateMemories(updated);
    }
    sound.playMagicSparkle();
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    });
  };

  return (
    <div className="min-h-screen py-16 px-4 flex flex-col items-center justify-start relative z-10 select-none max-w-6xl mx-auto">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleBulkUpload}
      />
      <input
        ref={singleReplaceInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleReplace}
      />

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

        {/* Photo Management Controls */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <span>📸</span>
            <span>Upload Our Photos</span>
          </button>
          <button
            onClick={copyShareLink}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <span>🔗</span>
            <span>{copiedToast ? 'Copied to Clipboard! ✨' : 'Share Link with Photos'}</span>
          </button>
        </div>
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
            onClick={() => setRevealedCount(memories.length)}
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
            whileHover={{ scale: 1.04, rotate: 0, zIndex: 30 }}
            onClick={() => setSelectedPhoto(photo)}
            className="bg-white p-3 pb-6 rounded shadow-[0_12px_30px_rgba(0,0,0,0.5)] cursor-pointer transition-all border border-slate-200/50 group relative"
          >
            {/* Washi tape on top of polaroid */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-amber-200/60 backdrop-blur-sm -rotate-2 shadow-sm border border-amber-300/40" />

            {/* Quick replace icon on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                singleReplaceIndexRef.current = idx;
                singleReplaceInputRef.current?.click();
              }}
              title="Change this photo"
              className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-black/60 hover:bg-black/90 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer shadow-md"
            >
              ✏️
            </button>

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
          <span>🎬</span>
          <span>Watch Birthday Video ➜</span>
        </button>
      </motion.div>
    </div>
  );
};
