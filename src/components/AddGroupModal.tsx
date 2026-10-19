import React, { useState } from 'react';
import { X, FolderPlus, Palette, Tag } from 'lucide-react';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGroup: (name: string, color: string, description?: string) => void;
}

const COLOR_OPTIONS = [
  { name: 'Cyan Pulse', value: '#06b6d4' },
  { name: 'Purple Neon', value: '#a855f7' },
  { name: 'Emerald Wave', value: '#10b981' },
  { name: 'Amber Glow', value: '#f59e0b' },
  { name: 'Pink Laser', value: '#ec4899' },
  { name: 'Electric Blue', value: '#3b82f6' },
  { name: 'Crimson Fire', value: '#ef4444' },
  { name: 'Silver Steel', value: '#e2e8f0' },
];

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onAddGroup,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0].value);
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = groupName.trim();
    if (!trimmed) return;
    onAddGroup(trimmed, selectedColor, description.trim() || undefined);
    setGroupName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#12141e] border border-[#262c3e] w-full max-w-md rounded-2xl p-5 shadow-2xl relative select-none">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#202536] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white uppercase tracking-tight">
                Add New Sound Group
              </h3>
              <p className="text-[11px] text-neutral-400">
                Creates a new styled container to organize sound pads
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-[#202538] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-cyan-400" />
              Group Name
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Vibe Tracks, SFX Drops, Vocals, Drill Hits..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full bg-[#161925] border border-[#2b3348] rounded-xl px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              Container Accent Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {COLOR_OPTIONS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setSelectedColor(col.value)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left text-xs transition ${
                    selectedColor === col.value
                      ? 'border-white bg-[#222738] text-white shadow-sm'
                      : 'border-[#262c3e] bg-[#161924] text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full shrink-0"
                    style={{ backgroundColor: col.value }}
                  />
                  <span className="truncate text-[10px] font-mono">{col.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Live stage drops and viral hooks"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#161925] border border-[#2b3348] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#202536]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-400 hover:text-white bg-[#191c28] hover:bg-[#232838] transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!groupName.trim()}
              className="px-5 py-2 rounded-xl text-xs font-black text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed transition uppercase tracking-wider shadow-lg shadow-cyan-500/20"
            >
              ➕ Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
