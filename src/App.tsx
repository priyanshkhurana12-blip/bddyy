import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { StarryBackground } from './components/StarryBackground';
import { LockStage } from './components/LockStage';
import { FireworksCanvas } from './components/FireworksCanvas';
import { GiftBoxStage } from './components/GiftBoxStage';
import { MainCakeStage } from './components/MainCakeStage';
import { LoveLetterStage } from './components/LoveLetterStage';
import { BalloonPopStage } from './components/BalloonPopStage';
import { MemoriesStage } from './components/MemoriesStage';
import { VideoStage } from './components/VideoStage';
import { CustomizeModal } from './components/CustomizeModal';
import { AnniversaryData, StageType } from './types/anniversary';
import {
  loadAnniversaryData,
  saveAnniversaryData,
  fetchServerAnniversaryData
} from './utils/defaultData';
import { sound } from './utils/audio';

export default function App() {
  const [data, setData] = useState<AnniversaryData>(loadAnniversaryData);
  const [stage, setStage] = useState<StageType>('lock');
  const [musicPlaying, setMusicPlaying] = useState<boolean>(false);
  const [isCustomizeOpen, setIsCustomizeOpen] = useState<boolean>(false);
  const [customizeInitialTab, setCustomizeInitialTab] = useState<'all' | 'video' | 'memories'>('all');

  // Auto-sync preview localStorage to server on mount, or fetch existing server data
  useEffect(() => {
    fetchServerAnniversaryData()
      .then(serverData => {
        if (serverData && (serverData.videoUrl || serverData.memories?.length)) {
          console.log('✅ Loaded anniversary data from server disk');
          setData(serverData);
          return;
        }

        // Check if browser has custom data stored in preview session
        const local = loadAnniversaryData();
        const hasCustomVideo = !!(local.videoUrl && local.videoUrl.trim() !== '');
        const hasCustomMemories = local.memories?.some(m => !m.src.includes('images.unsplash.com'));

        if (hasCustomVideo || hasCustomMemories) {
          console.log('🔄 Auto-syncing preview data to server disk so deployment uses it...');
          saveAnniversaryData(local).then(() => {
            console.log('✅ Auto-synced preview data to server!');
          });
        }
      })
      .catch(err => {
        console.warn('Initial server fetch:', err);
      });
  }, []);

  // Sync music state with sound engine
  const handleToggleMusic = () => {
    const isPlaying = sound.toggleMusic();
    setMusicPlaying(isPlaying);
  };

  const handleUpdateVideoUrl = async (newUrl: string) => {
    const updated = { ...data, videoUrl: newUrl };
    setData(updated);
    await saveAnniversaryData(updated);
  };

  const handleSaveCustomData = async (updated: AnniversaryData): Promise<boolean> => {
    setData(updated);
    const success = await saveAnniversaryData(updated);
    return success;
  };

  const handleOpenCustomize = (tab: 'all' | 'video' | 'memories' = 'all') => {
    setCustomizeInitialTab(tab);
    setIsCustomizeOpen(true);
  };

  // Stage transitions
  const handleUnlocked = () => {
    // Automatically start romantic music upon first interaction if user hasn't toggled yet
    if (!musicPlaying) {
      sound.startMusic();
      setMusicPlaying(true);
    }
    setStage('show');
  };

  const handleShowFinished = () => {
    setStage('envelope');
  };

  const handleGiftOpened = () => {
    setStage('main');
  };

  const handleOpenLetter = () => {
    setStage('letter');
  };

  const handleLetterNext = () => {
    setStage('balloons');
  };

  const handleBalloonsNext = () => {
    setStage('memories');
  };

  const handleMemoriesNext = () => {
    setStage('video');
  };

  const handleRestartJourney = () => {
    setStage('main');
  };

  const hasCustomMedia =
    (data.videoUrl && data.videoUrl.trim() !== '') ||
    data.memories?.some(m => !m.src.includes('images.unsplash.com'));

  return (
    <div className="relative min-h-screen bg-[#0b0910] text-slate-100 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Background Starry Sky & Glowing Particles */}
      <StarryBackground />

      {/* Floating Top Nav Controls */}
      <header className="fixed top-4 inset-x-0 z-50 px-4 md:px-8 flex items-center justify-between pointer-events-none">
        {/* Left: Romantic Watermark & Quick Jump */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs text-amber-200/90 font-serif italic shadow-sm">
            For Kajal (Billu) ❤️
          </div>

          {/* Quick jump to stages if not on lock screen */}
          {stage !== 'lock' && stage !== 'show' && (
            <div className="hidden sm:flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 text-[10px]">
              <button
                onClick={() => setStage('main')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${stage === 'main' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Cake
              </button>
              <button
                onClick={() => setStage('letter')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${stage === 'letter' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Letter
              </button>
              <button
                onClick={() => setStage('balloons')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${stage === 'balloons' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                🎈 Balloons
              </button>
              <button
                onClick={() => setStage('memories')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${stage === 'memories' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                Memories
              </button>
              <button
                onClick={() => setStage('video')}
                className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${stage === 'video' ? 'bg-amber-500/30 text-amber-200 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                🎬 Video
              </button>
            </div>
          )}
        </div>

        {/* Right: Customization & Music Toggle */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Photos & Video Customize Trigger */}
          <button
            onClick={() => handleOpenCustomize('all')}
            className="px-3.5 py-1.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 backdrop-blur-md text-xs font-semibold text-amber-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Upload your photos & Drive video link"
          >
            <span>📸</span>
            <span className="hidden sm:inline">Photos & Video</span>
            {hasCustomMedia && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>

          {/* Music Button */}
          <button
            onClick={handleToggleMusic}
            id="musicBtn"
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 backdrop-blur-md text-xs font-medium text-amber-200 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Toggle Romantic Music"
          >
            <span>{musicPlaying ? '🔊' : '🔈'}</span>
            <span className="hidden sm:inline">
              Music: {musicPlaying ? 'On' : 'Off'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Interactive Stage Container */}
      <main className="flex-1 w-full relative z-10 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {stage === 'lock' && (
            <motion.div
              key="lock"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(10px)', y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LockStage
                correctPasskey={data.passkey}
                onUnlocked={handleUnlocked}
                partnerName={data.partnerName}
              />
            </motion.div>
          )}

          {stage === 'show' && (
            <motion.div
              key="show"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <FireworksCanvas
                onDone={handleShowFinished}
                partnerName={data.partnerName}
              />
            </motion.div>
          )}

          {stage === 'envelope' && (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <GiftBoxStage
                onOpen={handleGiftOpened}
                partnerName={data.partnerName}
              />
            </motion.div>
          )}

          {stage === 'main' && (
            <motion.div
              key="main"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <MainCakeStage
                partnerName={data.partnerName}
                anniversaryDate={data.anniversaryDate}
                celebrationTitle={data.celebrationTitle}
                anniversaryYearText={data.anniversaryYearText}
                onOpenLetter={handleOpenLetter}
              />
            </motion.div>
          )}

          {stage === 'letter' && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <LoveLetterStage
                letter={data.letter}
                partnerName={data.partnerName}
                senderName={data.senderName}
                onNext={handleLetterNext}
              />
            </motion.div>
          )}

          {stage === 'balloons' && (
            <motion.div
              key="balloons"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <BalloonPopStage
                partnerName={data.partnerName}
                onNext={handleBalloonsNext}
              />
            </motion.div>
          )}

          {stage === 'memories' && (
            <motion.div
              key="memories"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <MemoriesStage
                memories={data.memories}
                partnerName={data.partnerName}
                onNext={handleMemoriesNext}
                onOpenCustomize={() => handleOpenCustomize('memories')}
              />
            </motion.div>
          )}

          {stage === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <VideoStage
                videoUrl={data.videoUrl}
                partnerName={data.partnerName}
                senderName={data.senderName}
                onUpdateVideoUrl={handleUpdateVideoUrl}
                onReplayAll={handleRestartJourney}
                onOpenCustomize={() => handleOpenCustomize('video')}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Customize Photos & Drive Video Modal */}
      <CustomizeModal
        isOpen={isCustomizeOpen}
        onClose={() => setIsCustomizeOpen(false)}
        data={data}
        onSave={handleSaveCustomData}
        initialTab={customizeInitialTab}
      />

      {/* Discreet Footer Watermark */}
      <footer className="py-4 text-center text-[11px] text-slate-500/70 font-serif relative z-10 pointer-events-none">
        Handcrafted with infinite love ·
      </footer>
    </div>
  );
}
