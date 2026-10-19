import React, { useState, useRef, useEffect } from 'react';
import { SoundPadData, PadGroup, TriggerMode } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import { midiManager, MidiBinding } from '../audio/MidiManager';
import { X, Play, RotateCcw, Upload, Volume2, Music, Radio, Shield, Check } from 'lucide-react';

interface PadEditorModalProps {
  pad: SoundPadData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPad: SoundPadData) => void;
  allPads: SoundPadData[];
}

const PRESET_COLORS = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#ffffff', // White
  '#64748b', // Slate
];

const GROUPS: { label: string; value: PadGroup }[] = [
  { label: 'Drops (Airhorns, Impacts)', value: 'drops' },
  { label: 'FX (Sirens, Lasers, Risers)', value: 'fx' },
  { label: 'Loops (Beds, Grooves)', value: 'loops' },
  { label: 'Drums (Kicks, Snares)', value: 'drums' },
  { label: 'Bass (808s, Glides)', value: 'bass' },
  { label: 'Melodic (Chords, Leads)', value: 'melodic' },
  { label: 'TikTok Songs & Hooks', value: 'tiktok-songs' },
  { label: 'Trending Global Anthems', value: 'trending-songs' },
  { label: 'Comedic & Meme Sounds', value: 'comedic' },
  { label: 'Worship & Praise', value: 'worship' },
  { label: 'Classic TikTok', value: 'tiktok' },
];

const BUILT_IN_SOUNDS = [
  // 1. Drops & FX
  { id: 'fx-airhorn', name: 'Sound System Airhorn 3x' },
  { id: 'fx-siren', name: 'Dub Siren Oscillator' },
  { id: 'fx-laser', name: 'FM Laser Sweep' },
  { id: 'fx-subdrop', name: 'Sub Drop 808' },
  { id: 'fx-scratch', name: 'DJ Baby Scratch' },
  { id: 'fx-impact', name: 'Mega Cinematic Impact' },
  { id: 'fx-riser', name: 'White Noise Riser' },
  { id: 'fx-gunshot', name: 'Gunshot Pop & Reverb' },
  
  // 2. TikTok Songs & Trending
  { id: 'tt-song-drill', name: 'TikTok Drill Vocal Hook Loop' },
  { id: 'tt-song-phonk', name: 'Drift Phonk Cowbell Anthem' },
  { id: 'tt-song-spedup', name: 'Sped-Up Pop Anthem Hook' },
  { id: 'tt-song-jersey', name: 'Jersey Club Bounce Loop' },
  { id: 'tt-song-synthwave', name: '80s Retro Synthwave Lead' },
  { id: 'trend-afrobeats', name: 'Afrobeats Log Drum Groove' },
  { id: 'trend-clubanthem', name: 'Festival EDM Supersaw Drop' },
  { id: 'trend-reggaeton', name: 'Dembow Reggaeton Rhythm' },
  { id: 'trend-hyperpop', name: 'Hyperpop Pluck Melody' },

  // 3. Comedic & Meme SFX
  { id: 'comedy-boing', name: 'Cartoon Spring Boing!' },
  { id: 'comedy-sadhorn', name: 'Sad Trombone (Wah-Wah)' },
  { id: 'comedy-slip', name: 'Slide Whistle & Cartoon Thud' },
  { id: 'comedy-crickets', name: 'Awkward Silence Crickets' },
  { id: 'comedy-laugh', name: 'Goofy Chuckle Laugh' },
  { id: 'comedy-punch', name: 'Slapstick Comic Punch' },
  { id: 'tt-boom', name: 'Vine Boom Low Sub' },
  { id: 'tt-bruh', name: 'Bruh Formant Vocal' },
  { id: 'tt-scratch', name: 'Record Stop Spin Down' },
  { id: 'tt-ohno', name: 'Oh No Marimba Motif' },
  { id: 'tt-swoosh', name: 'Transition Whoosh' },
  { id: 'tt-gong', name: 'Suspense Gong' },
  { id: 'tt-wow', name: 'Anime Wow Glide' },
  { id: 'tt-stomp', name: '808 Brass Stomp' },

  // 4. Worship & Praise
  { id: 'worship-shimmer', name: 'Ethereal Shimmer Pad Loop' },
  { id: 'worship-piano', name: 'Felt Piano Worship Ballad' },
  { id: 'worship-swell', name: 'Ambient Cathedral Swell Guitar' },
  { id: 'worship-acoustic', name: 'Acoustic Praise Strumming' },
  { id: 'worship-choir', name: 'Angelic Choir Harmony Chord' },
  { id: 'worship-organ', name: 'Gospel Hammond B3 Rotary' },
  { id: 'worship-strings', name: 'Majestic Praise Strings' },

  // 5. Studio Sampler & Lo-Fi Pulse
  { id: 'loop-lofi-chill', name: 'Lo-Fi Chill Beat Loop' },
  { id: 'loop-deephouse', name: 'Deep House Pump Loop' },
  { id: 'loop-trapdrill', name: 'Trap / Drill Rolling Loop' },
  { id: 'loop-ambient', name: 'Warm Ambient Drone Loop' },
  { id: 'loop-jazzchords', name: 'Neo-Soul Rhodes Loop' },
  { id: 'lofi-kick', name: 'Lo-Fi Round Punch Kick' },
  { id: 'lofi-snare', name: 'Dusty Tape Snare' },
  { id: 'lofi-clap', name: 'Vintage Analog Handclap' },
  { id: 'lofi-rim', name: 'Crisp Wooden Rimshot' },
  { id: 'lofi-hihat-closed', name: 'Crispy Closed Hi-Hat' },
  { id: 'lofi-hihat-open', name: 'Sizzling Open Hi-Hat' },
  { id: 'lofi-rhodes', name: 'Rhodes F#m9 Chord Stab' },
  { id: 'lofi-guitar', name: 'Muted Jazz Guitar Pluck' },
  { id: 'lofi-808sub', name: '808 Glide Deep Sub' },
];

