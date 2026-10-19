import React, { useState, useRef, useEffect } from 'react';
import { SoundPadData } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import { Volume2, Sliders, Repeat, Zap, Shield, Music, Disc, Sparkles } from 'lucide-react';

interface SoundPadProps {
  pad: SoundPadData;
  isPlaying: boolean;
  bpm: number;
  onEdit: (pad: SoundPadData) => void;
  onDropSample: (padId: string, file: File) => void;
  onSwapPads: (sourceId: string, targetId: string) => void;
  allPads: SoundPadData[];
}

export const SoundPad: React.FC<SoundPadProps> = ({
  pad,
  isPlaying,
  bpm,
  onEdit,
  onDropSample,
  onSwapPads,
  allPads,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const padRef = useRef<HTMLDivElement>(null);

  // Trigger pad audio
  const handleTrigger = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    setIsPressed(true);
    await audioEngine.triggerPad(pad, 1.0, allPads);
  };

  const handleRelease = () => {
    setIsPressed(false);
    if (pad.triggerMode === 'gate') {
      audioEngine.stopPad(pad.id);
    }
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }
      if (e.key.toUpperCase() === pad.keyShortcut.toUpperCase() && !e.repeat) {
        handleTrigger();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toUpperCase() === pad.keyShortcut.toUpperCase()) {
        handleRelease();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pad]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', pad.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // If an audio file was dragged from OS
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|aac|m4a|webm|flac)$/i)) {
        onDropSample(pad.id, file);
        return;
      }
    }

    // If another pad was dragged for swapping
    const sourcePadId = e.dataTransfer.getData('text/plain');
    if (sourcePadId && sourcePadId !== pad.id) {
      onSwapPads(sourcePadId, pad.id);
    }
  };

  const isBeating = isPlaying;

  return (
    <div
      ref={padRef}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleTrigger}
      onMouseUp={handleRelease}
      onMouseLeave={handleRelease}
      onTouchStart={handleTrigger}
      onTouchEnd={handleRelease}
      style={{
        borderColor: isPlaying ? pad.color : isPressed ? '#ffffff' : '#262a36',
        ['--bpm-interval' as string]: `${60 / (bpm || 128)}s`,
      }}
      className={`group relative flex flex-col justify-between p-3.5 rounded-xl cursor-pointer transition-transform duration-75 select-none
        ${isDragOver ? 'ring-2 ring-cyan-400 bg-[#22283a]' : 'bg-[#14161f]'}
        ${isPressed ? 'scale-[0.97] bg-[#1a1d29]' : 'hover:bg-[#181b26]'}
        ${isPlaying ? 'pad-playing-active border-2' : 'border border-[#262a36]'}
        min-h-[120px] sm:min-h-[140px]
      `}
    >
      {/* Top Header: Group pill, Key Shortcut, MIDI badge */}
      <div className="flex items-center justify-between pointer-events-none gap-1">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {/* Color accent tag */}
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
            style={{
              backgroundColor: pad.color,
              boxShadow: isPlaying ? `0 0 8px ${pad.color}` : 'none',
            }}
          />
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 truncate">
            {pad.group}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* AI Speech prompt badge */}
          {pad.aiPrompt && (
            <span
              className="text-[9px] font-mono px-1 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5 font-bold"
              title={`AI Speech Prompt: "${pad.aiPrompt}"`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              TTS
            </span>
          )}

          {/* Choke group badge */}
          {pad.chokeGroup && (
            <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-0.5">
              <Shield className="w-2.5 h-2.5" />
              CH{pad.chokeGroup}
            </span>
          )}

          {/* Keyboard shortcut */}
          <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1f2330] text-neutral-200 border border-[#32384a] shadow-inner">
            {pad.keyShortcut}
          </span>
        </div>
      </div>

      {/* Middle: Pad Name & Waveform Icon */}
      <div className="my-auto py-1 text-center pointer-events-none">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          {pad.triggerMode === 'toggle-loop' ? (
            <Repeat className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-400 animate-spin' : 'text-neutral-400'}`} />
          ) : pad.group === 'drops' || pad.group === 'tiktok' ? (
            <Zap className={`w-3.5 h-3.5 ${isPlaying ? 'text-amber-400' : 'text-neutral-400'}`} />
          ) : pad.customAudioUrl ? (
            <Disc className={`w-3.5 h-3.5 ${isPlaying ? 'text-cyan-400' : 'text-neutral-400'}`} />
          ) : (
            <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-white' : 'text-neutral-400'}`} />
          )}
          <span className="text-[10px] uppercase font-mono tracking-wide text-neutral-400">
            {pad.triggerMode === 'toggle-loop' ? 'LOOP' : pad.triggerMode.toUpperCase()}
          </span>
        </div>

        <h3
          className={`font-extrabold text-sm sm:text-base leading-tight tracking-tight uppercase line-clamp-2 transition-colors ${
            isPlaying ? 'text-white' : 'text-neutral-200 group-hover:text-white'
          }`}
        >
          {pad.name}
        </h3>

        {/* Pitch or Reverse indicators */}
        <div className="flex items-center justify-center gap-1.5 mt-1 text-[10px] font-mono text-neutral-400">
          {pad.pitch !== 0 && (
            <span className="text-cyan-300">
              {pad.pitch > 0 ? `+${pad.pitch}` : pad.pitch}st
            </span>
          )}
          {pad.reverse && <span className="text-pink-300 font-bold">REV</span>}
          {pad.pan !== 0 && (
            <span className="text-neutral-400">
              {pad.pan < 0 ? `L${Math.round(Math.abs(pad.pan) * 100)}` : `R${Math.round(pad.pan * 100)}`}
            </span>
          )}
        </div>
      </div>

      {/* Bottom Bar: Volume readout, Mode & Quick Edit button */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1f2330]">
        <div className="flex items-center gap-1 text-[10px] font-mono text-neutral-400">
          <Volume2 className="w-3 h-3 text-neutral-400" />
          <span>{Math.round(pad.volume * 100)}%</span>
        </div>

        {/* Edit button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(pad);
          }}
          className="p-1 -mr-1 rounded hover:bg-[#2b3040] text-neutral-400 hover:text-white transition-colors"
          title="Configure Sound Pad (Name, Color, Trim, Pitch, Trigger Mode)"
        >
          <Sliders className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
