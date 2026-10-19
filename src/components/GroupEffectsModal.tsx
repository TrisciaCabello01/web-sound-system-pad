import React, { useState } from 'react';
import { PadGroup, GroupEffect, GroupFXType, GroupFXMap } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import {
  Sliders,
  Plus,
  Trash2,
  Power,
  Volume2,
  Sparkles,
  Activity,
  Waves,
  Zap,
  Repeat,
  X,
  Music,
} from 'lucide-react';

interface GroupEffectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedInitialGroup?: PadGroup;
}

const GROUPS_LIST: { id: PadGroup; label: string; desc: string; color: string }[] = [
  { id: 'drops', label: 'DROPS', desc: 'Airhorns, sub drops & stadium impacts', color: '#ef4444' },
  { id: 'fx', label: 'FX', desc: 'Sirens, lasers, risers & vinyl scratches', color: '#06b6d4' },
  { id: 'loops', label: 'LOOPS', desc: 'Rhythmic background beds & sidechain grooves', color: '#10b981' },
  { id: 'drums', label: 'DRUMS', desc: 'Punch kicks, snares, claps & percussions', color: '#f59e0b' },
  { id: 'bass', label: 'BASS', desc: '808 subs, glides & low-frequency heat', color: '#8b5cf6' },
  { id: 'melodic', label: 'MELODIC', desc: 'Chords, guitar licks & synthesizer stabs', color: '#ec4899' },
  { id: 'worship', label: 'WORSHIP', desc: 'Ethereal shimmer pads, cathedral organs & praise', color: '#38bdf8' },
  { id: 'comedic', label: 'COMEDIC', desc: 'Cartoon boings, sad horns, slips & meme laughs', color: '#eab308' },
  { id: 'tiktok-songs', label: 'TIKTOK SONGS', desc: 'Drill hooks, phonk anthems & sped-up hits', color: '#f43f5e' },
  { id: 'trending-songs', label: 'TRENDING', desc: 'Afrobeats, EDM club anthems & dembow', color: '#a855f7' },
];

const AVAILABLE_FX_TYPES: { type: GroupFXType; label: string; desc: string; icon: string }[] = [
  { type: 'filter', label: 'Dynamic Filter', desc: 'Lowpass / Highpass frequency sweep & resonance', icon: '🎚️' },
  { type: 'delay', label: 'Stereo Echo / Delay', desc: 'Millisecond time delay with rhythmic feedback', icon: '🔄' },
  { type: 'reverb', label: 'Space Reverb', desc: 'Atmospheric room decay & acoustic tail', icon: '🌌' },
  { type: 'distortion', label: 'Tape Saturation / Drive', desc: 'Harmonic saturation & analog warmth for punch', icon: '⚡' },
  { type: 'sidechain', label: 'Sidechain Ducking', desc: 'Rhythmic 4-on-floor pumping volume swell', icon: '🌊' },
  { type: 'shimmer', label: 'Octave Shimmer', desc: 'Ethereal crystal octave-up reverb sparkle', icon: '✨' },
];

