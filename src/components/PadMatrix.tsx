import React, { useState } from 'react';
import { PresetKit, SoundPadData, PadGroup } from '../types';
import { SoundPad } from './SoundPad';
import { MasterVisualizer } from './MasterVisualizer';
import {
  SlidersHorizontal,
  FolderPlus,
  Plus,
  Filter,
  LayoutGrid,
  Layers,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface PadMatrixProps {
  kit: PresetKit;
  onUpdatePads: (pads: SoundPadData[]) => void;
  onEditPad: (pad: SoundPadData) => void;
  activePadIds: string[];
  bpm: number;
  onDropSampleOnPad: (padId: string, file: File) => void;
  onOpenGroupFX: (group?: PadGroup) => void;
  onOpenAddGroup: () => void;
  onOpenAddPad: (targetGroup?: PadGroup) => void;
  onDeletePad?: (padId: string) => void;
  onDeleteGroup?: (groupId: string) => void;
}

// 1. Unified sorting groups as requested:
// All, Drops, FX, Loops, Drums, Bass, Melodic, TikTok Songs, Trending, Comedic, and Worship
export const UNIFIED_SORTING_GROUPS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Drops', value: 'drops' },
  { label: 'FX', value: 'fx' },
  { label: 'Loops', value: 'loops' },
  { label: 'Drums', value: 'drums' },
  { label: 'Bass', value: 'bass' },
  { label: 'Melodic', value: 'melodic' },
  { label: 'TikTok Songs', value: 'tiktok-songs' },
  { label: 'Trending', value: 'trending-songs' },
  { label: 'Comedic', value: 'comedic' },
  { label: 'Worship', value: 'worship' },
];

