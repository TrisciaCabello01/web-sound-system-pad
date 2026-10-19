export interface MidiDevice {
  id: string;
  name: string;
  manufacturer: string;
  state: string;
}

export type MidiLearnTarget =
  | { type: 'pad'; padId: string }
  | { type: 'stop-all' }
  | { type: 'master-volume' }
  | { type: 'filter-cutoff' }
  | { type: 'gain-stage' };

export interface MidiBinding {
  target: MidiLearnTarget;
  msgType: 'note' | 'cc';
  channel?: number;
  number: number; // Note number or CC number
}

class MidiManager {
  private midiAccess: any = null;
  private isSupported: boolean = false;
  private connectedDevices: MidiDevice[] = [];
  private bindings: MidiBinding[] = [];

  // MIDI Learn state
  private learningTarget: MidiLearnTarget | null = null;
  private onLearnSuccess?: (binding: MidiBinding) => void;
  private onMidiActivity?: (info: { type: string; number: number; value: number }) => void;

  // Callbacks
  private onTriggerPad?: (padId: string, velocity: number) => void;
  private onReleasePad?: (padId: string) => void;
  private onStopAll?: () => void;
  private onMasterVolumeChange?: (val: number) => void;
  private onFilterCutoffChange?: (val: number) => void;
  private onGainStageTrigger?: () => void;
  private onDevicesChange?: (devices: MidiDevice[]) => void;

  constructor() {
    this.loadBindings();
  }

  public async init(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !navigator.requestMIDIAccess) {
      this.isSupported = false;
      return false;
    }

