import React, { useState, useRef, useEffect } from 'react';
import { PresetKit } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import {
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  Mic,
  Globe,
  Gauge,
  Sparkles,
  WifiOff,
  ChevronDown,
  ChevronRight,
  SlidersHorizontal,
  Activity,
  Plus,
  Download,
} from 'lucide-react';

interface HeaderProps {
  currentKit: PresetKit;
  onSelectKit: (kitId: string) => void;
  allKits: PresetKit[];
  bpm: number;
  onBpmChange: (newBpm: number) => void;
  masterVolume: number;
  onVolumeChange: (newVol: number) => void;
  onStopAll: () => void;
  onAutoGainStage: () => void;
  isGainStaging: boolean;
  onOpenFX: () => void;
  onOpenGroupFX: () => void;
  onOpenRecorder: () => void;
  onOpenMidi: () => void;
  onOpenCommunity: () => void;
  onAddGroup?: () => void;
  isRecording: boolean;
  fxActiveCount: number;
  midiDeviceCount: number;
  activeVoiceCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentKit,
  onSelectKit,
  allKits,
  bpm,
  onBpmChange,
  masterVolume,
  onVolumeChange,
  onStopAll,
  onAutoGainStage,
  isGainStaging,
  onOpenFX,
  onOpenGroupFX,
  onOpenRecorder,
  onOpenMidi,
  onOpenCommunity,
  onAddGroup,
  isRecording,
  fxActiveCount,
  midiDeviceCount,
  activeVoiceCount,
}) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { isInstallable, install } = usePWAInstall();
  const isOnline = useOnlineStatus();

  // Close Settings dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSettingsOpen]);

  // Tap tempo
  const [lastTap, setLastTap] = useState<number>(0);
  const handleTapTempo = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    if (lastTap > 0 && now - lastTap < 2000 && now - lastTap > 250) {
      const calculatedBpm = Math.round(60000 / (now - lastTap));
      if (calculatedBpm >= 40 && calculatedBpm <= 240) {
        onBpmChange(calculatedBpm);
      }
    }
    setLastTap(now);
  };

  return (
    <header className="border-b border-[#1f2331] bg-[#0d0e14] sticky top-0 z-40 select-none">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-amber-600/90 text-black text-xs font-bold py-1 px-4 flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>Stage Offline Mode — Audio buffers and sound banks running completely from offline cache.</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-5 py-2.5 flex items-center justify-between gap-3">
        {/* Left Section: Branding & Preset Kit Switcher & Add Group */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* App Branding */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 text-black font-black text-sm">
              P
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white uppercase">
                  PulsePad <span className="text-cyan-400 font-mono font-bold text-xs">PRO</span>
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
              </div>
              <p className="text-[9px] text-neutral-400 font-mono">
                SOUND SYSTEM ENGINE
              </p>
            </div>
          </div>

          {/* Preset Kit Switcher & Add Group Button */}
          <div className="flex items-center gap-1.5 ml-1">
            <select
              value={currentKit.id}
              onChange={(e) => onSelectKit(e.target.value)}
              className="bg-[#161925] border border-[#2b3348] rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-cyan-400 cursor-pointer max-w-[130px] sm:max-w-[200px] truncate"
              title="Select Sound Bank / Kit"
            >
              {allKits.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.name}
                </option>
              ))}
            </select>

            {onAddGroup && (
              <button
                type="button"
                onClick={onAddGroup}
                className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#161925] hover:bg-[#202538] border border-[#2b3348] text-neutral-200 hover:text-white text-xs font-bold transition active:scale-95"
                title="Create a new styled container (div) to hold a new set of sound pads"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Master Volume, STOP ALL & Consolidated Settings Button (Top-Right Corner) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Master Volume Slider */}
          <div className="flex items-center gap-2 bg-[#141722] px-2.5 py-1.5 rounded-xl border border-[#232838]">
            <button
              type="button"
              onClick={() => onVolumeChange(masterVolume > 0 ? 0 : 0.9)}
              className="text-neutral-400 hover:text-white transition"
              title={masterVolume > 0 ? 'Mute Master Output' : 'Unmute Master Output'}
            >
              {masterVolume > 0 ? (
                <Volume2 className="w-3.5 h-3.5 text-neutral-300" />
              ) : (
                <VolumeX className="w-3.5 h-3.5 text-red-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={masterVolume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-20 accent-cyan-400 cursor-pointer"
            />
            <span className="font-mono text-[10px] text-neutral-300 w-7 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* STOP ALL Master Panic Button */}
          <button
            type="button"
            onClick={onStopAll}
            className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-red-600/30 active:scale-95 transition"
            title="Silence all active sound pads, loops, and effects tails immediately"
          >
            <VolumeX className="w-4 h-4" />
            <span className="hidden xs:inline">Stop All</span>
            {activeVoiceCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          {/* Consolidated Settings Dropdown in Top-Right Corner */}
          <div className="relative" ref={settingsRef}>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm ${
                isSettingsOpen
                  ? 'bg-cyan-500 text-black border-cyan-400 font-extrabold'
                  : 'bg-[#161925] hover:bg-[#202538] text-white border-[#2b3348]'
              }`}
              title="Settings: Gain Stage, BPM, Master FX, Group FX, Recorder, MIDI Mapping, Community Hub"
            >
              <SlidersHorizontal className={`w-3.5 h-3.5 ${isSettingsOpen ? 'text-black' : 'text-cyan-400'}`} />
              <span>Settings</span>
              {/* Alert dot if recording or FX active */}
              {(isRecording || fxActiveCount > 0) && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              )}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Anchored to Top-Right */}
            {isSettingsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-[#12141f] border border-[#262c3e] rounded-2xl shadow-2xl z-50 p-3.5 space-y-3 divide-y divide-[#1f2434] animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-neutral-400 uppercase">
                    CONSOLE UTILITIES & SETTINGS
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ONLINE &lt;5MS
                  </span>
                </div>

                {/* 1. Auto Gain Staging */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      Gain Stage
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">Target -14 LUFS</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onAutoGainStage();
                    }}
                    disabled={isGainStaging}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition ${
                      isGainStaging
                        ? 'bg-amber-500 text-black animate-pulse font-black'
                        : 'bg-[#181b28] hover:bg-[#23283a] text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <Gauge className="w-3.5 h-3.5" />
                    <span>{isGainStaging ? 'Level Staging All Pads...' : 'Normalize Pad Volume Gains'}</span>
                  </button>
                </div>

                {/* 2. BPM Controls */}
                <div className="pt-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-cyan-400" />
                      Session BPM & Tempo
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{bpm} BPM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onBpmChange(Math.max(40, bpm - 1))}
                      className="w-8 h-8 rounded-lg bg-[#181b28] hover:bg-[#24293a] text-white font-bold text-sm flex items-center justify-center border border-[#282e40] active:scale-95"
                      title="Nudge BPM Down"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="40"
                      max="240"
                      value={bpm}
                      onChange={(e) => onBpmChange(parseInt(e.target.value) || 120)}
                      className="flex-1 bg-[#151724] border border-[#282e40] rounded-lg px-2 py-1.5 text-center font-mono font-bold text-white text-xs focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="button"
                      onClick={() => onBpmChange(Math.min(240, bpm + 1))}
                      className="w-8 h-8 rounded-lg bg-[#181b28] hover:bg-[#24293a] text-white font-bold text-sm flex items-center justify-center border border-[#282e40] active:scale-95"
                      title="Nudge BPM Up"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={handleTapTempo}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold active:scale-95"
                      title="Tap tempo repeatedly to calculate BPM"
                    >
                      TAP
                    </button>
                  </div>
                </div>

                {/* 3. Master FX */}
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenFX();
                    }}
                    className="w-full flex items-center justify-between text-left group p-2 rounded-xl bg-[#161824] hover:bg-[#1f2434] transition border border-[#232838]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <Sliders className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition">
                          Master FX Rack
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          VST Filters, Delay, Reverb & Stutter
                        </div>
                      </div>
                    </div>
                    {fxActiveCount > 0 ? (
                      <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold">
                        {fxActiveCount} ON
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                </div>

                {/* 4. Group FX */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenGroupFX();
                    }}
                    className="w-full flex items-center justify-between text-left group p-2 rounded-xl bg-[#161824] hover:bg-[#1f2434] transition border border-[#232838]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-pink-300 transition">
                          Group FX Channels
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Sidechain, Shimmer & Drops processing
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>

                {/* 5. Recorder */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenRecorder();
                    }}
                    className="w-full flex items-center justify-between text-left group p-2 rounded-xl bg-[#161824] hover:bg-[#1f2434] transition border border-[#232838]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                          isRecording
                            ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-red-300 transition">
                          Multitrack Studio Recorder
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Capture 24-bit live studio sessions
                        </div>
                      </div>
                    </div>
                    {isRecording ? (
                      <span className="px-2 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[10px] font-mono font-bold animate-pulse">
                        REC
                      </span>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-neutral-500" />
                    )}
                  </button>
                </div>

                {/* 6. MIDI Mapping */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenMidi();
                    }}
                    className="w-full flex items-center justify-between text-left group p-2 rounded-xl bg-[#161824] hover:bg-[#1f2434] transition border border-[#232838]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          MIDI Controller Mapping
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          External hardware & MIDI Learn
                        </div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      {midiDeviceCount} {midiDeviceCount === 1 ? 'Device' : 'Devices'}
                    </span>
                  </button>
                </div>

                {/* 7. Community Hub */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSettingsOpen(false);
                      onOpenCommunity();
                    }}
                    className="w-full flex items-center justify-between text-left group p-2 rounded-xl bg-[#161824] hover:bg-[#1f2434] transition border border-[#232838]"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-blue-300 transition">
                          Community Hub & Cloud Sync
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          Patch sharing & project backups
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-500" />
                  </button>
                </div>

                {/* Extra Utility: PWA Install if available */}
                {isInstallable && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSettingsOpen(false);
                        install();
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Install App for Offline Stage Use</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
