import React, { useState } from 'react';
import { SoundPadData, PadGroup, TriggerMode } from '../types';
import { X, Sparkles, Mic, Music, Upload, Keyboard, Sliders, Shield } from 'lucide-react';
import { saveCustomSample } from '../services/storage';

interface AddPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGroup: PadGroup;
  allGroups: { id: string; name: string }[];
  existingPads: SoundPadData[];
  onAddPad: (newPad: SoundPadData) => void;
}

const PRESET_SOUNDS = [
  // Drops & FX
  { id: 'fx-airhorn', label: 'Airhorn Blast', category: 'effects', group: 'drops' },
  { id: 'fx-subdrop', label: '808 Sub Drop Boom', category: 'effects', group: 'drops' },
  { id: 'fx-laser', label: 'Laser Zap Sweep', category: 'effects', group: 'drops' },
  { id: 'fx-siren', label: 'Rave Emergency Siren', category: 'effects', group: 'drops' },
  { id: 'fx-scratch', label: 'Vinyl Scratch', category: 'effects', group: 'fx' },
  { id: 'fx-impact', label: 'Cinematic Hit Impact', category: 'effects', group: 'drops' },
  { id: 'fx-riser', label: 'EDM Noise Riser', category: 'effects', group: 'drops' },
  { id: 'fx-stadium-horn', label: 'Stadium Horn Blast', category: 'effects', group: 'drops' },
  
  // Drums
  { id: 'lofi-kick', label: 'Punchy Vinyl Kick', category: 'lofi', group: 'drums' },
  { id: 'lofi-snare', label: 'Dusty Studio Snare', category: 'lofi', group: 'drums' },
  { id: 'lofi-clap', label: 'Layered Handclap', category: 'lofi', group: 'drums' },
  { id: 'lofi-hihat-closed', label: 'Crisp Closed Hi-Hat', category: 'lofi', group: 'drums' },
  { id: 'lofi-hihat-open', label: 'Sizzling Open Hi-Hat', category: 'lofi', group: 'drums' },
  { id: 'lofi-rim', label: 'Wood Rim Click', category: 'lofi', group: 'drums' },
  { id: '808-sub', label: '808 Low-End Bass Hit', category: 'effects', group: 'bass' },

  // TikTok Viral
  { id: 'tt-boom', label: 'Vine Boom Bass Impact', category: 'tiktok', group: 'tiktok' },
  { id: 'tt-bruh', label: 'Bruh Sound FX', category: 'tiktok', group: 'tiktok' },
  { id: 'tt-ohno', label: 'Oh No Vocal Sample', category: 'tiktok', group: 'tiktok' },
  { id: 'tt-wow', label: 'Anime Wow Sound', category: 'tiktok', group: 'tiktok' },
  { id: 'tt-stomp', label: 'Club Drill Stomp', category: 'tiktok', group: 'tiktok' },
  { id: 'tt-gong', label: 'Resonant Gong Hit', category: 'tiktok', group: 'tiktok' },
  { id: 'tt-swoosh', label: 'Speed Whip Swoosh', category: 'tiktok', group: 'tiktok' },

  // Songs & Trending
  { id: 'tt-song-phonk', label: 'Phonk Cowbell Drift Loop', category: 'songs', group: 'tiktok-songs' },
  { id: 'tt-song-drill', label: 'Viral Drill Club Beat', category: 'songs', group: 'tiktok-songs' },
  { id: 'tt-song-synth', label: 'Hyperpop Rave Synth Lead', category: 'songs', group: 'tiktok-songs' },
  { id: 'tt-song-house', label: 'Slap House Bassline Drop', category: 'songs', group: 'trending-songs' },
  { id: 'tt-song-amapiano', label: 'Amapiano Log Drum Pulse', category: 'songs', group: 'trending-songs' },

  // Comedic
  { id: 'meme-boing', label: 'Cartoon Spring Boing', category: 'comedic', group: 'comedic' },
  { id: 'meme-trombone', label: 'Sad Trombone Wah-Wah', category: 'comedic', group: 'comedic' },
  { id: 'meme-slip', label: 'Banana Peel Slide', category: 'comedic', group: 'comedic' },
  { id: 'meme-quack', label: 'Duck Toy Quack', category: 'comedic', group: 'comedic' },
  { id: 'meme-laugh', label: 'Sitcom Studio Laugh Track', category: 'comedic', group: 'comedic' },

  // Worship & Melodic
  { id: 'worship-pad-cathedral', label: 'Cathedral Ambient Swell', category: 'worship', group: 'worship' },
  { id: 'worship-pad-prayer', label: 'Prayer Warm Atmospheric Pad', category: 'worship', group: 'worship' },
  { id: 'worship-shimmer-drone', label: 'Holy Octave Shimmer Drone', category: 'worship', group: 'worship' },
  { id: 'worship-piano-reverb', label: 'Grand Reverberant Piano Chord', category: 'worship', group: 'worship' },
  { id: 'bg-lofi-groove', label: 'Chill Lo-Fi Full Loop', category: 'loops', group: 'loops' },
  { id: 'lofi-rhodes', label: 'Vintage Electric Piano Chords', category: 'melodic', group: 'melodic' },
  { id: 'lofi-tape-keys', label: 'Warm Lo-Fi Tape Organ', category: 'melodic', group: 'melodic' },
];