export const PadEditorModal: React.FC<PadEditorModalProps> = ({
  pad,
  isOpen,
  onClose,
  onSave,
  allPads,
}) => {
  if (!isOpen || !pad) return null;

  const [formData, setFormData] = useState<SoundPadData>({ ...pad });
  const [isAuditioning, setIsAuditioning] = useState(false);
  const [isLearningMidi, setIsLearningMidi] = useState(false);
  const [waveformPeaks, setWaveformPeaks] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load waveform peaks for visual trimming
  useEffect(() => {
    let isMounted = true;
    async function loadWaveform() {
      const buffer = await audioEngine.getAudioBuffer(formData);
      if (buffer && isMounted) {
        const raw = buffer.getChannelData(0);
        const steps = 80;
        const stepSize = Math.floor(raw.length / steps);
        const peaks: number[] = [];
        for (let i = 0; i < steps; i++) {
          let max = 0;
          const start = i * stepSize;
          for (let j = 0; j < stepSize; j += 4) {
            const v = Math.abs(raw[start + j]);
            if (v > max) max = v;
          }
          peaks.push(max);
        }
        setWaveformPeaks(peaks);
      }
    }
    loadWaveform();
    return () => {
      isMounted = false;
    };
  }, [formData.soundId, formData.customAudioUrl]);

  // Audition playback
  const handleAudition = async () => {
    setIsAuditioning(true);
    await audioEngine.triggerPad(formData, 1.0, allPads);
    setTimeout(() => {
      setIsAuditioning(false);
    }, 1200);
  };

  // Custom audio file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      name: file.name.replace(/\.[^/.]+$/, '').toUpperCase(),
      customAudioUrl: url,
      customAudioName: file.name,
      category: 'custom',
    }));
  };

  // MIDI Learn for this pad
  const handleMidiLearn = () => {
    setIsLearningMidi(true);
    midiManager.startLearn({ type: 'pad', padId: pad.id }, (binding: MidiBinding) => {
      setIsLearningMidi(false);
      setFormData((prev) => ({
        ...prev,
        midiNote: binding.number,
      }));
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col bg-[#12141c] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#222634] bg-[#161822]">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: formData.color, boxShadow: `0 0 10px ${formData.color}` }}
            />
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                Configure Pad: {formData.keyShortcut}
              </h2>
              <p className="text-xs text-neutral-400">Tactile Sound & Performance Parameter Settings</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAudition}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isAuditioning
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'bg-[#252a3a] text-neutral-200 hover:bg-[#32384e]'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Audition
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#252a3a] text-neutral-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-5 text-xs sm:text-sm">
          {/* Pad Name & Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Pad Label Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-lg px-3 py-2 text-white font-bold focus:outline-none focus:border-cyan-400"
                maxLength={24}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Category Group
              </label>
              <select
                value={formData.group}
                onChange={(e) => setFormData({ ...formData, group: e.target.value as PadGroup })}
                className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-400"
              >
                {GROUPS.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Pad Accent Color
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {PRESET_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: col })}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    formData.color === col ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#12141c]' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: col }}
                >
                  {formData.color === col && (
                    <Check className={`w-3.5 h-3.5 ${col === '#ffffff' ? 'text-black' : 'text-white'}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Trigger Mode & Choke Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
                Trigger Playback Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['one-shot', 'gate', 'toggle-loop', 'retrigger'] as TriggerMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setFormData({ ...formData, triggerMode: mode })}
                    className={`px-2.5 py-2 rounded-lg text-xs font-bold text-center uppercase tracking-wider border transition-colors ${
                      formData.triggerMode === mode
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#1b1f2b] border-[#2c3245] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {mode.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Choke Group (Cutoff)
              </label>
              <p className="text-[11px] text-neutral-400 mb-1.5">
                Pads in the same choke group cut each other off (e.g. Open/Closed Hi-Hats).
              </p>
              <select
                value={formData.chokeGroup || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setFormData({ ...formData, chokeGroup: val > 0 ? val : undefined });
                }}
                className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-400"
              >
                <option value={0}>None (No Choke)</option>
                <option value={1}>Choke Group 1 (Hi-Hats)</option>
                <option value={2}>Choke Group 2 (Bass Cuts)</option>
                <option value={3}>Choke Group 3 (Vocal Stabs)</option>
                <option value={4}>Choke Group 4 (Loops)</option>
              </select>
            </div>
          </div>

          {/* Waveform Visualizer & Start/End Trimmer */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Sample Waveform & Trimmer
              </label>
              <span className="text-[11px] font-mono text-neutral-400">
                Start: {Math.round(formData.trimStart * 100)}% | End: {Math.round(formData.trimEnd * 100)}%
              </span>
            </div>

            {/* Visual Waveform Canvas approximation */}
            <div className="relative h-16 bg-[#0a0b0f] border border-[#242938] rounded-xl overflow-hidden flex items-center px-2">
              <div className="w-full flex items-center justify-between gap-[2px] h-10">
                {waveformPeaks.map((peak, idx) => {
                  const norm = idx / waveformPeaks.length;
                  const inRange = norm >= formData.trimStart && norm <= formData.trimEnd;
                  return (
                    <span
                      key={idx}
                      className="w-full rounded-sm transition-colors"
                      style={{
                        height: `${Math.max(10, peak * 100)}%`,
                        backgroundColor: inRange ? formData.color : '#2d3345',
                        opacity: inRange ? 0.9 : 0.3,
                      }}
                    />
                  );
                })}
              </div>

              {/* Start Trim Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-cyan-400 shadow-md shadow-cyan-400/50 pointer-events-none"
                style={{ left: `${formData.trimStart * 100}%` }}
              />
              {/* End Trim Line */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-pink-400 shadow-md shadow-pink-400/50 pointer-events-none"
                style={{ left: `${formData.trimEnd * 100}%` }}
              />
            </div>

            {/* Trimmer Sliders */}
            <div className="grid grid-cols-2 gap-4 mt-2">
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Trim Start Point</span>
                <input
                  type="range"
                  min="0"
                  max="0.9"
                  step="0.01"
                  value={formData.trimStart}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, trimStart: Math.min(val, formData.trimEnd - 0.05) });
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block mb-1">Trim End Point</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.01"
                  value={formData.trimEnd}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, trimEnd: Math.max(val, formData.trimStart + 0.05) });
                  }}
                  className="w-full accent-pink-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Volume, Pan, Pitch & Reverse */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-[#161924] p-3 rounded-xl border border-[#232737]">
            {/* Volume */}
            <div>
              <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                <span>Pad Volume</span>
                <span className="font-mono text-white">{Math.round(formData.volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: parseFloat(e.target.value) })}
                className="w-full accent-white cursor-pointer"
              />
            </div>

            {/* Pan */}
            <div>
              <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                <span>Stereo Pan</span>
                <span className="font-mono text-white">
                  {formData.pan === 0
                    ? 'Center'
                    : formData.pan < 0
                    ? `L${Math.round(Math.abs(formData.pan) * 100)}`
                    : `R${Math.round(formData.pan * 100)}`}
                </span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.05"
                value={formData.pan}
                onChange={(e) => setFormData({ ...formData, pan: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Pitch Tuning */}
            <div>
              <div className="flex justify-between text-neutral-400 text-[11px] mb-1">
                <span>Pitch Tune</span>
                <span className="font-mono text-cyan-300">
                  {formData.pitch > 0 ? `+${formData.pitch}` : formData.pitch} st
                </span>
              </div>
              <input
                type="range"
                min="-12"
                max="12"
                step="1"
                value={formData.pitch}
                onChange={(e) => setFormData({ ...formData, pitch: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Reverse */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, reverse: !formData.reverse })}
                className={`w-full py-2 px-3 rounded-lg border font-bold text-xs uppercase transition-all flex items-center justify-center gap-1.5 ${
                  formData.reverse
                    ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                    : 'bg-[#1e2230] border-[#30374c] text-neutral-400 hover:text-white'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {formData.reverse ? 'Reverse ON' : 'Reverse'}
              </button>
            </div>
          </div>

          {/* Sound Source Selection: Built-in synthesizers or Custom file */}
          <div className="border border-[#232737] rounded-xl p-3.5 bg-[#161924]">
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
              Sound Source Sample
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  value={formData.soundId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      soundId: e.target.value,
                      customAudioUrl: undefined,
                      customAudioName: undefined,
                    })
                  }
                  className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-lg px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-400"
                >
                  <optgroup label="Built-in Synth Engine Sounds">
                    {BUILT_IN_SOUNDS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Upload button */}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#252a3b] hover:bg-[#31374d] text-white font-bold border border-[#3b435b] flex items-center justify-center gap-2 transition"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  Upload Sample
                </button>
              </div>
            </div>

            {formData.customAudioName && (
              <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
                <span>Loaded custom file:</span>
                <span className="font-mono text-white underline">{formData.customAudioName}</span>
              </p>
            )}
          </div>

          {/* Hardware MIDI Mapping Integration */}
          <div className="flex items-center justify-between bg-[#191d2a] p-3 rounded-xl border border-[#2a3042]">
            <div>
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                MIDI Note Binding: {formData.midiNote ? `Note ${formData.midiNote}` : 'Unmapped'}
              </span>
              <p className="text-[11px] text-neutral-400">Trigger this pad using external hardware drum pads or keys.</p>
            </div>

            <button
              type="button"
              onClick={handleMidiLearn}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isLearningMidi
                  ? 'bg-amber-400 text-black animate-pulse font-extrabold'
                  : 'bg-[#292f42] text-neutral-200 hover:bg-[#38415c] border border-[#3f4863]'
              }`}
            >
              {isLearningMidi ? 'Touch MIDI Key...' : 'MIDI Learn'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[#222634] bg-[#161822]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-white text-black font-extrabold hover:bg-neutral-200 shadow-lg shadow-white/10 transition active:scale-95"
          >
            Apply & Save
          </button>
        </div>
      </div>
    </div>
  );
};
