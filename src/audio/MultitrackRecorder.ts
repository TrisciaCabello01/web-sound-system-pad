import { RecordingTake } from '../types';
import { audioEngine } from './AudioEngine';

class MultitrackRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private isRecording: boolean = false;
  private startTime: number = 0;
  private timerInterval: number | null = null;
  private takes: RecordingTake[] = [];

  private onStateChange?: (state: { isRecording: boolean; elapsedMs: number }) => void;
  private onTakeRecorded?: (take: RecordingTake) => void;

  public setCallbacks(cbs: {
    onStateChange?: (state: { isRecording: boolean; elapsedMs: number }) => void;
    onTakeRecorded?: (take: RecordingTake) => void;
  }) {
    this.onStateChange = cbs.onStateChange;
    this.onTakeRecorded = cbs.onTakeRecorded;
  }

  public async startRecording(): Promise<boolean> {
    await audioEngine.ensureContextRunning();
    const stream = audioEngine.getMediaStream();
    if (!stream) {
      console.error('Audio stream not available for recording');
      return false;
    }

    try {
      this.recordedChunks = [];
      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 256000 }
        : undefined;

      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.finishRecording();
      };

      this.mediaRecorder.start(100);
      this.isRecording = true;
      this.startTime = Date.now();

      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = window.setInterval(() => {
        if (this.onStateChange) {
          this.onStateChange({
            isRecording: true,
            elapsedMs: Date.now() - this.startTime,
          });
        }
      }, 50);

      if (this.onStateChange) {
        this.onStateChange({ isRecording: true, elapsedMs: 0 });
      }

      return true;
    } catch (err) {
      console.error('Failed to start MediaRecorder:', err);
      return false;
    }
  }

  public stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) return;
    try {
      this.mediaRecorder.stop();
    } catch (err) {
      console.warn('Error stopping MediaRecorder:', err);
    }
    this.isRecording = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.onStateChange) {
      this.onStateChange({ isRecording: false, elapsedMs: 0 });
    }
  }

  private finishRecording() {
    if (this.recordedChunks.length === 0) return;

    const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
    const blob = new Blob(this.recordedChunks, { type: mimeType });
    const blobUrl = URL.createObjectURL(blob);
    const duration = (Date.now() - this.startTime) / 1000;

    const takeNumber = this.takes.length + 1;
    const take: RecordingTake = {
      id: `take-${Date.now()}`,
      name: `Studio Take #${takeNumber} (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`,
      timestamp: Date.now(),
      duration: Math.max(0.1, duration),
      blobUrl,
      blobSize: blob.size,
      sampleRate: audioEngine.ctx?.sampleRate || 44100,
      format: mimeType.includes('webm') ? 'WebM Audio' : 'WAV Audio',
    };

    this.takes.unshift(take);
    if (this.onTakeRecorded) {
      this.onTakeRecorded(take);
    }
  }

  public getTakes(): RecordingTake[] {
    return [...this.takes];
  }

  public deleteTake(id: string) {
    const take = this.takes.find((t) => t.id === id);
    if (take) {
      URL.revokeObjectURL(take.blobUrl);
    }
    this.takes = this.takes.filter((t) => t.id !== id);
  }

  public renameTake(id: string, newName: string) {
    this.takes = this.takes.map((t) => (t.id === id ? { ...t, name: newName } : t));
  }

  public getIsRecording(): boolean {
    return this.isRecording;
  }
}

export const multitrackRecorder = new MultitrackRecorder();
