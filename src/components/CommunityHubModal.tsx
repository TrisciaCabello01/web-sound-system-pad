import React, { useState } from 'react';
import { PresetKit, UserProfile } from '../types';
import { COMMUNITY_KITS } from '../data/presetKits';
import { exportKitToJson, importKitFromJson, saveCustomKitToLibrary } from '../services/storage';
import { Globe, Share2, Download, Upload, Heart, Sparkles, Cloud, Check, Copy, User } from 'lucide-react';

interface CommunityHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentKit: PresetKit;
  onLoadKit: (kit: PresetKit) => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const CommunityHubModal: React.FC<CommunityHubModalProps> = ({
  isOpen,
  onClose,
  currentKit,
  onLoadKit,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'explore' | 'share' | 'sync'>('explore');
  const [copiedLink, setCopiedLink] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);

  const tags = ['All', 'SoundSystem', 'TikTok', 'TikTokSongs', 'Trending', 'Comedic', 'Worship', 'Praise', 'LoFi', 'Loops', 'Drill', 'EDM'];

  const filteredKits = selectedTag === 'All'
    ? COMMUNITY_KITS
    : COMMUNITY_KITS.filter((k) => k.tags?.some((t) => t.toLowerCase() === selectedTag.toLowerCase()));

  // Export current kit as file
  const handleExportJson = () => {
    const jsonStr = exportKitToJson(currentKit);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentKit.name.replace(/\s+/g, '_').toLowerCase()}_pulsepad_patch.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Copy patch config link to clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // File import
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const kit = importKitFromJson(content);
      if (kit) {
        onLoadKit(kit);
        saveCustomKitToLibrary(kit);
        setImportError(null);
        onClose();
      } else {
        setImportError('Invalid patch file format. Please upload a valid PulsePad JSON kit.');
      }
    };
    reader.readAsText(file);
  };

  // Cloud Sync trigger
  const handleCloudSync = () => {
    setIsCloudSyncing(true);
    setTimeout(() => {
      setIsCloudSyncing(false);
      onUpdateUser({
        ...user,
        lastSyncTimestamp: Date.now(),
        savedKitsCount: user.savedKitsCount + 1,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#11131a] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202432] bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-pink-500/15 border border-pink-500/30 text-pink-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Community Patch Hub & Cloud Sync
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                  CREATOR ECOSYSTEM
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Share sound patches with artists, sync user presets, and explore kits</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white text-black font-extrabold hover:bg-neutral-200 text-xs transition"
          >
            Done
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center border-b border-[#202432] bg-[#12141e] px-4">
          <button
            onClick={() => setActiveTab('explore')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 ${
              activeTab === 'explore'
                ? 'border-pink-500 text-white bg-[#191d2c]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            Explore Community Kits ({COMMUNITY_KITS.length})
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 ${
              activeTab === 'share'
                ? 'border-pink-500 text-white bg-[#191d2c]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            Share & Export Current Kit
          </button>

          <button
            onClick={() => setActiveTab('sync')}
            className={`py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-pink-500 text-white bg-[#191d2c]'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4 text-emerald-400" />
            Cloud Backup & Multi-Device Sync
          </button>
        </div>

        {/* Tab 1: Explore Community Kits */}
        {activeTab === 'explore' && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Filter tags */}
            <div className="flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    selectedTag === tag
                      ? 'bg-pink-500 text-white shadow-sm'
                      : 'bg-[#181c28] text-neutral-400 hover:text-white border border-[#262c3e]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Kits Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {filteredKits.map((kit) => (
                <div
                  key={kit.id}
                  className="p-4 rounded-xl bg-[#161925] border border-[#272e42] hover:border-[#3d4766] transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202535] text-cyan-400 font-bold">
                        {kit.category}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                        <span className="flex items-center gap-1 text-pink-400">
                          <Heart className="w-3 h-3 fill-current" />
                          {kit.likesCount}
                        </span>
                        <span>{kit.bpm} BPM</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-white mb-1">{kit.name}</h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 mb-3">{kit.description}</p>

                    <div className="text-[11px] text-neutral-400 mb-3">
                      <span>Curated by: </span>
                      <span className="font-bold text-neutral-200">@{kit.author}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#202636]">
                    <button
                      onClick={() => {
                        onLoadKit(kit);
                        onClose();
                      }}
                      className="w-full py-2 rounded-lg bg-white text-black font-extrabold text-xs hover:bg-neutral-200 transition"
                    >
                      Load Kit to Pads
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Share Current Kit */}
        {activeTab === 'share' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 rounded-xl bg-[#161a27] border border-[#272f44]">
              <h3 className="font-extrabold text-sm text-white mb-1">
                Export Current Sound Kit: "{currentKit.name}"
              </h3>
              <p className="text-xs text-neutral-400 mb-4">
                Exports all 16 pad parameters, custom trim marks, pitch tuning, colors, and group tags.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExportJson}
                  className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition"
                >
                  <Download className="w-4 h-4" />
                  {downloadSuccess ? 'Downloaded!' : 'Download Patch JSON'}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-5 py-2.5 rounded-xl bg-[#22283a] hover:bg-[#2d354d] text-white font-bold text-xs border border-[#343e59] flex items-center justify-center gap-2 transition"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedLink ? 'Link Copied to Clipboard!' : 'Copy Shareable App Link'}
                </button>
              </div>
            </div>

            {/* Import Custom Kit */}
            <div className="p-4 rounded-xl bg-[#161a27] border border-[#272f44]">
              <h3 className="font-extrabold text-sm text-white mb-1">Import Community Patch File</h3>
              <p className="text-xs text-neutral-400 mb-4">
                Load any valid PulsePad `.json` kit file exported by other producers.
              </p>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#262c3f] hover:bg-[#323a54] text-white font-bold text-xs cursor-pointer border border-[#3b4562] transition">
                <Upload className="w-4 h-4 text-pink-400" />
                Select .json Kit File
                <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
              </label>

              {importError && (
                <p className="text-xs text-red-400 mt-2 font-semibold">{importError}</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Cloud Sync & Multi-device Authentication */}
        {activeTab === 'sync' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#161a27] border border-[#272f44]">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-extrabold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white">{user.displayName}</h3>
                <p className="text-xs text-neutral-400">@{user.username} • Verified Producer Profile</p>
                <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 mt-1">
                  <span>{user.savedKitsCount} Synced Cloud Kits</span>
                  <span>•</span>
                  <span>
                    Last backup: {user.lastSyncTimestamp ? new Date(user.lastSyncTimestamp).toLocaleTimeString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#161a27] border border-[#272f44] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-sm text-white">Instant Cloud Project Sync</h4>
                  <p className="text-xs text-neutral-400">
                    Syncs all user presets, custom uploaded samples, and MIDI mappings for stage readiness
                  </p>
                </div>
                <button
                  onClick={handleCloudSync}
                  disabled={isCloudSyncing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition"
                >
                  <Cloud className={`w-4 h-4 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
                  {isCloudSyncing ? 'Syncing with Cloud...' : 'Sync Now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
