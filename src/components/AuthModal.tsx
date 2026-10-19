import React, { useState } from 'react';
import { UserProfile } from '../types';
import { saveUserProfile } from '../services/storage';
import { User, Lock, Mail, Check, LogOut, ShieldCheck, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  if (!isOpen) return null;

  const [username, setUsername] = useState(user.username);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState('trishamillegomez@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      username,
      displayName,
      isLoggedIn: true,
      lastSyncTimestamp: Date.now(),
    };
    saveUserProfile(updated);
    onUpdateUser(updated);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 1200);
  };

  const handleFastProfile = (name: string, userTag: string) => {
    setUsername(userTag);
    setDisplayName(name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#12141c] border border-[#2b3040] rounded-2xl shadow-2xl text-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#202432] bg-[#161822]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-tight">
                Musician Cloud Account
              </h2>
              <p className="text-xs text-neutral-400">Sync preset kits & custom samples across devices</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#252a3a] text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Artist / Stage Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-xl pl-9 pr-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Username Handle (@)
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1b1f2b] border border-[#2d3345] rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Quick presets switch */}
          <div>
            <span className="block text-[11px] text-neutral-400 mb-1.5 font-semibold">
              QUICK STAGE PROFILES:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleFastProfile('DJ Sound Pulse', 'soundmaster')}
                className="px-2.5 py-1 rounded-lg bg-[#1e2333] hover:bg-[#2a3147] text-xs text-neutral-300 border border-[#2c344a]"
              >
                DJ Sound Pulse
              </button>
              <button
                type="button"
                onClick={() => handleFastProfile('Lo-Fi Beatmaker', 'lofi_vibes')}
                className="px-2.5 py-1 rounded-lg bg-[#1e2333] hover:bg-[#2a3147] text-xs text-neutral-300 border border-[#2c344a]"
              >
                Lo-Fi Beatmaker
              </button>
              <button
                type="button"
                onClick={() => handleFastProfile('TikTok Hype MC', 'viral_hype')}
                className="px-2.5 py-1 rounded-lg bg-[#1e2333] hover:bg-[#2a3147] text-xs text-neutral-300 border border-[#2c344a]"
              >
                Viral Hype MC
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            {isSaved ? 'Account Synced!' : 'Save & Sync Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
