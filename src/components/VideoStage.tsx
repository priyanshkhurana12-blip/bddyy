import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface VideoStageProps {
  videoUrl?: string;
  partnerName: string;
  senderName: string;
  onUpdateVideoUrl?: (newUrl: string) => void;
  onReplayAll?: () => void;
}

// Convert various Google Drive link formats into an embeddable preview URL
export function formatVideoSource(url: string): { type: 'drive' | 'direct' | 'empty'; src: string } {
  if (!url || !url.trim()) {
    return { type: 'empty', src: '' };
  }

  const trimmed = url.trim();

  // Check for YouTube links (shorts or normal watch/embed)
  const ytMatch = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]+)/);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'drive',
      src: `https://www.youtube.com/embed/${ytMatch[1]}?playsinline=1&rel=0`
    };
  }

  // Check for Google Drive file ID pattern
  // Formats:
  // - https://drive.google.com/file/d/1A2B3C4D.../view?usp=sharing
  // - https://drive.google.com/open?id=1A2B3C4D...
  // - https://drive.google.com/uc?id=1A2B3C4D...
  const driveMatch =
    trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (driveMatch && driveMatch[1]) {
    const fileId = driveMatch[1];
    return {
      type: 'drive',
      src: `https://drive.google.com/file/d/${fileId}/preview`
    };
  }

  // Already a preview link
  if (trimmed.includes('drive.google.com') && trimmed.includes('/preview')) {
    const clean = trimmed.replace(/[?&]autoplay=1/g, '').replace(/\?&/, '?');
    return { type: 'drive', src: clean };
  }

  return { type: 'direct', src: trimmed };
}

// Cinematic kinetic reel slides transcribed directly from Priyansh's video message for Kajal
const REEL_SLIDES = [
  {
    prefix: 'Happy',
    highlight: 'birthday',
    suffix: 'Kajal',
    highlightColor: 'text-amber-400',
    duration: 3200
  },
  {
    prefix: 'I pray to God you had a',
    highlight: 'greatest',
    suffix: 'year ahead.',
    highlightColor: 'text-amber-400',
    duration: 3800
  },
  {
    prefix: "Bro, it's been",
    highlight: '132 days.',
    suffix: '',
    highlightColor: 'text-amber-400',
    duration: 3300
  },
  {
    prefix: 'What a',
    highlight: 'magical 132',
    suffix: 'days.',
    highlightColor: 'text-amber-400',
    duration: 3300
  },
  {
    prefix: 'I know both',
    highlight: 'ups and down',
    suffix: 'hua hai beech beech mein.',
    highlightColor: 'text-rose-400',
    duration: 3800
  },
  {
    prefix: 'But bro, this time our',
    highlight: 'bond is so strong',
    suffix: '',
    highlightColor: 'text-amber-400',
    duration: 3600
  },
  {
    prefix: 'We became each other',
    highlight: 'counterparts',
    suffix: '',
    highlightColor: 'text-amber-400',
    duration: 3400
  },
  {
    prefix: 'We both share our',
    highlight: 'daily life',
    suffix: 'with each other',
    highlightColor: 'text-amber-400',
    duration: 3500
  },
  {
    prefix: 'We both have a similar thinking and a great',
    highlight: 'mutual understanding',
    suffix: 'this time.',
    highlightColor: 'text-amber-400',
    duration: 4200
  },
  {
    prefix: 'And bro, you are literally an',
    highlight: 'amazing human',
    suffix: 'being.',
    highlightColor: 'text-amber-400',
    duration: 3800
  },
  {
    prefix: 'I always try to make you',
    highlight: 'laugh and happy',
    suffix: 'whenever you are sad.',
    highlightColor: 'text-amber-400',
    duration: 4200
  },
  {
    prefix: 'Or haan, thank you for being such a good friend for all the random talks, laugh and',
    highlight: 'memories.',
    suffix: '',
    highlightColor: 'text-rose-400',
    duration: 4600
  },
  {
    prefix: 'Mujhe nahi pata humara future mein kya hoga. Hum sath rahenge ya nahi...',
    highlight: 'future mein',
    suffix: '',
    highlightColor: 'text-amber-400',
    duration: 4400
  },
  {
    prefix: 'But bro, I just want you to be a',
    highlight: 'part of my life',
    suffix: 'till my death bed.',
    highlightColor: 'text-rose-400',
    duration: 4600
  },
  {
    prefix: 'I just want to enjoy every moment of life and',
    highlight: 'travel the world',
    suffix: 'with you',
    highlightColor: 'text-amber-400',
    duration: 4400
  },
  {
    prefix: 'I was in fifth class when I saw you first time. It has been',
    highlight: 'nine years',
    suffix: '',
    highlightColor: 'text-amber-400',
    duration: 4600
  },
  {
    prefix: 'Aur mere andar 9 salo se same feeling hai tere liye. Khatam hone ki jagah aur',
    highlight: 'badhti ja rahi hai.',
    suffix: '',
    highlightColor: 'text-rose-400',
    duration: 4800
  },
  {
    prefix: 'At the end, enjoy your day! Once again,',
    highlight: 'happiest birthday 🎂',
    suffix: '',
    highlightColor: 'text-amber-400',
    duration: 4000
  },
  {
    prefix: 'Stay happy, stay crazy, and please jyada mature hone ki koshish mat karna,',
    highlight: 'tu aisi hi theek hai. ❤️',
    suffix: '',
    highlightColor: 'text-rose-400',
    duration: 5200
  }
];