export const GroupEffectsModal: React.FC<GroupEffectsModalProps> = ({
  isOpen,
  onClose,
  selectedInitialGroup = 'drops',
}) => {
  if (!isOpen) return null;

  const [activeGroup, setActiveGroup] = useState<PadGroup>(selectedInitialGroup);
  const [groupFXMap, setGroupFXMap] = useState<GroupFXMap>(audioEngine.getAllGroupFX());
  const [showAddMenu, setShowAddMenu] = useState(false);

  const activeEffects: GroupEffect[] = groupFXMap[activeGroup] || [];

  const handleToggleEffect = (effectId: string) => {
    audioEngine.toggleGroupEffect(activeGroup, effectId);
    setGroupFXMap(audioEngine.getAllGroupFX());
  };

  const handleRemoveEffect = (effectId: string) => {
    audioEngine.removeGroupEffect(activeGroup, effectId);
    setGroupFXMap(audioEngine.getAllGroupFX());
  };

  const handleUpdateEffect = (effectId: string, updates: Partial<GroupEffect>) => {
    audioEngine.updateGroupEffect(activeGroup, effectId, updates);
    setGroupFXMap(audioEngine.getAllGroupFX());
  };

  const handleAddEffect = (type: GroupFXType) => {
    let newEffect: GroupEffect;
    switch (type) {
      case 'filter':
        newEffect = {
          id: `fx-${activeGroup}-filter-${Date.now()}`,
          type: 'filter',
          name: 'Resonant Filter Sweep',
          enabled: true,
          param1: 8000, // Cutoff Hz
          param2: 2.0,  // Q Resonance
          mix: 0.5,
        };
        break;
      case 'delay':
        newEffect = {
          id: `fx-${activeGroup}-delay-${Date.now()}`,
          type: 'delay',
          name: 'Stereo Echo Delay',
          enabled: true,
          param1: 0.35, // Time seconds
          param2: 0.5,  // Feedback
          mix: 0.4,
        };
        break;
      case 'reverb':
        newEffect = {
          id: `fx-${activeGroup}-reverb-${Date.now()}`,
          type: 'reverb',
          name: 'Cathedral Space Reverb',
          enabled: true,
          param1: 3.5, // Decay seconds
          param2: 0.6,
          mix: 0.35,
        };
        break;
      case 'distortion':
        newEffect = {
          id: `fx-${activeGroup}-dist-${Date.now()}`,
          type: 'distortion',
          name: 'Tape Drive & Saturation',
          enabled: true,
          param1: 18, // Drive dB
          param2: 0.6,
          mix: 0.3,
        };
        break;
      case 'sidechain':
        newEffect = {
          id: `fx-${activeGroup}-sc-${Date.now()}`,
          type: 'sidechain',
          name: 'Sidechain Ducking Pump',
          enabled: true,
          param1: 2.0, // Rate
          param2: 0.8, // Depth
          mix: 0.7,
        };
        break;
      case 'shimmer':
        newEffect = {
          id: `fx-${activeGroup}-shim-${Date.now()}`,
          type: 'shimmer',
          name: 'Lush Shimmer Reverb',
          enabled: true,
          param1: 0.85,
          param2: 0.5,
          mix: 0.45,
        };
        break;
      default:
        return;
    }

    audioEngine.addGroupEffect(activeGroup, newEffect);
    setGroupFXMap(audioEngine.getAllGroupFX());
    setShowAddMenu(false);
  };

  const currentGroupInfo = GROUPS_LIST.find((g) => g.id === activeGroup) || GROUPS_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl bg-[#11131a] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202432] bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Group Effects Rack & Insert Chains
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  DEDICATED GROUP BUSSES
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Add and customize real-time effects tailored for Drops, FX, Loops, Drums, Bass, Melodic, Worship & Comedic sounds
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#252a3a] text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Group Selector Horizontal Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-3 border-b border-[#202432] bg-[#13151f]">
          {GROUPS_LIST.map((grp) => {
            const count = (groupFXMap[grp.id] || []).length;
            const isSelected = activeGroup === grp.id;
            return (
              <button
                key={grp.id}
                onClick={() => {
                  setActiveGroup(grp.id);
                  setShowAddMenu(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
                  isSelected
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-[#181c28] text-neutral-300 hover:text-white border-[#272e40] hover:bg-[#202535]'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: grp.color }}
                />
                <span>{grp.label}</span>
                {count > 0 && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-black text-white' : 'bg-[#293044] text-neutral-300'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Group Banner & "Add Effect" Action Button */}
        <div className="px-5 py-3.5 bg-[#161925] border-b border-[#232a3b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shadow-sm"
              style={{ backgroundColor: currentGroupInfo.color, boxShadow: `0 0 10px ${currentGroupInfo.color}` }}
            />
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-tight">
                {currentGroupInfo.label} BUS EFFECTS CHAIN
              </h3>
              <p className="text-xs text-neutral-400">{currentGroupInfo.desc}</p>
            </div>
          </div>

          {/* Add Effect Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Effect for {currentGroupInfo.label}</span>
            </button>

            {/* Menu */}
            {showAddMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#171a27] border border-[#2e364c] rounded-xl shadow-2xl p-2 z-50 space-y-1">
                <span className="block px-3 py-1.5 text-[10px] font-mono font-bold uppercase text-neutral-400 border-b border-[#262c3e]">
                  Select Effect to Add:
                </span>
                {AVAILABLE_FX_TYPES.map((fx) => (
                  <button
                    key={fx.type}
                    onClick={() => handleAddEffect(fx.type)}
                    className="w-full text-left p-2 rounded-lg hover:bg-[#252b3d] text-neutral-200 hover:text-white transition flex items-start gap-2.5"
                  >
                    <span className="text-base">{fx.icon}</span>
                    <div>
                      <span className="block text-xs font-bold text-white">{fx.label}</span>
                      <span className="block text-[11px] text-neutral-400">{fx.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Effects List for Current Group */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeEffects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-[#24293a] rounded-2xl p-6">
              <Sliders className="w-8 h-8 mx-auto mb-2 text-neutral-400 opacity-50" />
              <h4 className="text-sm font-bold text-white">No insert effects added to {currentGroupInfo.label} yet</h4>
              <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
                Enhance your sound system by clicking "+ Add Effect" to insert a filter, delay, reverb, tape saturation, sidechain pump, or shimmer directly into this group bus.
              </p>
            </div>
          ) : (
            activeEffects.map((eff) => (
              <div
                key={eff.id}
                className={`p-4 rounded-xl border transition-all ${
                  eff.enabled
                    ? 'bg-[#171a26] border-[#2b3348] shadow-md'
                    : 'bg-[#13151f] border-[#222736] opacity-60'
                }`}
              >
                {/* Effect Card Top Bar */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleEffect(eff.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        eff.enabled
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                          : 'bg-[#222737] border-[#30374b] text-neutral-500'
                      }`}
                      title={eff.enabled ? 'Effect Active' : 'Effect Bypassed'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wide">
                        {eff.name}
                      </h4>
                      <span className="text-[10px] font-mono text-cyan-400">
                        {eff.type.toUpperCase()} INSERT
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveEffect(eff.id)}
                    className="p-1.5 rounded-lg bg-[#222737] hover:bg-red-500/20 text-neutral-400 hover:text-red-300 transition"
                    title="Remove Effect"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Effect Parameters Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#11131c] p-3 rounded-lg border border-[#202534]">
                  {/* Param 1 */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1 text-neutral-400">
                      <span>
                        {eff.type === 'filter' ? 'Cutoff' : eff.type === 'delay' ? 'Delay Time' : eff.type === 'reverb' ? 'Room Decay' : eff.type === 'distortion' ? 'Drive Gain' : eff.type === 'sidechain' ? 'LFO Rate' : 'Shimmer Tone'}
                      </span>
                      <span className="text-white font-bold">
                        {eff.type === 'filter'
                          ? `${Math.round(eff.param1)} Hz`
                          : eff.type === 'delay'
                          ? `${Math.round(eff.param1 * 1000)} ms`
                          : eff.type === 'reverb'
                          ? `${eff.param1.toFixed(1)} s`
                          : eff.type === 'distortion'
                          ? `+${Math.round(eff.param1)} dB`
                          : eff.type === 'sidechain'
                          ? `${eff.param1.toFixed(1)} Hz`
                          : `${Math.round(eff.param1 * 100)}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={eff.type === 'filter' ? '40' : eff.type === 'delay' ? '0.04' : eff.type === 'reverb' ? '0.5' : eff.type === 'distortion' ? '0' : '0.5'}
                      max={eff.type === 'filter' ? '20000' : eff.type === 'delay' ? '1.2' : eff.type === 'reverb' ? '8.0' : eff.type === 'distortion' ? '40' : '8.0'}
                      step={eff.type === 'filter' ? '20' : '0.02'}
                      value={eff.param1}
                      onChange={(e) => handleUpdateEffect(eff.id, { param1: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Param 2 */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1 text-neutral-400">
                      <span>
                        {eff.type === 'filter' ? 'Resonance Q' : eff.type === 'delay' ? 'Feedback' : eff.type === 'reverb' ? 'Damping' : eff.type === 'distortion' ? 'Harmonics' : eff.type === 'sidechain' ? 'Ducking Depth' : 'Width'}
                      </span>
                      <span className="text-white font-bold">
                        {eff.type === 'filter'
                          ? eff.param2.toFixed(1)
                          : `${Math.round(eff.param2 * 100)}%`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max={eff.type === 'filter' ? '12.0' : '0.9'}
                      step="0.05"
                      value={eff.param2}
                      onChange={(e) => handleUpdateEffect(eff.id, { param2: parseFloat(e.target.value) })}
                      className="w-full accent-cyan-400 cursor-pointer"
                    />
                  </div>

                  {/* Wet/Dry Mix */}
                  <div>
                    <div className="flex justify-between text-[11px] font-mono mb-1 text-neutral-400">
                      <span>Wet/Dry Mix</span>
                      <span className="text-cyan-300 font-bold">{Math.round(eff.mix * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1.0"
                      step="0.02"
                      value={eff.mix}
                      onChange={(e) => handleUpdateEffect(eff.id, { mix: parseFloat(e.target.value) })}
                      className="w-full accent-white cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#202432] bg-[#141622]">
          <span className="text-xs text-neutral-400 font-mono">
            Group busses feed directly into Master Limiter with zero phase distortion.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 text-xs transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