const PAD_COLORS = [
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#e2e8f0', // White / Silver
];

export const AddPadModal: React.FC<AddPadModalProps> = ({
  isOpen,
  onClose,
  targetGroup,
  allGroups,
  existingPads,
  onAddPad,
}) => {
  const [name, setName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<PadGroup>(targetGroup || 'drops');
  const [soundSourceType, setSoundSourceType] = useState<'prompt' | 'synth' | 'upload'>('prompt');
  
  // Prompt mode
  const [aiPrompt, setAiPrompt] = useState('An excited crowd cheering wildly');
  const [accompanySound, setAccompaniedSound] = useState('fx-impact');

  // Synth mode
  const [selectedSoundId, setSelectedSoundId] = useState('fx-airhorn');

  // Upload mode
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Pad Settings
  const [triggerMode, setTriggerMode] = useState<TriggerMode>('one-shot');
  const [keyShortcut, setKeyShortcut] = useState('');
  const [color, setColor] = useState(PAD_COLORS[0]);

  // Determine next available key shortcut
  React.useEffect(() => {
    if (isOpen) {
      const usedKeys = new Set(existingPads.map((p) => p.keyShortcut.toUpperCase()));
      const candidates = ['1', '2', '3', '4', 'Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F', 'Z', 'X', 'C', 'V', '5', '6', '7', '8', 'T', 'Y', 'U', 'I', 'G', 'H', 'J', 'K', 'B', 'N', 'M'];
      const nextKey = candidates.find((k) => !usedKeys.has(k)) || '1';
      setKeyShortcut(nextKey);
      setSelectedGroup(targetGroup || 'drops');
    }
  }, [isOpen, targetGroup, existingPads]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setUploadedFile(file);
      if (!name) {
        setName(file.name.replace(/\.[^/.]+$/, '').toUpperCase().slice(0, 18));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || (soundSourceType === 'prompt' ? 'AI CHEER' : 'NEW PAD');
    const newPadId = `pad-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    let soundId = selectedSoundId;
    let customAudioUrl: string | undefined;
    let customAudioName: string | undefined;

    if (soundSourceType === 'upload' && uploadedFile) {
      customAudioUrl = URL.createObjectURL(uploadedFile);
      customAudioName = uploadedFile.name;
      soundId = `custom-${newPadId}`;
      try {
        await saveCustomSample(newPadId, uploadedFile);
      } catch (err) {
        console.warn('Could not save to IDB:', err);
      }
    } else if (soundSourceType === 'prompt') {
      soundId = accompanySound;
    }

    const newPad: SoundPadData = {
      id: newPadId,
      name: finalName.toUpperCase(),
      group: selectedGroup,
      color: color,
      keyShortcut: (keyShortcut || '1').toUpperCase(),
      triggerMode: triggerMode,
      volume: 1.0,
      pan: 0,
      pitch: 0,
      reverse: false,
      trimStart: 0,
      trimEnd: 1,
      soundId: soundId,
      customAudioUrl: customAudioUrl,
      customAudioName: customAudioName,
      aiPrompt: soundSourceType === 'prompt' ? aiPrompt.trim() : undefined,
      category: soundSourceType === 'upload' ? 'custom' : 'effects',
    };

    onAddPad(newPad);
    setName('');
    setUploadedFile(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#12141e] border border-[#262c3e] w-full max-w-lg rounded-2xl p-5 shadow-2xl relative select-none max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#202536] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
                Add Sound Pad
              </h3>
              <p className="text-[11px] text-neutral-400">
                Configure pad name, sound source, and trigger controls
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202538] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pad Name & Target Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Pad Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Cheering Meme, 808 Hit"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161925] border border-[#2b3348] rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1">
                Target Group Container
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full bg-[#161925] border border-[#2b3348] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-400 font-bold"
              >
                {allGroups.map((g) => (
                  <option key={g.id} value={g.id}>
                    📂 {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sound Source Selector Tabs */}
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Select Sound Source
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0f1118] border border-[#232838] rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setSoundSourceType('prompt')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  soundSourceType === 'prompt'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>AI Prompt / Speech</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundSourceType('synth')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  soundSourceType === 'synth'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Studio Synth</span>
              </button>

              <button
                type="button"
                onClick={() => setSoundSourceType('upload')}
                className={`py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  soundSourceType === 'upload'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Sample</span>
              </button>
            </div>

            {/* TAB 1: AI Prompt / TTS */}
            {soundSourceType === 'prompt' && (
              <div className="p-3 bg-[#161925] border border-[#2b3348] rounded-xl space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      AI Text-to-Speech / Instruction Prompt
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Offline Web Speech</span>
                  </div>
                  <input
                    type="text"
                    required={soundSourceType === 'prompt'}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. An excited crowd cheering wildly"
                    className="w-full bg-[#10121a] border border-[#2d354b] rounded-lg px-3 py-2 text-xs text-cyan-300 font-mono placeholder-neutral-600 focus:outline-none focus:border-cyan-400"
                  />
                  <p className="text-[10px] text-neutral-400 mt-1">
                    When this pad is triggered, it speaks this prompt text with instant speech synthesis and plays the audio effect below.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                    Accompaniment Sound Layer
                  </label>
                  <select
                    value={accompanySound}
                    onChange={(e) => setAccompaniedSound(e.target.value)}
                    className="w-full bg-[#10121a] border border-[#2d354b] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="fx-impact">Cinematic Crowd Impact</option>
                    <option value="fx-airhorn">Stadium Airhorn Fanfare</option>
                    <option value="fx-subdrop">Sub Drop Boom</option>
                    <option value="fx-laser">Laser Zap</option>
                    <option value="tt-boom">Vine Boom</option>
                    <option value="meme-cheer">Triumphant Fanfare</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB 2: Studio Synth Presets */}
            {soundSourceType === 'synth' && (
              <div className="p-3 bg-[#161925] border border-[#2b3348] rounded-xl space-y-2">
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Choose Algorithmic Sound Preset
                </label>
                <select
                  value={selectedSoundId}
                  onChange={(e) => setSelectedSoundId(e.target.value)}
                  className="w-full bg-[#10121a] border border-[#2d354b] rounded-lg px-3 py-2 text-xs text-white font-bold focus:outline-none focus:border-cyan-400"
                >
                  <optgroup label="Drops & FX">
                    {PRESET_SOUNDS.filter((s) => s.category === 'effects').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Drums & Percussion">
                    {PRESET_SOUNDS.filter((s) => s.category === 'lofi' && s.group === 'drums').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="TikTok Viral Hits">
                    {PRESET_SOUNDS.filter((s) => s.category === 'tiktok').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Trending Songs & Grooves">
                    {PRESET_SOUNDS.filter((s) => s.category === 'songs').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Comedic Sounds">
                    {PRESET_SOUNDS.filter((s) => s.category === 'comedic').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Worship & Melodic">
                    {PRESET_SOUNDS.filter((s) => s.category === 'worship' || s.group === 'melodic' || s.group === 'loops').map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            )}

            {/* TAB 3: Upload Sample */}
            {soundSourceType === 'upload' && (
              <div className="p-4 bg-[#161925] border border-dashed border-[#2b3348] rounded-xl text-center">
                <input
                  type="file"
                  id="modal-audio-file"
                  accept="audio/*,.mp3,.wav,.ogg,.m4a,.webm"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="modal-audio-file"
                  className="cursor-pointer flex flex-col items-center justify-center gap-1.5 text-xs text-neutral-300 hover:text-white"
                >
                  <Upload className="w-6 h-6 text-cyan-400" />
                  <span className="font-bold">
                    {uploadedFile ? uploadedFile.name : 'Choose Audio File (.wav, .mp3, .ogg)'}
                  </span>
                  <span className="text-[10px] text-neutral-500">
                    Audio is cached in your browser for instant playback
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Pad Parameters: Trigger Mode, Key Shortcut, Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#202536]">
            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Trigger Mode
              </label>
              <select
                value={triggerMode}
                onChange={(e) => setTriggerMode(e.target.value as TriggerMode)}
                className="w-full bg-[#161925] border border-[#2b3348] rounded-xl px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none"
              >
                <option value="one-shot">One-Shot</option>
                <option value="toggle-loop">Toggle Loop</option>
                <option value="gate">Gate (Hold)</option>
                <option value="retrigger">Retrigger</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1 flex items-center gap-1">
                <Keyboard className="w-3.5 h-3.5 text-cyan-400" />
                Key Trigger
              </label>
              <input
                type="text"
                maxLength={2}
                value={keyShortcut}
                onChange={(e) => setKeyShortcut(e.target.value.toUpperCase())}
                className="w-full bg-[#161925] border border-[#2b3348] rounded-xl px-2.5 py-1.5 text-xs text-center font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 uppercase mb-1">
                Pad Color
              </label>
              <div className="flex items-center gap-1.5 py-1">
                {PAD_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full border transition ${
                      color === c ? 'border-white scale-110 shadow-sm' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#202536]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white bg-[#191c28] hover:bg-[#232838] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-black text-black bg-emerald-400 hover:bg-emerald-300 transition uppercase tracking-wider shadow-lg shadow-emerald-500/20"
            >
              ➕ Append Pad to Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
