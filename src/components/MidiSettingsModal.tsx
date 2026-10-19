import React, { useState, useEffect } from 'react';
import { midiManager, MidiDevice, MidiBinding, MidiLearnTarget } from '../audio/MidiManager';
import { SoundPadData } from '../types';
import { Radio, RefreshCw, Trash2, Check, AlertCircle, Cpu, Sliders, Volume2, Shield } from 'lucide-react';

interface MidiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pads: SoundPadData[];
  onTriggerPad: (padId: string, velocity?: number) => void;
}

export const MidiSettingsModal: React.FC<MidiSettingsModalProps> = ({
  isOpen,
  onClose,
  pads,
}) => {
  if (!isOpen) return null;

  const [devices, setDevices] = useState<MidiDevice[]>(midiManager.getDevices());
  const [bindings, setBindings] = useState<MidiBinding[]>(midiManager.getBindings());
  const [isSupported, setIsSupported] = useState<boolean>(midiManager.getIsSupported());
  const [learningTarget, setLearningTarget] = useState<MidiLearnTarget | null>(null);
  const [lastActivity, setLastActivity] = useState<{ type: string; number: number; value: number } | null>(null);

  useEffect(() => {
    async function initMidi() {
      const ok = await midiManager.init();
      setIsSupported(ok);
      setDevices(midiManager.getDevices());
    }
    initMidi();

    midiManager.setCallbacks({
      onDevicesChange: (devs) => setDevices(devs),
      onMidiActivity: (info) => setLastActivity(info),
    });
  }, []);

  const handleStartLearn = (target: MidiLearnTarget) => {
    setLearningTarget(target);
    midiManager.startLearn(target, (newBinding) => {
      setLearningTarget(null);
      setBindings(midiManager.getBindings());
    });
  };

  const handleCancelLearn = () => {
    midiManager.cancelLearn();
    setLearningTarget(null);
  };

  const handleResetDefault = () => {
    midiManager.resetAllBindings();
    setBindings([]);
  };

  const isTargetLearning = (target: MidiLearnTarget) => {
    if (!learningTarget) return false;
    return JSON.stringify(learningTarget) === JSON.stringify(target);
  };

  const getBindingInfo = (target: MidiLearnTarget): string | null => {
    const b = bindings.find((item) => JSON.stringify(item.target) === JSON.stringify(target));
    if (!b) return null;
    return b.msgType === 'note' ? `Note ${b.number}` : `CC #${b.number}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202432] bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                External Hardware MIDI Mapping
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                  devices.length > 0
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                }`}>
                  {devices.length} CONTROLLER{devices.length === 1 ? '' : 'S'} DETECTED
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Map hardware pads, keyboards, knobs, and triggers via Web MIDI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white text-black font-extrabold hover:bg-neutral-200 text-xs transition"
          >
            Done
          </button>
        </div>

        {/* Devices Banner & Live Activity */}
        <div className="p-4 bg-[#141722] border-b border-[#202432] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-bold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                Hardware Devices:
              </span>
              <span className="text-neutral-300">
                {devices.length > 0
                  ? devices.map((d) => d.name).join(', ')
                  : 'No USB/Bluetooth MIDI controller currently plugged in (Plug in any controller to use)'}
              </span>
            </div>

            {/* Live MIDI Activity Monitor */}
            <div className="font-mono text-[11px] px-2.5 py-1 rounded bg-[#0c0e15] border border-[#232839] text-neutral-300 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${lastActivity ? 'bg-emerald-400 shadow-sm shadow-emerald-400' : 'bg-neutral-600'}`} />
              <span>
                {lastActivity
                  ? `Live: ${lastActivity.type} #${lastActivity.number} [Val: ${lastActivity.value}]`
                  : 'Awaiting MIDI input...'}
              </span>
            </div>
          </div>

          {learningTarget && (
            <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs flex items-center justify-between animate-pulse">
              <span>MIDI LEARN ACTIVE: Press any key/pad or turn any knob on your hardware controller...</span>
              <button
                onClick={handleCancelLearn}
                className="px-2 py-0.5 rounded bg-black/40 text-white font-bold hover:bg-black/60"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Global Controls Mapping (Stop All, Master Vol, Filter Cutoff) */}
        <div className="p-5 border-b border-[#202432] space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
            Primary Performance Parameters & Kill Switches
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Stop All */}
            <div className="p-3 rounded-xl bg-[#171a26] border border-[#272d40] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-red-400 block">Stop All Panic</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {getBindingInfo({ type: 'stop-all' }) || 'Unmapped'}
                </span>
              </div>
              <button
                onClick={() => handleStartLearn({ type: 'stop-all' })}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  isTargetLearning({ type: 'stop-all' })
                    ? 'bg-amber-400 text-black animate-pulse'
                    : 'bg-[#262c3e] text-neutral-200 hover:bg-[#343c54]'
                }`}
              >
                {isTargetLearning({ type: 'stop-all' }) ? 'Touch...' : 'Map'}
              </button>
            </div>

            {/* Master Volume */}
            <div className="p-3 rounded-xl bg-[#171a26] border border-[#272d40] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Master Volume (CC)</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {getBindingInfo({ type: 'master-volume' }) || 'Unmapped'}
                </span>
              </div>
              <button
                onClick={() => handleStartLearn({ type: 'master-volume' })}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  isTargetLearning({ type: 'master-volume' })
                    ? 'bg-amber-400 text-black animate-pulse'
                    : 'bg-[#262c3e] text-neutral-200 hover:bg-[#343c54]'
                }`}
              >
                {isTargetLearning({ type: 'master-volume' }) ? 'Turn knob...' : 'Map'}
              </button>
            </div>

            {/* Filter Cutoff */}
            <div className="p-3 rounded-xl bg-[#171a26] border border-[#272d40] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-cyan-300 block">Filter Cutoff (CC)</span>
                <span className="text-[10px] font-mono text-neutral-400">
                  {getBindingInfo({ type: 'filter-cutoff' }) || 'Unmapped'}
                </span>
              </div>
              <button
                onClick={() => handleStartLearn({ type: 'filter-cutoff' })}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  isTargetLearning({ type: 'filter-cutoff' })
                    ? 'bg-amber-400 text-black animate-pulse'
                    : 'bg-[#262c3e] text-neutral-200 hover:bg-[#343c54]'
                }`}
              >
                {isTargetLearning({ type: 'filter-cutoff' }) ? 'Turn knob...' : 'Map'}
              </button>
            </div>
          </div>
        </div>

        {/* 16 Sound Pads Grid Mapping */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
              16 Sound Pads Hardware Mapping
            </h3>
            <button
              onClick={handleResetDefault}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset to Default Chromatic (Notes 36–51)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {pads.map((pad, idx) => {
              const target: MidiLearnTarget = { type: 'pad', padId: pad.id };
              const bindingStr = getBindingInfo(target) || `Note ${36 + idx}`;
              const isLearning = isTargetLearning(target);

              return (
                <div
                  key={pad.id}
                  className="p-2.5 rounded-xl bg-[#161924] border border-[#272d3f] flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#202534] text-neutral-300">
                      [{pad.keyShortcut}]
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: pad.color }}
                    />
                  </div>

                  <span className="text-xs font-bold text-white truncate block mb-2">{pad.name}</span>

                  <div className="flex items-center justify-between pt-1 border-t border-[#222736]">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">{bindingStr}</span>

                    <button
                      onClick={() => handleStartLearn(target)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isLearning
                          ? 'bg-amber-400 text-black animate-pulse'
                          : 'bg-[#242a3a] text-neutral-200 hover:bg-[#323a50]'
                      }`}
                    >
                      {isLearning ? 'Touch...' : 'Learn'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