export const VideoStage: React.FC<VideoStageProps> = ({
  videoUrl = '',
  partnerName,
  senderName,
  onUpdateVideoUrl,
  onReplayAll
}) => {
  const [currentUrl, setCurrentUrl] = useState<string>(videoUrl);
  const [inputUrl, setInputUrl] = useState<string>(videoUrl);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Kinetic Reel State
  const [isReelPlaying, setIsReelPlaying] = useState<boolean>(false);
  const [reelIndex, setReelIndex] = useState<number>(0);
  const [isReelFinished, setIsReelFinished] = useState<boolean>(false);
  const [showDriveInput, setShowDriveInput] = useState<boolean>(false);

  // Stop background synth music so video audio is clear
  useEffect(() => {
    sound.stopMusic();
  }, []);

  // Update currentUrl when prop changes
  useEffect(() => {
    if (videoUrl) {
      setCurrentUrl(videoUrl);
      setInputUrl(videoUrl);
    }
  }, [videoUrl]);

  const videoSource = formatVideoSource(currentUrl);

  // Kinetic Reel Timer logic
  useEffect(() => {
    if (!isReelPlaying || isReelFinished || videoSource.type !== 'empty') return;

    const currentSlide = REEL_SLIDES[reelIndex];
    const timer = setTimeout(() => {
      if (reelIndex < REEL_SLIDES.length - 1) {
        setReelIndex(prev => prev + 1);
      } else {
        setIsReelFinished(true);
        setIsReelPlaying(false);
        confetti({
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8']
        });
      }
    }, currentSlide?.duration || 3500);

    return () => clearTimeout(timer);
  }, [isReelPlaying, reelIndex, isReelFinished, videoSource.type]);

  // Initial celebration confetti when opening video
  useEffect(() => {
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#ec4899', '#38bdf8', '#fbbf24']
    });
  }, []);

  const handleSaveUrl = () => {
    const trimmed = inputUrl.trim();
    setCurrentUrl(trimmed);
    if (onUpdateVideoUrl) {
      onUpdateVideoUrl(trimmed);
    }
    setShowDriveInput(false);
    sound.playMagicSparkle();
  };

  const handleTogglePlay = async () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        try {
          await videoRef.current.play();
          setIsPlaying(true);
        } catch (e) {
          console.error('Play error:', e);
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleToggleReelPlay = () => {
    if (isReelFinished) {
      setReelIndex(0);
      setIsReelFinished(false);
      setIsReelPlaying(true);
      sound.startMusic();
      return;
    }

    if (isReelPlaying) {
      setIsReelPlaying(false);
      sound.stopMusic();
    } else {
      setIsReelPlaying(true);
      sound.startMusic();
    }
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleCelebrate = () => {
    sound.playMagicSparkle();
    confetti({
      particleCount: 70,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#f43f5e', '#fbbf24', '#a855f7', '#38bdf8']
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 flex flex-col items-center justify-center relative z-10 select-none max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center text-center mb-6"
      >
        <span className="font-script text-3xl md:text-4xl text-rose-300 drop-shadow-[0_0_12px_rgba(244,63,94,0.4)]">
          ✨ A Special Video For You ✨
        </span>
        <h1 className="mt-1 text-2xl md:text-4xl font-display font-bold gold-gradient-text tracking-wide drop-shadow-[0_2px_15px_rgba(245,158,11,0.3)]">
          Happy 19th Birthday, {partnerName}! 🎂
        </h1>
        <p className="mt-1 text-xs md:text-sm text-slate-300/80 font-serif italic max-w-md mx-auto">
          Every moment with you is unforgettable. Enjoy this special video! 💖
        </p>
      </motion.div>

      {/* Mobile-Suitable Portrait Video Player Container (9:16 Ratio) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative w-full max-w-[340px] sm:max-w-[360px] aspect-[9/16] rounded-3xl p-2 bg-gradient-to-b from-amber-400/40 via-rose-500/30 to-amber-500/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center"
      >
        {/* Sleek Inner Phone/Reel Chassis */}
        <div className="w-full h-full rounded-[1.4rem] bg-black overflow-hidden relative flex flex-col border border-white/10 shadow-2xl">
          {/* Top Notch / Camera Bar */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-4 bg-neutral-950/80 backdrop-blur-md rounded-full border border-white/10 flex items-center justify-center gap-1.5 px-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
              <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-700/60" />
            </div>
          </div>

          {/* Video Display Area */}
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            {videoSource.type === 'drive' && (
              <iframe
                key={videoSource.src}
                src={videoSource.src}
                title="Birthday Video"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0 absolute inset-0 z-10"
              />
            )}

            {videoSource.type === 'direct' && (
              <div className="relative w-full h-full" onClick={handleTogglePlay}>
                <video
                  ref={videoRef}
                  src={videoSource.src}
                  loop
                  playsInline
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-cover cursor-pointer"
                />

                {/* Big Center Play Button Overlay when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] cursor-pointer">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePlay();
                      }}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 hover:scale-105 active:scale-95 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(244,63,94,0.5)] border-2 border-white/50 cursor-pointer transition-all duration-300 group"
                      aria-label="Play Video"
                    >
                      <span className="text-3xl ml-1 text-slate-950 group-hover:scale-110 transition-transform">▶</span>
                    </button>
                    <span className="mt-3.5 px-4 py-1.5 rounded-full bg-black/80 border border-amber-400/40 text-amber-200 text-xs font-semibold tracking-wide backdrop-blur-md shadow-lg">
                      Tap to Play Video
                    </span>
                  </div>
                )}

                {/* Floating Unmute indicator if muted while playing */}
                {isPlaying && isMuted && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (videoRef.current) {
                        videoRef.current.muted = false;
                        setIsMuted(false);
                      }
                    }}
                    className="absolute top-8 right-3 z-30 px-3 py-1.5 rounded-full bg-black/75 hover:bg-black/90 border border-amber-400/40 text-amber-200 text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 shadow-lg animate-pulse cursor-pointer"
                  >
                    <span>🔇</span>
                    <span>Tap to Unmute</span>
                  </button>
                )}

                {/* Overlay Controls (when playing) */}
                {isPlaying && (
                  <div
                    className="absolute bottom-4 left-3 right-3 z-20 flex items-center justify-between bg-black/50 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleTogglePlay}
                      className="text-white hover:text-amber-300 text-xs font-semibold cursor-pointer"
                    >
                      ⏸ Pause
                    </button>
                    <button
                      onClick={handleToggleMute}
                      className="text-white hover:text-amber-300 text-xs font-semibold cursor-pointer"
                    >
                      {isMuted ? '🔇 Unmute' : '🔊 Mute'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {videoSource.type === 'empty' && (
              <div
                className="relative w-full h-full flex flex-col justify-between bg-black p-6 text-center select-none cursor-pointer overflow-hidden"
                onClick={handleToggleReelPlay}
              >
                {/* Background ambient subtle glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-rose-500/10 pointer-events-none" />

                {/* Top status bar in reel */}
                <div className="relative z-20 flex items-center justify-between text-[11px] text-white/60 font-mono pt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Birthday Reel</span>
                  </div>
                  <span>{reelIndex + 1} / {REEL_SLIDES.length}</span>
                </div>

                {/* Center Content: Animated Typography Slide */}
                <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-2">
                  <AnimatePresence mode="wait">
                    {!isReelPlaying && !isReelFinished && (
                      <motion.div
                        key="intro"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center justify-center text-center"
                      >
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-[0_0_35px_rgba(244,63,94,0.6)] border-2 border-white/50 mb-4 transition-transform hover:scale-105 active:scale-95">
                          <span className="text-3xl ml-1">▶</span>
                        </div>
                        <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                          Priyansh's Message
                        </h2>
                        <p className="font-serif italic text-xs text-amber-200/90 mt-1 max-w-[240px]">
                          "Bro, it's been 132 magical days... and 9 years since 5th class"
                        </p>
                        <span className="mt-4 px-4 py-1.5 rounded-full bg-white/10 border border-amber-400/40 text-amber-300 text-xs font-semibold backdrop-blur-md animate-pulse">
                          Tap to Play Video 💖
                        </span>
                      </motion.div>
                    )}

                    {isReelPlaying && !isReelFinished && (
                      <motion.div
                        key={reelIndex}
                        initial={{ opacity: 0, scale: 0.85, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -15 }}
                        transition={{ duration: 0.45, ease: 'easeOut' }}
                        className="flex flex-col items-center justify-center text-center px-3"
                      >
                        <p className="font-display font-black text-2xl sm:text-3xl text-white leading-tight tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                          {REEL_SLIDES[reelIndex].prefix}{' '}
                          <span className={`${REEL_SLIDES[reelIndex].highlightColor} drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]`}>
                            {REEL_SLIDES[reelIndex].highlight}
                          </span>{' '}
                          {REEL_SLIDES[reelIndex].suffix}
                        </p>
                      </motion.div>
                    )}

                    {isReelFinished && (
                      <motion.div
                        key="finished"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center text-center"
                      >
                        <span className="text-4xl mb-2">🎂💖</span>
                        <h2 className="font-display font-extrabold text-2xl gold-gradient-text">
                          Happy Birthday, Kajal!
                        </h2>
                        <p className="font-serif italic text-xs text-slate-300 mt-2 max-w-[240px]">
                          "Tu aisi hi theek hai. Stay happy, stay crazy." ❤️
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleReelPlay();
                          }}
                          className="mt-5 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-bold text-xs shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <span>🔄</span>
                          <span>Replay Reel</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Reel Bottom Controls & Progress Bar */}
                <div className="relative z-20 pb-2 flex flex-col gap-2.5" onClick={e => e.stopPropagation()}>
                  {/* Segmented Timeline Progress Bar */}
                  <div className="w-full flex items-center gap-1 h-1">
                    {REEL_SLIDES.map((_, sIdx) => (
                      <div
                        key={sIdx}
                        className={`flex-1 h-full rounded-full transition-all duration-300 ${
                          sIdx < reelIndex
                            ? 'bg-amber-400'
                            : sIdx === reelIndex && isReelPlaying
                            ? 'bg-amber-300 animate-pulse'
                            : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Play / Pause & Attach Link Controls */}
                  <div className="flex items-center justify-between text-xs px-1 text-slate-300">
                    <button
                      onClick={handleToggleReelPlay}
                      className="text-white hover:text-amber-300 font-semibold cursor-pointer"
                    >
                      {isReelPlaying ? '⏸ Pause' : isReelFinished ? '🔄 Replay' : '▶ Play'}
                    </button>
                    <button
                      onClick={() => setShowDriveInput(!showDriveInput)}
                      className="text-[11px] text-amber-300/80 hover:text-amber-200 underline cursor-pointer"
                    >
                      {showDriveInput ? 'Hide Link Box' : '🔗 Attach Drive Video'}
                    </button>
                  </div>

                  {/* Optional Drive link drawer inside player */}
                  {showDriveInput && (
                    <div className="mt-2 p-3 rounded-xl bg-black/80 border border-white/20 text-left">
                      <label className="block text-[10px] text-amber-200 font-serif mb-1">
                        Paste Google Drive link:
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={inputUrl}
                          onChange={(e) => setInputUrl(e.target.value)}
                          placeholder="https://drive.google.com/..."
                          className="flex-1 px-2.5 py-1.5 text-[11px] rounded-lg bg-white/10 border border-white/20 text-white font-mono focus:outline-none"
                        />
                        <button
                          onClick={handleSaveUrl}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Ambient Glow Reflection */}
        <div className="absolute -bottom-6 w-3/4 h-8 bg-amber-500/20 blur-xl rounded-full pointer-events-none" />
      </motion.div>

      {/* Action Buttons & Love Signoff */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 flex flex-col items-center text-center gap-4"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={handleCelebrate}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>🎉</span>
            <span>Tap Me 💖</span>
          </button>

          {onReplayAll && (
            <button
              onClick={onReplayAll}
              className="px-5 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold backdrop-blur-md active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🔄</span>
              <span>Replay from Beginning</span>
            </button>
          )}
        </div>

        {/* Bottom Sweet Sign-off */}
        <div className="mt-4 p-4 rounded-2xl bg-white/[0.03] border border-amber-500/20 backdrop-blur-sm max-w-md">
          <p className="font-script text-2xl text-rose-300 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]">
            "You are genuinely a very special person..."
          </p>
          <p className="text-xs text-amber-200/90 font-serif italic mt-1">
            Always stay happy, stay crazy, and keep smiling. ❤️
          </p>
          <div className="mt-2 text-[11px] font-mono font-semibold text-slate-400">
            With all my love, <span className="text-amber-300">{senderName}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
