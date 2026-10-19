import React, { useState } from 'react';
import { FXSettings } from '../types';
import { audioEngine } from '../audio/AudioEngine';
import { Sliders, Sparkles, Activity, Disc, Zap, VolumeX, RefreshCw } from 'lucide-react';

interface EffectsRackProps {
  fxSettings: FXSettings;
  onUpdateFX: (settings: Partial<FXSettings>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({
  fxSettings,
  onUpdateFX,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'filter' | 'delay' | 'reverb' | 'saturation'>('filter');

  const toggleAllFX = (enable: boolean) => {
    onUpdateFX({
      filterEnabled: enable,
      delayEnabled: enable,
      reverbEnabled: enable,
      distortionEnabled: enable,
      bitcrushEnabled: enable,
    });
  };

  const handleStutter = (rate: FXSettings['stutterRate']) => {
    // Instant stutter glitch: turn on fast delay momentarily
    const prevDelay = fxSettings.delayEnabled;
    const prevMix = fxSettings.delayMix;
    const prevTime = fxSettings.delayTime;
    const prevFb = fxSettings.delayFeedback;

    let delayVal = 0.08;
    if (rate === '1/4') delayVal = 0.25;
    if (rate === '1/8') delayVal = 0.125;
    if (rate === '1/16') delayVal = 0.062;
    if (rate === '1/32') delayVal = 0.031;

    onUpdateFX({
      delayEnabled: true,
      delayMix: 0.9,
      delayTime: delayVal,
      delayFeedback: 0.85,
    });

    setTimeout(() => {
      onUpdateFX({
        delayEnabled: prevDelay,
        delayMix: prevMix,
        delayTime: prevTime,
        delayFeedback: prevFb,
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202432] bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Real-Time VST Effects Rack
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  LIVE INSERT BUS
                </span>
              </h2>
              <p className="text-xs text-neutral-400">Studio audio processor chain running at ultra-low latency</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleAllFX(false)}
              className="px-2.5 py-1.5 rounded-lg bg-[#202535] hover:bg-[#2b3247] text-neutral-300 hover:text-white text-xs font-semibold border border-[#30374b] transition flex items-center gap-1.5"
            >
              <VolumeX className="w-3.5 h-3.5" />
              Bypass All
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-white text-black font-extrabold hover:bg-neutral-200 text-xs transition"
            >
              Done
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-[#202432] bg-[#12141e] px-4">
          {[
            { id: 'filter', label: '1. Filter Unit', enabled: fxSettings.filterEnabled },
            { id: 'delay', label: '2. Echo / Delay', enabled: fxSettings.delayEnabled },
            { id: 'reverb', label: '3. Space Reverb', enabled: fxSettings.reverbEnabled },
            { id: 'saturation', label: '4. Saturation & Lo-Fi', enabled: fxSettings.distortionEnabled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold transition-all border-b-2 -mb-[1px] ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-white bg-[#1a1e2c]'
                  : 'border-transparent text-neutral-400 hover:text-neutral-200 hover:bg-[#151824]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  tab.enabled ? 'bg-cyan-400 shadow-sm shadow-cyan-400' : 'bg-neutral-600'
                }`}
              />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-6">
          {/* TAB 1: FILTER */}
          {activeTab === 'filter' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Dynamic Biquad Filter</h3>
                  <p className="text-xs text-neutral-400">Lowpass, Highpass, and Bandpass frequency filtering</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateFX({ filterEnabled: !fxSettings.filterEnabled })}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                    fxSettings.filterEnabled
                      ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                      : 'bg-[#222635] text-neutral-400 border border-[#303649]'
                  }`}
                >
                  {fxSettings.filterEnabled ? 'FILTER ACTIVE' : 'BYPASSED'}
                </button>
              </div>

              {/* Filter Type */}
              <div className="grid grid-cols-3 gap-2">
                {(['lowpass', 'highpass', 'bandpass'] as BiquadFilterType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onUpdateFX({ filterType: type })}
                    className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition ${
                      fxSettings.filterType === type
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#181b26] border-[#292f40] text-neutral-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Cutoff frequency */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Cutoff Frequency</span>
                  <span className="text-cyan-400 font-bold">{Math.round(fxSettings.filterCutoff)} Hz</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="20000"
                  step="10"
                  value={fxSettings.filterCutoff}
                  onChange={(e) => onUpdateFX({ filterCutoff: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Resonance Q */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Resonance (Q Peak)</span>
                  <span className="text-white font-bold">{fxSettings.filterResonance.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="15.0"
                  step="0.1"
                  value={fxSettings.filterResonance}
                  onChange={(e) => onUpdateFX({ filterResonance: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: DELAY */}
          {activeTab === 'delay' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Digital Stereo Delay</h3>
                  <p className="text-xs text-neutral-400">Feedback echo delay with millisecond precision</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateFX({ delayEnabled: !fxSettings.delayEnabled })}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                    fxSettings.delayEnabled
                      ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                      : 'bg-[#222635] text-neutral-400 border border-[#303649]'
                  }`}
                >
                  {fxSettings.delayEnabled ? 'DELAY ACTIVE' : 'BYPASSED'}
                </button>
              </div>

              {/* Delay Time */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Delay Time</span>
                  <span className="text-emerald-400 font-bold">
                    {Math.round(fxSettings.delayTime * 1000)} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="1.2"
                  step="0.01"
                  value={fxSettings.delayTime}
                  onChange={(e) => onUpdateFX({ delayTime: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Feedback */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Feedback Repeats</span>
                  <span className="text-white font-bold">{Math.round(fxSettings.delayFeedback * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.88"
                  step="0.02"
                  value={fxSettings.delayFeedback}
                  onChange={(e) => onUpdateFX({ delayFeedback: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              {/* Wet/Dry Mix */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Wet / Dry Mix</span>
                  <span className="text-white font-bold">{Math.round(fxSettings.delayMix * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.02"
                  value={fxSettings.delayMix}
                  onChange={(e) => onUpdateFX({ delayMix: parseFloat(e.target.value) })}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 3: REVERB */}
          {activeTab === 'reverb' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Algorithmic Space Reverb</h3>
                  <p className="text-xs text-neutral-400">Convolution impulse space model for natural depth</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateFX({ reverbEnabled: !fxSettings.reverbEnabled })}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                    fxSettings.reverbEnabled
                      ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/20'
                      : 'bg-[#222635] text-neutral-400 border border-[#303649]'
                  }`}
                >
                  {fxSettings.reverbEnabled ? 'REVERB ACTIVE' : 'BYPASSED'}
                </button>
              </div>

              {/* Decay Time */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Room Decay Time</span>
                  <span className="text-violet-300 font-bold">{fxSettings.reverbDecay.toFixed(1)} s</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8.0"
                  step="0.2"
                  value={fxSettings.reverbDecay}
                  onChange={(e) => onUpdateFX({ reverbDecay: parseFloat(e.target.value) })}
                  className="w-full accent-violet-400 cursor-pointer"
                />
              </div>

              {/* Wet/Dry Mix */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Reverb Wet Mix</span>
                  <span className="text-white font-bold">{Math.round(fxSettings.reverbMix * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.02"
                  value={fxSettings.reverbMix}
                  onChange={(e) => onUpdateFX({ reverbMix: parseFloat(e.target.value) })}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: SATURATION & LO-FI */}
          {activeTab === 'saturation' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Tape Saturation & Waveshaper</h3>
                  <p className="text-xs text-neutral-400">Analog warmth, harmonics, and overdrive clipping</p>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateFX({ distortionEnabled: !fxSettings.distortionEnabled })}
                  className={`px-4 py-1.5 rounded-lg font-bold text-xs transition ${
                    fxSettings.distortionEnabled
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-[#222635] text-neutral-400 border border-[#303649]'
                  }`}
                >
                  {fxSettings.distortionEnabled ? 'SATURATION ON' : 'BYPASSED'}
                </button>
              </div>

              {/* Drive */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Overdrive Gain</span>
                  <span className="text-amber-400 font-bold">+{Math.round(fxSettings.distortionDrive)} dB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="1"
                  value={fxSettings.distortionDrive}
                  onChange={(e) => onUpdateFX({ distortionDrive: parseFloat(e.target.value) })}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>

              {/* Mix */}
              <div>
                <div className="flex justify-between text-xs font-mono mb-2">
                  <span className="text-neutral-400">Drive Wet Mix</span>
                  <span className="text-white font-bold">{Math.round(fxSettings.distortionMix * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.0"
                  step="0.02"
                  value={fxSettings.distortionMix}
                  onChange={(e) => onUpdateFX({ distortionMix: parseFloat(e.target.value) })}
                  className="w-full accent-white cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Instant Beat Stutter Glitch Bar */}
          <div className="p-4 rounded-xl bg-[#171a26] border border-[#262c3e]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Live Performance Stutter Glitch
              </span>
              <span className="text-[11px] text-neutral-400">Hold to create live roll repeats</span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['1/4', '1/8', '1/16', '1/32'] as FXSettings['stutterRate'][]).map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => handleStutter(rate)}
                  className="py-2.5 rounded-lg bg-[#222737] hover:bg-cyan-500 hover:text-black font-extrabold text-xs text-white border border-[#343b52] transition active:scale-95"
                >
                  STUTTER {rate}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
