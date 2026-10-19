import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../audio/AudioEngine';
import { Activity } from 'lucide-react';

interface MasterVisualizerProps {
  activeVoiceCount: number;
}

export const MasterVisualizer: React.FC<MasterVisualizerProps> = ({ activeVoiceCount }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = audioEngine.getAnalyser();

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      const width = canvas.width;
      const height = canvas.height;

      ctx.fillStyle = '#0f1118';
      ctx.fillRect(0, 0, width, height);

      if (!analyser) {
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const freqData = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(freqData);

      // Render 32 frequency bands with smooth glow
      const barCount = 32;
      const barWidth = (width / barCount) - 2;
      const step = Math.floor(bufferLength / barCount);

      for (let i = 0; i < barCount; i++) {
        const val = freqData[i * step] / 255.0;
        const barHeight = Math.max(3, val * (height - 4));
        const x = i * (barWidth + 2) + 1;
        const y = height - barHeight;

        // Gradient color: Cyan at bottom, transitions to violet, amber at top
        let barColor = '#06b6d4';
        if (val > 0.85) barColor = '#ef4444';
        else if (val > 0.65) barColor = '#f59e0b';
        else if (val > 0.4) barColor = '#3b82f6';

        ctx.fillStyle = barColor;
        ctx.fillRect(x, y, barWidth, barHeight);
      }
    };

    draw();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  return (
    <div className="flex items-center gap-3 bg-[#13151e] border border-[#232736] px-3.5 py-1.5 rounded-xl">
      <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400">
        <Activity className="w-3.5 h-3.5 text-cyan-400" />
        <span className="hidden sm:inline">OUTPUT SPECTRUM</span>
      </div>

      <canvas
        ref={canvasRef}
        width={180}
        height={22}
        className="w-32 sm:w-44 h-5 rounded bg-[#090b10] border border-[#1e2330]"
      />

      <div className="flex items-center gap-1 text-[10px] font-mono">
        <span className="text-neutral-400">VOICES:</span>
        <span className={`font-bold ${activeVoiceCount > 0 ? 'text-cyan-400' : 'text-neutral-300'}`}>
          {activeVoiceCount}
        </span>
      </div>
    </div>
  );
};