export const PadMatrix: React.FC<PadMatrixProps> = ({
  kit,
  onUpdatePads,
  onEditPad,
  activePadIds,
  bpm,
  onDropSampleOnPad,
  onOpenGroupFX,
  onOpenAddGroup,
  onOpenAddPad,
  onDeletePad,
  onDeleteGroup,
}) => {
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'containers' | 'matrix'>('containers');

  // Combine unified sorting groups with any user-created custom groups
  const customGroupItems = (kit.customGroups || []).map((cg) => ({
    label: cg.name,
    value: cg.id,
  }));

  const allFilterChoices = [
    ...UNIFIED_SORTING_GROUPS,
    ...customGroupItems.filter(
      (cg) => !UNIFIED_SORTING_GROUPS.some((ug) => ug.value === cg.value)
    ),
  ];

  // Drag and drop pad swapping
  const handleSwapPads = (sourceId: string, targetId: string) => {
    const sourceIdx = kit.pads.findIndex((p) => p.id === sourceId);
    const targetIdx = kit.pads.findIndex((p) => p.id === targetId);

    if (sourceIdx >= 0 && targetIdx >= 0) {
      const newPads = [...kit.pads];
      const temp = { ...newPads[sourceIdx] };
      newPads[sourceIdx] = {
        ...newPads[targetIdx],
        id: newPads[sourceIdx].id,
        keyShortcut: newPads[sourceIdx].keyShortcut,
        midiNote: newPads[sourceIdx].midiNote,
      };
      newPads[targetIdx] = {
        ...temp,
        id: newPads[targetIdx].id,
        keyShortcut: newPads[targetIdx].keyShortcut,
        midiNote: newPads[targetIdx].midiNote,
      };
      onUpdatePads(newPads);
    }
  };

  // Determine active groups to render
  const distinctGroupsInPads = Array.from(new Set(kit.pads.map((p) => p.group)));
  const customGroupIds = (kit.customGroups || []).map((cg) => cg.id);
  const allKnownGroupKeys = Array.from(new Set([...distinctGroupsInPads, ...customGroupIds]));

  // Filter group list according to selected dropdown filter
  const displayedGroupKeys =
    selectedGroupFilter === 'all'
      ? allKnownGroupKeys
      : allKnownGroupKeys.filter((gk) => gk === selectedGroupFilter);

  // Group label resolver
  const getGroupLabel = (groupKey: string): string => {
    const matchedUnified = UNIFIED_SORTING_GROUPS.find((g) => g.value === groupKey);
    if (matchedUnified) return matchedUnified.label;
    const matchedCustom = kit.customGroups?.find((g) => g.id === groupKey);
    if (matchedCustom) return matchedCustom.name;
    return groupKey.toUpperCase();
  };

  // Group accent color resolver
  const getGroupAccent = (groupKey: string): string => {
    const matchedCustom = kit.customGroups?.find((g) => g.id === groupKey);
    if (matchedCustom?.color) return matchedCustom.color;
    switch (groupKey) {
      case 'drops':
        return '#06b6d4';
      case 'fx':
        return '#3b82f6';
      case 'loops':
        return '#10b981';
      case 'drums':
        return '#f59e0b';
      case 'bass':
        return '#ef4444';
      case 'melodic':
        return '#a855f7';
      case 'tiktok-songs':
      case 'tiktok':
        return '#ec4899';
      case 'trending-songs':
        return '#8b5cf6';
      case 'comedic':
        return '#eab308';
      case 'worship':
        return '#38bdf8';
      default:
        return '#64748b';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-5 py-4 space-y-4">
      {/* Kit Info & Top Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#11131a] border border-[#202534] p-3.5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-bold border border-cyan-500/30">
              {kit.category}
            </span>
            <span className="text-xs text-neutral-400">by @{kit.author}</span>
            <span className="text-[11px] font-mono text-neutral-500">
              • {kit.pads.length} Total Sound Pads
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
            {kit.name}
          </h2>
        </div>

        {/* Real-time Spectrum & Audio Output */}
        <div className="flex items-center gap-3">
          <MasterVisualizer activeVoiceCount={activePadIds.length} />
        </div>
      </div>

      {/* Unified Filter Controls & Group Management Toolbar */}
      <div className="bg-[#10121a] border border-[#1f2434] p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        {/* Unified Sorting Filter Dropdown & Quick Chips */}
        <div className="flex items-center gap-2 flex-wrap flex-1">
          <div className="flex items-center gap-1.5 bg-[#161925] border border-[#2b3348] rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-bold text-neutral-300 hidden sm:inline">Sort:</span>
            <select
              value={selectedGroupFilter}
              onChange={(e) => setSelectedGroupFilter(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-white focus:outline-none cursor-pointer pr-1"
              title="Unified sorting groups filter"
            >
              {allFilterChoices.map((g) => (
                <option key={g.value} value={g.value} className="bg-[#12141e] text-white">
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Buttons (Unified groups: All, Drops, FX, Loops, Drums, Bass, Melodic, TikTok Songs, Trending, Comedic, Worship) */}
          <div className="hidden xl:flex items-center gap-1 overflow-x-auto pb-0.5">
            {UNIFIED_SORTING_GROUPS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setSelectedGroupFilter(g.value)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  selectedGroupFilter === g.value
                    ? 'bg-white text-black shadow-sm'
                    : 'bg-[#151823] text-neutral-400 hover:text-white border border-[#242938]'
                }`}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls: View Switcher, Add Group, Add Sound Pad */}
        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Switcher: Group Containers (Deck) vs Matrix (4x4) */}
          <div className="flex items-center bg-[#151824] border border-[#262c3e] rounded-xl p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('containers')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'containers'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Deck View: View sound pads organized in styled Group Containers"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Group Containers</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === 'matrix'
                  ? 'bg-cyan-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Matrix View: 4x4 compact performance grid"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Matrix View</span>
            </button>
          </div>

          {/* ➕ Add New Group Button */}
          <button
            type="button"
            onClick={onOpenAddGroup}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
            title="Creates a new styled container (div) to hold a new set of sound pads"
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Add Group</span>
          </button>

          {/* ➕ Add Sound Pad Button */}
          <button
            type="button"
            onClick={() => onOpenAddPad(selectedGroupFilter !== 'all' ? selectedGroupFilter : 'drops')}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-emerald-500/20"
            title="Open prompt to name pad, select sound type, and append to active group"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Pad</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: STYLED GROUP CONTAINERS (Deck View) */}
      {viewMode === 'containers' ? (
        <div
          style={{ '--bpm-interval': `${(60 / Math.max(40, bpm)).toFixed(3)}s` } as React.CSSProperties}
          className="space-y-4"
        >
          {displayedGroupKeys.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-[#232838] rounded-2xl bg-[#12141e]">
              <p className="text-sm text-neutral-400 font-bold mb-3">
                No sound groups match the current filter.
              </p>
              <button
                type="button"
                onClick={onOpenAddGroup}
                className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-bold text-xs"
              >
                ➕ Add New Group Container
              </button>
            </div>
          ) : (
            displayedGroupKeys.map((groupKey) => {
              const groupPads = kit.pads.filter((p) => p.group === groupKey);
              const groupName = getGroupLabel(groupKey);
              const accentColor = getGroupAccent(groupKey);
              const isCustomGroup = kit.customGroups?.some((cg) => cg.id === groupKey);

              return (
                <div
                  key={groupKey}
                  className="group-container border-2 border-dashed border-[#282d3e] p-4 rounded-2xl bg-[#12141e] shadow-md transition-all hover:border-[#384056]"
                  style={{
                    borderColor: `${accentColor}40`,
                  }}
                >
                  {/* Group Container Header */}
                  <div className="group-header flex items-center justify-between pb-3 mb-3 border-b border-[#202536]">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="text-sm sm:text-base font-black text-white flex items-center gap-2 tracking-tight uppercase">
                        📂 {groupName}
                      </span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#1c202e] text-neutral-400 border border-[#2b3144]">
                        {groupPads.length} {groupPads.length === 1 ? 'pad' : 'pads'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Group FX Shortcut */}
                      <button
                        type="button"
                        onClick={() => onOpenGroupFX(groupKey as PadGroup)}
                        className="px-2.5 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 text-xs font-bold transition flex items-center gap-1"
                        title={`Configure Group Audio Effects for ${groupName}`}
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>FX</span>
                      </button>

                      {/* Add Pad to this specific group */}
                      <button
                        type="button"
                        onClick={() => onOpenAddPad(groupKey)}
                        className="add-pad-btn bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition active:scale-95"
                        title={`Add new sound pad inside ${groupName}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Pad</span>
                      </button>

                      {/* Delete Custom Group button */}
                      {isCustomGroup && onDeleteGroup && (
                        <button
                          type="button"
                          onClick={() => onDeleteGroup(groupKey)}
                          className="p-1 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete this custom group"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pad Grid Container for this group */}
                  {groupPads.length === 0 ? (
                    <div className="py-6 px-4 text-center border border-dashed border-[#232838] rounded-xl bg-[#0f1118]">
                      <p className="text-xs text-neutral-400 mb-2">
                        This group is empty. Append a new sound pad or AI speech trigger to start playing.
                      </p>
                      <button
                        type="button"
                        onClick={() => onOpenAddPad(groupKey)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition"
                      >
                        ➕ Add Pad to {groupName}
                      </button>
                    </div>
                  ) : (
                    <div className="pad-grid grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-3">
                      {groupPads.map((pad) => {
                        const isPlaying = activePadIds.includes(pad.id);
                        return (
                          <div key={pad.id}>
                            <SoundPad
                              pad={pad}
                              isPlaying={isPlaying}
                              bpm={bpm}
                              onEdit={onEditPad}
                              onDropSample={onDropSampleOnPad}
                              onSwapPads={handleSwapPads}
                              allPads={kit.pads}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* VIEW MODE 2: COMPACT 4x4 / RESPONSIVE PERFORMANCE MATRIX */
        <div
          style={{ '--bpm-interval': `${(60 / Math.max(40, bpm)).toFixed(3)}s` } as React.CSSProperties}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5"
        >
          {kit.pads.map((pad) => {
            const isPlaying = activePadIds.includes(pad.id);
            const isDimmed = selectedGroupFilter !== 'all' && pad.group !== selectedGroupFilter;

            return (
              <div
                key={pad.id}
                className={`transition-opacity duration-150 ${isDimmed ? 'opacity-30' : 'opacity-100'}`}
              >
                <SoundPad
                  pad={pad}
                  isPlaying={isPlaying}
                  bpm={bpm}
                  onEdit={onEditPad}
                  onDropSample={onDropSampleOnPad}
                  onSwapPads={handleSwapPads}
                  allPads={kit.pads}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Keyboard Triggers & Stage Mapping Footer */}
      <div className="p-3 bg-[#10121a] border border-[#1e2330] rounded-xl flex flex-wrap items-center justify-between text-[11px] text-neutral-400 font-mono gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-white font-bold">KEYBOARD TRIGGERS:</span>
          <span>Row 1: [1][2][3][4]</span>
          <span>•</span>
          <span>Row 2: [Q][W][E][R]</span>
          <span>•</span>
          <span>Row 3: [A][S][D][F]</span>
          <span>•</span>
          <span>Row 4: [Z][X][C][V]</span>
        </div>

        <div className="flex items-center gap-3 text-neutral-400">
          <span className="flex items-center gap-1 text-cyan-400">
            <span className="text-emerald-400">●</span>
            LOCAL STORAGE PERSISTENCE ACTIVE
          </span>
          <span>•</span>
          <span>MIDI Notes 36–64 Active</span>
        </div>
      </div>
    </div>
  );
};
