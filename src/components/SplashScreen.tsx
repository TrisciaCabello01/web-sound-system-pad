import React, { useState, useEffect } from 'react';
import { Sparkles, Radio } from 'lucide-react';

interface SplashScreenProps {
  onLoaded?: () => void;
  minDurationMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onLoaded,
  minDurationMs = 2000,
}) => {
  const [isFading, setIsFading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    // Unmount after 2-second timeout or when audio engine finishes spin-up
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, minDurationMs - 300);

    const unmountTimer = setTimeout(() => {
      setIsMounted(false);
      if (onLoaded) onLoaded();
    }, minDurationMs);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [minDurationMs, onLoaded]);

  if (!isMounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] select-none transition-opacity duration-300 ease-out ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ willChange: 'opacity' }}
    >
      {/* Center Console Brand Asset with Light Scale / Fade Animation */}
      <div className="flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-700">
        {/* Glow & Logo */}
        <div className="relative">
          <div className="absolute -inset-4 bg-cyan-500/20 rounded-full blur-xl animate-pulse" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 p-[2px] shadow-2xl shadow-cyan-500/30">
            <div className="w-full h-full bg-[#0d0e14] rounded-2xl flex items-center justify-center">
              <span className="text-3xl sm:text-4xl font-black bg-gradient-to-br from-cyan-300 via-white to-blue-400 bg-clip-text text-transparent">
                P
              </span>
            </div>
          </div>
        </div>

        {/* Console Typography */}
        <div className="text-center space-y-1">
          <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white uppercase flex items-center justify-center gap-2">
            PulsePad <span className="text-cyan-400 font-mono text-sm px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">PRO</span>
          </h1>
          <p className="text-[11px] sm:text-xs font-mono text-neutral-400 tracking-widest uppercase">
            Live Performance Sound System
          </p>
        </div>

        {/* Minimal Progress Line & Audio Engine Spinup Indicator */}
        <div className="pt-3 flex flex-col items-center gap-2">
          <div className="w-36 h-1 bg-[#1a1c26] rounded-full overflow-hidden border border-[#2a2f42]/40">
            <div className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-400 rounded-full animate-[progress_1.8s_ease-in-out_forwards]" />
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
            <Radio className="w-3 h-3 animate-spin" />
            <span>INITIALIZING LOW-LATENCY AUDIO ENGINE &lt;5MS...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
