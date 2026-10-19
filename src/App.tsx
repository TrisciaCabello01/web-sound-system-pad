/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PresetKit, SoundPadData, FXSettings, RecordingTake, UserProfile, PadGroup } from './types';
import {
  EFFECTS_DROPS_KIT,
  TIKTOK_VIRAL_KIT,
  TIKTOK_TRENDING_SONGS_KIT,
  COMEDIC_SOUNDS_KIT,
  WORSHIP_PRAISE_KIT,
  BACKGROUND_MUSIC_KIT,
  LOFI_PULSE_KIT,
  COMMUNITY_KITS,
} from './data/presetKits';
import { audioEngine } from './audio/AudioEngine';
import { midiManager } from './audio/MidiManager';
import { multitrackRecorder } from './audio/MultitrackRecorder';
import {
  loadSavedKit,
  saveCurrentKit,
  loadUserProfile,
  saveUserProfile,
  loadCustomKits,
  saveCustomKitToLibrary,
} from './services/storage';

import { Header } from './components/Header';
import { PadMatrix } from './components/PadMatrix';
import { PadEditorModal } from './components/PadEditorModal';
import { AddGroupModal } from './components/AddGroupModal';
import { AddPadModal } from './components/AddPadModal';
import { EffectsRack } from './components/EffectsRack';
import { GroupEffectsModal } from './components/GroupEffectsModal';
import { MultitrackStudio } from './components/MultitrackStudio';
import { MidiSettingsModal } from './components/MidiSettingsModal';
import { CommunityHubModal } from './components/CommunityHubModal';
import { AuthModal } from './components/AuthModal';
import { SplashScreen } from './components/SplashScreen';

