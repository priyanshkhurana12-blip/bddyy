import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnniversaryData, MemoryPhoto } from '../types/anniversary';
import { compressAndUploadImage } from '../utils/imageOptimizer';
import { formatVideoSource } from './VideoStage';
import { generateShareUrl } from '../utils/defaultData';
import { sound } from '../utils/audio';

interface CustomizeModalProps {
  data: AnniversaryData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: AnniversaryData) => Promise<boolean>;
  initialTab?: 'video' | 'memories' | 'all';
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  data,
  isOpen,
  onClose,
  onSave,
  initialTab = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'video' | 'memories'>(initialTab);
  const [videoUrl, setVideoUrl] = useState<string>(data.videoUrl || '');
  const [memories, setMemories] = useState<MemoryPhoto[]>(data.memories || []);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  // Video format detection
  const previewSource = formatVideoSource(videoUrl);

  // Handle single photo upload
  const handlePhotoUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIndex(index);
      const url = await compressAndUploadImage(file);
      setMemories(prev => {
        const next = [...prev];
        next[index] = { ...next[index], src: url };
        return next;
      });
      sound.playMagicSparkle();
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setUploadingIndex(null);
    }
  };

  // Handle batch photos upload
  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingIndex(-1); // special batch flag
    try {
      const fileList = Array.from(files);
      const newPhotos: string[] = [];

      for (const f of fileList) {
        const url = await compressAndUploadImage(f);
        newPhotos.push(url);
      }

      setMemories(prev => {
        const next = [...prev];
        newPhotos.forEach((src, i) => {
          if (i < next.length) {
            next[i] = { ...next[i], src };
          } else {
            next.push({
              id: `mem-${Date.now()}-${i}`,
              src,
              caption: `Our Special Memory #${next.length + 1}`,
              date: 'Cherished Moment',
              location: '',
              rotate: (Math.random() - 0.5) * 6
            });
          }
        });
        return next;
      });

      sound.playMagicSparkle();
    } catch (err) {
      console.error('Batch upload error:', err);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleAddMemory = () => {
    const newIdx = memories.length + 1;
    const newMemory: MemoryPhoto = {
      id: `mem-${Date.now()}`,
      src: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=800&q=80',
      caption: `Sweet Memory #${newIdx}`,
      date: 'Our Special Day',
      location: '',
      rotate: (Math.random() - 0.5) * 6
    };
    setMemories(prev => [...prev, newMemory]);
  };

  const handleRemoveMemory = (index: number) => {
    setMemories(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateMemory = (index: number, field: keyof MemoryPhoto, value: any) => {
    setMemories(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const updated: AnniversaryData = {
      ...data,
      videoUrl: videoUrl.trim(),
      memories
    };

    const savedToServer = await onSave(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    sound.playMagicSparkle();

    setTimeout(() => {
      setSaveSuccess(false);
    }, 4500);
  };

  const handleCopyShareLink = () => {
    const updated: AnniversaryData = {
      ...data,
      videoUrl: videoUrl.trim(),
      memories
    };
    const link = generateShareUrl(updated);
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        className="bg-[#14111d] border border-amber-500/30 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden text-slate-100"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-black/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📸</span>
              <h2 className="text-xl sm:text-2xl font-display font-bold gold-gradient-text">
                Customize Memories & Drive Video
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-serif mt-0.5">
              Upload your own photos and Google Drive link. All changes are saved permanently to the deployment!
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors text-lg"
            title="Close"
          >
            ✕
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-white/5 px-6 pt-3 gap-2 bg-black/20 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            All Settings
          </button>
          <button
            onClick={() => setActiveTab('video')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'video'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>🎬</span>
            <span>Google Drive Video ({videoUrl ? 'Configured' : 'Empty'})</span>
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'memories'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>📷</span>
            <span>Memories Photos ({memories.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8">
          {/* SECTION 1: GOOGLE DRIVE VIDEO LINK */}
          {(activeTab === 'all' || activeTab === 'video') && (
            <div className="p-5 rounded-2xl bg-white/[0.03] border border-amber-500/20">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎬</span>
                  <h3 className="text-lg font-serif font-bold text-amber-200">
                    Google Drive Birthday Video
                  </h3>
                </div>
                {previewSource.type === 'drive' && (
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ✓ Valid Drive Link
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Paste the share link of your birthday video from Google Drive. It will automatically convert to the embed preview player.
              </p>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/1A2B3C4D.../view?usp=sharing"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 text-white text-xs font-mono focus:outline-none focus:border-amber-400 placeholder:text-slate-500"
                />
                {videoUrl && (
                  <button
                    onClick={() => setVideoUrl('')}
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Instructions Callout */}
              <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                <strong>💡 Google Drive Permissions Tip:</strong> In Google Drive, right-click your video ➜
                <strong> Share ➜ Share ➜ Change General Access to "Anyone with the link"</strong> (Viewer). This ensures Kajal or anyone viewing the deployed link can watch it without needing to request access.
              </div>

              {/* Live Preview Box */}
              {previewSource.type !== 'empty' && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <span className="text-xs font-semibold text-slate-300 mb-2 block">
                    Live Video Embed Test:
                  </span>
                  <div className="w-full max-w-sm mx-auto aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/20 shadow-xl">
                    {previewSource.type === 'drive' ? (
                      <iframe
                        src={previewSource.src}
                        title="Video Preview"
                        className="w-full h-full border-0"
                        allow="autoplay; fullscreen"
                      />
                    ) : (
                      <video
                        src={previewSource.src}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: MEMORIES PHOTOS */}
          {(activeTab === 'all' || activeTab === 'memories') && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📷</span>
                    <h3 className="text-lg font-serif font-bold text-amber-200">
                      Memories Photo Polaroids ({memories.length})
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 font-serif">
                    Upload your own photos to replace stock placeholders. Photos are optimized automatically.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Batch Upload Button */}
                  <label className="px-3.5 py-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                    <span>⚡</span>
                    <span>Upload Multiple Photos</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleBatchUpload}
                      className="hidden"
                    />
                  </label>

                  {/* Add Single Card */}
                  <button
                    onClick={handleAddMemory}
                    className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs cursor-pointer"
                  >
                    + Add Card
                  </button>
                </div>
              </div>

              {uploadingIndex === -1 && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-200 flex items-center gap-2 animate-pulse">
                  <span>⏳</span>
                  <span>Processing and uploading your batch photos...</span>
                </div>
              )}

              {/* Photo Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memories.map((photo, index) => {
                  const isStock = photo.src.includes('images.unsplash.com');
                  const isUploading = uploadingIndex === index;

                  return (
                    <div
                      key={photo.id || index}
                      className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-3 relative"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono font-semibold text-amber-300">
                          Polaroid #{index + 1}
                        </span>
                        {isStock ? (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                            Stock Photo
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Your Photo
                          </span>
                        )}
                      </div>

                      <div className="flex gap-3">
                        {/* Thumbnail & Upload Trigger */}
                        <div className="w-24 h-24 rounded-lg bg-black/60 overflow-hidden relative border border-white/10 flex-shrink-0 group">
                          <img
                            src={photo.src}
                            alt={photo.caption}
                            className="w-full h-full object-cover"
                          />
                          {isUploading ? (
                            <div className="absolute inset-0 bg-black/75 flex items-center justify-center text-xs text-amber-300 font-mono">
                              Uploading...
                            </div>
                          ) : (
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[10px] text-white font-medium cursor-pointer transition-opacity">
                              <span>📷 Change</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handlePhotoUpload(index, e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Text Details Inputs */}
                        <div className="flex-1 flex flex-col gap-2">
                          <label className="inline-block w-fit px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 border border-amber-400/30 text-amber-200 text-[11px] font-semibold cursor-pointer">
                            <span>📷 Choose Photo File</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handlePhotoUpload(index, e)}
                              className="hidden"
                            />
                          </label>

                          <input
                            type="text"
                            value={photo.caption}
                            onChange={(e) => handleUpdateMemory(index, 'caption', e.target.value)}
                            placeholder="Caption (e.g. That bright smile)"
                            className="px-2.5 py-1.5 rounded-lg bg-black/30 border border-white/10 text-xs text-white focus:outline-none focus:border-amber-400 font-serif"
                          />

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={photo.date}
                              onChange={(e) => handleUpdateMemory(index, 'date', e.target.value)}
                              placeholder="Date"
                              className="w-1/2 px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400 font-serif"
                            />
                            <input
                              type="text"
                              value={photo.location || ''}
                              onChange={(e) => handleUpdateMemory(index, 'location', e.target.value)}
                              placeholder="Location"
                              className="w-1/2 px-2 py-1 rounded-lg bg-black/30 border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-amber-400 font-serif"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remove Button if more than 1 photo */}
                      {memories.length > 1 && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleRemoveMemory(index)}
                            className="text-[11px] text-rose-400/80 hover:text-rose-300 cursor-pointer"
                          >
                            Remove Card
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer / Save Actions */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyShareLink}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
            >
              <span>{copiedLink ? '✅' : '🔗'}</span>
              <span>{copiedLink ? 'Share Link Copied!' : 'Copy Permanent Share Link'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              Cancel
            </button>

            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>{isSaving ? '⏳' : '💾'}</span>
              <span>{isSaving ? 'Saving to Server...' : 'Save Permanently to Deployed App'}</span>
            </button>
          </div>
        </div>

        {/* Floating Success Toast */}
        <AnimatePresence>
          {saveSuccess && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              className="absolute bottom-20 left-1/2 -translate-x-1/2 px-5 py-3 rounded-2xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-2 border border-emerald-400/40 z-50 text-center"
            >
              <span>🎉</span>
              <span>Saved permanently! All visitors and the deployed app now show your real photos & video!</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