    try {
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: false });
      this.isSupported = true;
      this.updateDeviceList();

      this.midiAccess.onstatechange = () => {
        this.updateDeviceList();
      };

      this.attachListeners();
      return true;
    } catch (err) {
      console.warn('Web MIDI Access request rejected or not available:', err);
      this.isSupported = false;
      return false;
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getDevices(): MidiDevice[] {
    return this.connectedDevices;
  }

  public setCallbacks(cbs: {
    onTriggerPad?: (padId: string, velocity: number) => void;
    onReleasePad?: (padId: string) => void;
    onStopAll?: () => void;
    onMasterVolumeChange?: (val: number) => void;
    onFilterCutoffChange?: (val: number) => void;
    onGainStageTrigger?: () => void;
    onDevicesChange?: (devices: MidiDevice[]) => void;
    onMidiActivity?: (info: { type: string; number: number; value: number }) => void;
  }) {
    this.onTriggerPad = cbs.onTriggerPad;
    this.onReleasePad = cbs.onReleasePad;
    this.onStopAll = cbs.onStopAll;
    this.onMasterVolumeChange = cbs.onMasterVolumeChange;
    this.onFilterCutoffChange = cbs.onFilterCutoffChange;
    this.onGainStageTrigger = cbs.onGainStageTrigger;
    this.onDevicesChange = cbs.onDevicesChange;
    this.onMidiActivity = cbs.onMidiActivity;
  }

  private updateDeviceList() {
    if (!this.midiAccess) return;
    const devices: MidiDevice[] = [];
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      devices.push({
        id: input.id,
        name: input.name || 'External MIDI Device',
        manufacturer: input.manufacturer || 'Standard',
        state: input.state,
      });
    }
    this.connectedDevices = devices;
    if (this.onDevicesChange) {
      this.onDevicesChange(devices);
    }
    this.attachListeners();
  }

  private attachListeners() {
    if (!this.midiAccess) return;
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      input.onmidimessage = this.handleMidiMessage.bind(this);
    }
  }

  private handleMidiMessage(event: any) {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const command = status >> 4;
    const channel = status & 0xf;
    const noteOrCC = data[1];
    const velocityOrVal = data.length > 2 ? data[2] : 0;

    // Report live MIDI monitor
    if (this.onMidiActivity) {
      const typeStr = command === 9 && velocityOrVal > 0 ? 'Note On' : command === 8 || (command === 9 && velocityOrVal === 0) ? 'Note Off' : command === 11 ? 'CC' : `0x${command.toString(16)}`;
      this.onMidiActivity({
        type: typeStr,
        number: noteOrCC,
        value: velocityOrVal,
      });
    }

    // Handle MIDI Learn
    if (this.learningTarget) {
      if (command === 9 && velocityOrVal > 0) {
        // Learned as Note
        const newBinding: MidiBinding = {
          target: this.learningTarget,
          msgType: 'note',
          channel,
          number: noteOrCC,
        };
        this.addOrUpdateBinding(newBinding);
        if (this.onLearnSuccess) this.onLearnSuccess(newBinding);
        this.learningTarget = null;
        return;
      } else if (command === 11) {
        // Learned as CC
        const newBinding: MidiBinding = {
          target: this.learningTarget,
          msgType: 'cc',
          channel,
          number: noteOrCC,
        };
        this.addOrUpdateBinding(newBinding);
        if (this.onLearnSuccess) this.onLearnSuccess(newBinding);
        this.learningTarget = null;
        return;
      }
    }

    // Note On
    if (command === 9 && velocityOrVal > 0) {
      const normVelocity = Math.max(0.1, velocityOrVal / 127);
      const binding = this.bindings.find((b) => b.msgType === 'note' && b.number === noteOrCC);
      if (binding) {
        this.executeTarget(binding.target, normVelocity);
      } else {
        // Default chromatic mapping for standard 16 pads: notes 36 (C1) to 51 (D#2)
        const padIndex = noteOrCC - 36;
        if (padIndex >= 0 && padIndex < 16 && this.onTriggerPad) {
          this.onTriggerPad(`pad-${padIndex}`, normVelocity);
        }
      }
    }
    // Note Off
    else if (command === 8 || (command === 9 && velocityOrVal === 0)) {
      const binding = this.bindings.find((b) => b.msgType === 'note' && b.number === noteOrCC);
      if (binding && binding.target.type === 'pad' && this.onReleasePad) {
        this.onReleasePad(binding.target.padId);
      } else {
        const padIndex = noteOrCC - 36;
        if (padIndex >= 0 && padIndex < 16 && this.onReleasePad) {
          this.onReleasePad(`pad-${padIndex}`);
        }
      }
    }
    // Control Change (CC)
    else if (command === 11) {
      const normVal = velocityOrVal / 127;
      const binding = this.bindings.find((b) => b.msgType === 'cc' && b.number === noteOrCC);
      if (binding) {
        if (binding.target.type === 'master-volume' && this.onMasterVolumeChange) {
          this.onMasterVolumeChange(normVal * 1.5);
        } else if (binding.target.type === 'filter-cutoff' && this.onFilterCutoffChange) {
          // Exponential frequency map 30Hz - 20000Hz
          const freq = Math.round(30 * Math.pow(20000 / 30, normVal));
          this.onFilterCutoffChange(freq);
        } else if (binding.target.type === 'stop-all' && normVal > 0.5 && this.onStopAll) {
          this.onStopAll();
        }
      }
    }
  }

  private executeTarget(target: MidiLearnTarget, velocity: number = 1.0) {
    switch (target.type) {
      case 'pad':
        if (this.onTriggerPad) this.onTriggerPad(target.padId, velocity);
        break;
      case 'stop-all':
        if (this.onStopAll) this.onStopAll();
        break;
      case 'gain-stage':
        if (this.onGainStageTrigger) this.onGainStageTrigger();
        break;
      default:
        break;
    }
  }

  public startLearn(target: MidiLearnTarget, onSuccess: (b: MidiBinding) => void) {
    this.learningTarget = target;
    this.onLearnSuccess = onSuccess;
  }

  public cancelLearn() {
    this.learningTarget = null;
    this.onLearnSuccess = undefined;
  }

  public isLearning(): boolean {
    return this.learningTarget !== null;
  }

  public getLearningTarget(): MidiLearnTarget | null {
    return this.learningTarget;
  }

  private addOrUpdateBinding(newBinding: MidiBinding) {
    this.bindings = this.bindings.filter((b) => {
      // Remove same note/cc or same target
      const sameMsg = b.msgType === newBinding.msgType && b.number === newBinding.number;
      const sameTarget = JSON.stringify(b.target) === JSON.stringify(newBinding.target);
      return !sameMsg && !sameTarget;
    });
    this.bindings.push(newBinding);
    this.saveBindings();
  }

  public removeBinding(target: MidiLearnTarget) {
    this.bindings = this.bindings.filter(
      (b) => JSON.stringify(b.target) !== JSON.stringify(target)
    );
    this.saveBindings();
  }

  public resetAllBindings() {
    this.bindings = [];
    this.saveBindings();
  }

  public getBindings(): MidiBinding[] {
    return [...this.bindings];
  }

  private saveBindings() {
    try {
      localStorage.setItem('pulsepad_midi_bindings', JSON.stringify(this.bindings));
    } catch {
      // ignore
    }
  }

  private loadBindings() {
    try {
      const data = localStorage.getItem('pulsepad_midi_bindings');
      if (data) {
        this.bindings = JSON.parse(data);
      }
    } catch {
      this.bindings = [];
    }
  }
}

export const midiManager = new MidiManager();