export default function App() {
  // Preset kits list
  const [allKits, setAllKits] = useState<PresetKit[]>([
    EFFECTS_DROPS_KIT,
    TIKTOK_VIRAL_KIT,
    TIKTOK_TRENDING_SONGS_KIT,
    COMEDIC_SOUNDS_KIT,
    WORSHIP_PRAISE_KIT,
    BACKGROUND_MUSIC_KIT,
    LOFI_PULSE_KIT,
    ...loadCustomKits(),
  ]);

  // Current active kit
  const [currentKit, setCurrentKit] = useState<PresetKit>(() => {
    const saved = loadSavedKit();
    return saved || EFFECTS_DROPS_KIT;
  });

  // Performance parameters
  const [bpm, setBpm] = useState<number>(currentKit.bpm || 128);
  const [masterVolume, setMasterVolume] = useState<number>(0.9);
  const [activePadIds, setActivePadIds] = useState<string[]>([]);
  const [fxSettings, setFxSettings] = useState<FXSettings>(audioEngine.getFXSettings());
  const [isGainStaging, setIsGainStaging] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [midiDeviceCount, setMidiDeviceCount] = useState<number>(0);

  // User profile
  const [user, setUser] = useState<UserProfile>(loadUserProfile());

  // Modals state
  const [editingPad, setEditingPad] = useState<SoundPadData | null>(null);
  const [isFXOpen, setIsFXOpen] = useState(false);
  const [isGroupFXOpen, setIsGroupFXOpen] = useState(false);
  const [selectedGroupForFX, setSelectedGroupForFX] = useState<PadGroup>('drops');
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isMidiOpen, setIsMidiOpen] = useState(false);
  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddPadOpen, setIsAddPadOpen] = useState(false);
  const [targetGroupForNewPad, setTargetGroupForNewPad] = useState<PadGroup>('drops');

  // Initialize Audio & MIDI
  useEffect(() => {
    audioEngine.setVoiceStateListener((ids) => {
      setActivePadIds(ids);
    });

    multitrackRecorder.setCallbacks({
      onStateChange: (state) => {
        setIsRecording(state.isRecording);
      },
    });

    // Initialize Web MIDI and bind hardware controls
    async function setupMidi() {
      await midiManager.init();
      setMidiDeviceCount(midiManager.getDevices().length);

      midiManager.setCallbacks({
        onTriggerPad: (padId, velocity) => {
          const targetPad = currentKit.pads.find((p) => p.id === padId);
          if (targetPad) {
            audioEngine.triggerPad(targetPad, velocity, currentKit.pads);
          }
        },
        onReleasePad: (padId) => {
          const targetPad = currentKit.pads.find((p) => p.id === padId);
          if (targetPad && targetPad.triggerMode === 'gate') {
            audioEngine.stopPad(padId);
          }
        },
        onStopAll: () => {
          audioEngine.stopAll();
        },
        onMasterVolumeChange: (val) => {
          setMasterVolume(val);
          audioEngine.setMasterVolume(val);
        },
        onFilterCutoffChange: (freq) => {
          audioEngine.updateFX({ filterCutoff: freq, filterEnabled: true });
          setFxSettings(audioEngine.getFXSettings());
        },
        onGainStageTrigger: () => {
          handleAutoGainStage();
        },
        onDevicesChange: (devices) => {
          setMidiDeviceCount(devices.length);
        },
      });
    }

    setupMidi();
  }, [currentKit]);

  // Persist current kit on edit
  const handleUpdatePads = useCallback((newPads: SoundPadData[]) => {
    setCurrentKit((prev) => {
      const updated = { ...prev, pads: newPads };
      saveCurrentKit(updated);
      return updated;
    });
  }, []);

  // Kit Selector
  const handleSelectKit = (kitId: string) => {
    audioEngine.stopAll();
    const found = allKits.find((k) => k.id === kitId) || COMMUNITY_KITS.find((k) => k.id === kitId);
    if (found) {
      setCurrentKit(found);
      setBpm(found.bpm);
      saveCurrentKit(found);
    }
  };

  // STOP ALL
  const handleStopAll = () => {
    audioEngine.stopAll();
  };

  // Master Volume update
  const handleVolumeChange = (newVol: number) => {
    setMasterVolume(newVol);
    audioEngine.setMasterVolume(newVol);
  };

  // BPM update
  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    setCurrentKit((prev) => ({ ...prev, bpm: newBpm }));
  };

  // Automated Gain Staging functionality
  const handleAutoGainStage = async () => {
    setIsGainStaging(true);
    try {
      const stagedPads = await audioEngine.autoGainStage(currentKit.pads);
      handleUpdatePads(stagedPads);
    } catch (err) {
      console.warn('Gain staging error:', err);
    } finally {
      setTimeout(() => {
        setIsGainStaging(false);
      }, 700);
    }
  };

  // Update real-time FX
  const handleUpdateFX = (settings: Partial<FXSettings>) => {
    audioEngine.updateFX(settings);
    setFxSettings(audioEngine.getFXSettings());
  };

  // Save customized pad from PadEditorModal
  const handleSavePad = (updatedPad: SoundPadData) => {
    const updatedList = currentKit.pads.map((p) => (p.id === updatedPad.id ? updatedPad : p));
    handleUpdatePads(updatedList);
  };

  // Add a new styled Group container to the active kit & persist
  const handleAddGroup = (name: string, color?: string, description?: string) => {
    const cleanId = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const groupId = cleanId || `grp-${Date.now().toString(36)}`;
    const newGroup = { id: groupId, name, color, description };
    setCurrentKit((prev) => {
      const updated = {
        ...prev,
        customGroups: [...(prev.customGroups || []), newGroup],
      };
      saveCurrentKit(updated);
      return updated;
    });
  };

  // Add a new Sound Pad to active group & persist
  const handleAddPad = (newPad: SoundPadData) => {
    setCurrentKit((prev) => {
      const updated = {
        ...prev,
        pads: [...prev.pads, newPad],
      };
      saveCurrentKit(updated);
      return updated;
    });
  };

  // Delete a custom group & persist
  const handleDeleteGroup = (groupId: string) => {
    setCurrentKit((prev) => {
      const updated = {
        ...prev,
        customGroups: (prev.customGroups || []).filter((g) => g.id !== groupId),
      };
      saveCurrentKit(updated);
      return updated;
    });
  };

  // Delete a pad & persist
  const handleDeletePad = (padId: string) => {
    audioEngine.stopPad(padId);
    setCurrentKit((prev) => {
      const updated = {
        ...prev,
        pads: prev.pads.filter((p) => p.id !== padId),
      };
      saveCurrentKit(updated);
      return updated;
    });
  };

  // Handle Drag and Drop Sample onto a Pad
  const handleDropSampleOnPad = async (padId: string, file: File) => {
    try {
      const url = URL.createObjectURL(file);
      const targetPad = currentKit.pads.find((p) => p.id === padId);
      if (targetPad) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').toUpperCase();
        const updatedPad: SoundPadData = {
          ...targetPad,
          name: cleanName.slice(0, 18),
          customAudioUrl: url,
          customAudioName: file.name,
          category: 'custom',
        };
        handleSavePad(updatedPad);
      }
    } catch (err) {
      console.error('Error handling dropped sample:', err);
    }
  };

  // Assign recorded studio take to pad
  const handleAssignTakeToPad = (take: RecordingTake, targetPadId: string) => {
    const targetPad = currentKit.pads.find((p) => p.id === targetPadId);
    if (targetPad) {
      const updatedPad: SoundPadData = {
        ...targetPad,
        name: take.name.slice(0, 18).toUpperCase(),
        customAudioUrl: take.blobUrl,
        customAudioName: `${take.name}.webm`,
        category: 'custom',
        triggerMode: 'one-shot',
      };
      handleSavePad(updatedPad);
    }
  };

  // Load imported or community kit
  const handleLoadKit = (kit: PresetKit) => {
    audioEngine.stopAll();
    setCurrentKit(kit);
    setBpm(kit.bpm);
    saveCurrentKit(kit);
    const updatedCustoms = saveCustomKitToLibrary(kit);
    setAllKits([
      EFFECTS_DROPS_KIT,
      TIKTOK_VIRAL_KIT,
      BACKGROUND_MUSIC_KIT,
      LOFI_PULSE_KIT,
      ...updatedCustoms,
    ]);
  };

  // Count active FX
  const fxActiveCount = [
    fxSettings.filterEnabled,
    fxSettings.delayEnabled,
    fxSettings.reverbEnabled,
    fxSettings.distortionEnabled,
  ].filter(Boolean).length;

  // Groups list for modal selection
  const allAvailableGroups = [
    { id: 'drops', name: 'Drops' },
    { id: 'fx', name: 'FX' },
    { id: 'loops', name: 'Loops' },
    { id: 'drums', name: 'Drums' },
    { id: 'bass', name: 'Bass' },
    { id: 'melodic', name: 'Melodic' },
    { id: 'tiktok-songs', name: 'TikTok Songs' },
    { id: 'trending-songs', name: 'Trending' },
    { id: 'comedic', name: 'Comedic' },
    { id: 'worship', name: 'Worship' },
    ...(currentKit.customGroups || []).map((cg) => ({ id: cg.id, name: cg.name })),
  ];

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e0e2ec] flex flex-col justify-between selection:bg-cyan-500 selection:text-black">
      {/* App Initialization Splash Screen Overlay */}
      <SplashScreen />

      {/* Master Top Control Console with Consolidated Settings in Top-Right */}
      <Header
        currentKit={currentKit}
        onSelectKit={handleSelectKit}
        allKits={allKits}
        bpm={bpm}
        onBpmChange={handleBpmChange}
        masterVolume={masterVolume}
        onVolumeChange={handleVolumeChange}
        onStopAll={handleStopAll}
        onAutoGainStage={handleAutoGainStage}
        isGainStaging={isGainStaging}
        onOpenFX={() => setIsFXOpen(true)}
        onOpenGroupFX={() => {
          setSelectedGroupForFX('drops');
          setIsGroupFXOpen(true);
        }}
        onOpenRecorder={() => setIsRecorderOpen(true)}
        onOpenMidi={() => setIsMidiOpen(true)}
        onOpenCommunity={() => setIsCommunityOpen(true)}
        onAddGroup={() => setIsAddGroupOpen(true)}
        isRecording={isRecording}
        fxActiveCount={fxActiveCount}
        midiDeviceCount={midiDeviceCount}
        activeVoiceCount={activePadIds.length}
      />

      {/* Main Sound Pad Performance Deck & Group Containers */}
      <main className="flex-1 flex flex-col justify-center">
        <PadMatrix
          kit={currentKit}
          onUpdatePads={handleUpdatePads}
          onEditPad={(pad) => setEditingPad(pad)}
          activePadIds={activePadIds}
          bpm={bpm}
          onDropSampleOnPad={handleDropSampleOnPad}
          onOpenGroupFX={(grp) => {
            if (grp) setSelectedGroupForFX(grp);
            setIsGroupFXOpen(true);
          }}
          onOpenAddGroup={() => setIsAddGroupOpen(true)}
          onOpenAddPad={(grp) => {
            setTargetGroupForNewPad(grp || 'drops');
            setIsAddPadOpen(true);
          }}
          onDeleteGroup={handleDeleteGroup}
          onDeletePad={handleDeletePad}
        />
      </main>

      {/* Hardware Status Strip */}
      <footer className="border-t border-[#1a1d28] bg-[#0c0d13] py-2 px-4 text-center text-xs text-neutral-400 select-none">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1">
          <span className="font-mono text-[11px]">
            PULSEPAD PRO • AUDIO ENGINE: <strong className="text-white">ONLINE</strong> • LATENCY: <strong className="text-emerald-400">&lt; 5ms</strong>
          </span>
          <div className="flex items-center gap-3 text-[11px]">
            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-neutral-300 hover:text-white font-bold underline cursor-pointer"
            >
              Logged in as @{user.username}
            </button>
            <span>•</span>
            <button
              onClick={() => setIsCommunityOpen(true)}
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Patch Library
            </button>
          </div>
        </div>
      </footer>

      {/* Add New Group Modal */}
      <AddGroupModal
        isOpen={isAddGroupOpen}
        onClose={() => setIsAddGroupOpen(false)}
        onAddGroup={handleAddGroup}
      />

      {/* Add Sound Pad Modal */}
      <AddPadModal
        isOpen={isAddPadOpen}
        onClose={() => setIsAddPadOpen(false)}
        targetGroup={targetGroupForNewPad}
        allGroups={allAvailableGroups}
        existingPads={currentKit.pads}
        onAddPad={handleAddPad}
      />

      {/* In-depth Pad Editor Modal */}
      <PadEditorModal
        pad={editingPad}
        isOpen={!!editingPad}
        onClose={() => setEditingPad(null)}
        onSave={handleSavePad}
        allPads={currentKit.pads}
      />

      {/* VST Master Effects Rack Modal */}
      <EffectsRack
        fxSettings={fxSettings}
        onUpdateFX={handleUpdateFX}
        isOpen={isFXOpen}
        onClose={() => setIsFXOpen(false)}
      />

      {/* Dedicated Group Effects & Add Effects Modal */}
      <GroupEffectsModal
        isOpen={isGroupFXOpen}
        onClose={() => setIsGroupFXOpen(false)}
        selectedInitialGroup={selectedGroupForFX}
      />

      {/* Multitrack Studio Recorder Modal */}
      <MultitrackStudio
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        onAssignToPad={handleAssignTakeToPad}
        pads={currentKit.pads}
      />

      {/* Hardware MIDI Controller Settings Modal */}
      <MidiSettingsModal
        isOpen={isMidiOpen}
        onClose={() => setIsMidiOpen(false)}
        pads={currentKit.pads}
        onTriggerPad={(padId, velocity) => {
          const p = currentKit.pads.find((item) => item.id === padId);
          if (p) audioEngine.triggerPad(p, velocity, currentKit.pads);
        }}
      />

      {/* Community Hub & Social Sharing Modal */}
      <CommunityHubModal
        isOpen={isCommunityOpen}
        onClose={() => setIsCommunityOpen(false)}
        currentKit={currentKit}
        onLoadKit={handleLoadKit}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          saveUserProfile(updated);
        }}
      />

      {/* Musician User Account & Preset Sync Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        user={user}
        onUpdateUser={(updated) => {
          setUser(updated);
          saveUserProfile(updated);
        }}
      />
    </div>
  );
}
