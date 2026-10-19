import React, { useState, useEffect, useRef } from 'react';
import { RecordingTake, SoundPadData } from '../types';
import { multitrackRecorder } from '../audio/MultitrackRecorder';
import { audioEngine } from '../audio/AudioEngine';
import { Mic, Square, Play, Pause, Download, Trash2, Edit3, Disc, Check, Clock } from 'lucide-react';

interface MultitrackStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onAssignToPad: (take: RecordingTake, targetPadId: string) => void;
  pads: SoundPadData[];
}

export const MultitrackStudio: React.FC<MultitrackStudioProps> = ({
  isOpen,
  onClose,
  onAssignToPad,
  pads,
}) => {
  if (!isOpen) return null;

  const [isRecording, setIsRecording] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [takes, setTakes] = useState<RecordingTake[]>(multitrackRecorder.getTakes());
  const [playingTakeId, setPlayingTakeId] = useState<string | null>(null);
  const [selectedPadForTake, setSelectedPadForTake] = useState<string>(pads[0]?.id || 'pad-0');
  const [assignedSuccessTakeId, setAssignedSuccessTakeId] = useState<string | null>(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    multitrackRecorder.setCallbacks({
      onStateChange: (state) => {
        setIsRecording(state.isRecording);
        setElapsedMs(state.elapsedMs);
      },
      onTakeRecorded: (take) => {
        setTakes(multitrackRecorder.getTakes());
      },
    });

    return () => {
      multitrackRecorder.setCallbacks({});
    };
  }, []);

  // Live audio waveform visualizer on canvas
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

      ctx.fillStyle = '#0c0e14';
      ctx.fillRect(0, 0, width, height);

      if (!analyser) {
        // Draw idle center line
        ctx.strokeStyle = '#232838';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteTimeDomainData(dataArray);

      // Draw grid lines
      ctx.strokeStyle = '#181b26';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Draw waveform
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = isRecording ? '#ef4444' : '#00f0ff';
      ctx.shadowBlur = isRecording ? 12 : 8;
      ctx.shadowColor = isRecording ? '#ef4444' : '#00f0ff';
      ctx.beginPath();

      const sliceWidth = width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    draw();

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isRecording]);

  const toggleRecording = async () => {
    if (isRecording) {
      multitrackRecorder.stopRecording();
    } else {
      await multitrackRecorder.startRecording();
    }
  };

  const playTake = (take: RecordingTake) => {
    if (playingTakeId === take.id) {
      audioElementRef.current?.pause();
      setPlayingTakeId(null);
      return;
    }

    if (audioElementRef.current) {
      audioElementRef.current.pause();
    }

    const audio = new Audio(take.blobUrl);
    audioElementRef.current = audio;
    audio.play();
    setPlayingTakeId(take.id);

    audio.onended = () => {
      setPlayingTakeId(null);
    };
  };

  const downloadTake = (take: RecordingTake) => {
    const a = document.createElement('a');
    a.href = take.blobUrl;
    a.download = `${take.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteTake = (id: string) => {
    if (playingTakeId === id && audioElementRef.current) {
      audioElementRef.current.pause();
      setPlayingTakeId(null);
    }
    multitrackRecorder.deleteTake(id);
    setTakes(multitrackRecorder.getTakes());
  };

  const handleAssign = (take: RecordingTake) => {
    onAssignToPad(take, selectedPadForTake);
    setAssignedSuccessTakeId(take.id);
    setTimeout(() => setAssignedSuccessTakeId(null), 2500);
  };

  // Format milliseconds to mm:ss.ms
  const formatTimer = (ms: number) => {
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#11131a] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202432] bg-[#151722]">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg border ${isRecording ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                Live Studio Multitrack Recorder
                {isRecording && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500 animate-pulse">
                    RECORDING LIVE
                  </span>
                )}
              </h2>
              <p className="text-xs text-neutral-400">Capture pristine studio sessions, master mixes, and custom samples</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-white text-black font-extrabold hover:bg-neutral-200 text-xs transition"
          >
            Done
          </button>
        </div>

        {/* Live Recording Console */}
        <div className="p-5 border-b border-[#202432] bg-[#141722] space-y-4">
          {/* Oscilloscope Waveform Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-[#262c3d]">
            <canvas
              ref={canvasRef}
              width={600}
              height={100}
              className="w-full h-24 block bg-[#0c0e14]"
            />

            {/* Time code overlay */}
            <div className="absolute top-2 right-3 font-mono text-xs px-2 py-1 rounded bg-black/70 border border-neutral-700 text-neutral-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              <span className={`font-bold ${isRecording ? 'text-red-400' : 'text-neutral-300'}`}>
                {formatTimer(elapsedMs)}
              </span>
            </div>
          </div>

          {/* Record Control Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-neutral-400">
              {isRecording ? (
                <span className="text-red-400 font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Recording stereo session directly from master audio bus...
                </span>
              ) : (
                <span>Ready to capture live set. Tap Record to start capturing.</span>
              )}
            </div>

            <button
              onClick={toggleRecording}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 transition active:scale-95 shadow-lg ${
                isRecording
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30 ring-2 ring-red-400'
                  : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-4 h-4 fill-current" />
                  Stop Recording Take
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Start Recording Set
                </>
              )}
            </button>
          </div>
        </div>

        {/* Captured Takes List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-neutral-400">
              Recorded Studio Takes ({takes.length})
            </h3>
            {takes.length > 0 && (
              <span className="text-[11px] text-neutral-400">Click Play to audition or Assign to a pad</span>
            )}
          </div>

          {takes.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-[#24293a] rounded-xl text-neutral-400">
              <Disc className="w-8 h-8 mx-auto mb-2 text-neutral-400 opacity-60" />
              <p className="text-sm font-semibold">No recorded takes yet</p>
              <p className="text-xs text-neutral-400 mt-1">
                Hit "Start Recording Set" above to record your live pad performance
              </p>
            </div>
          ) : (
            takes.map((take) => (
              <div
                key={take.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#171a26] border border-[#272e42] hover:border-[#38425d] transition"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => playTake(take)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 ${
                      playingTakeId === take.id
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                        : 'bg-[#252b3d] text-white hover:bg-[#323a52]'
                    }`}
                  >
                    {playingTakeId === take.id ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    )}
                  </button>

                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{take.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                      <span>{take.duration.toFixed(1)}s</span>
                      <span>•</span>
                      <span>{Math.round(take.blobSize / 1024)} KB</span>
                      <span>•</span>
                      <span>{take.format}</span>
                    </div>
                  </div>
                </div>

                {/* Take Actions: Assign to Pad, Download, Delete */}
                <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#222839]">
                  {/* Select Pad to Assign */}
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedPadForTake}
                      onChange={(e) => setSelectedPadForTake(e.target.value)}
                      className="bg-[#1e2333] border border-[#2f374d] rounded-lg px-2 py-1 text-xs text-neutral-200 font-mono"
                    >
                      {pads.map((p) => (
                        <option key={p.id} value={p.id}>
                          Pad {p.keyShortcut}: {p.name.slice(0, 10)}
                        </option>
                      ))}
                    </select>

                    <button
                      onClick={() => handleAssign(take)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1"
                      title="Load this recording into selected sound pad"
                    >
                      {assignedSuccessTakeId === take.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Assigned!</span>
                        </>
                      ) : (
                        'Assign to Pad'
                      )}
                    </button>
                  </div>

                  {/* Download */}
                  <button
                    onClick={() => downloadTake(take)}
                    className="p-1.5 rounded-lg bg-[#222737] hover:bg-[#2d3448] text-neutral-300 hover:text-white transition"
                    title="Download audio recording"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteTake(take.id)}
                    className="p-1.5 rounded-lg bg-[#222737] hover:bg-red-500/30 text-neutral-400 hover:text-red-300 transition"
                    title="Delete recording"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
