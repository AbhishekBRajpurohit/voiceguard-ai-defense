// src/pages/SignIn.jsx
import React from 'react';
import { Lock } from 'lucide-react';

export default function SignIn({ closeModal }) {
  return (
    <div className="flex flex-col gap-3.5 max-w-sm mx-auto">
      <p className="text-xs text-zinc-400">Sign in to access real-time call surveillance logs, acoustic spectrogram analytics, and unified callback routing controls.</p>

      <form onSubmit={(e) => { e.preventDefault(); alert("Authentication Successful. Accessing Console..."); closeModal(); }} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Administrator ID / Email</label>
          <input type="email" defaultValue="admin@voiceguard.io" required className="bg-[#111216] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white" />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-zinc-400 uppercase">Passcode / Security Key</label>
          <input type="password" defaultValue="••••••••••••" required className="bg-[#111216] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white" />
        </div>

        <button type="submit" className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all mt-1 cursor-pointer">
          <Lock size={14} /> Authenticate Console
        </button>
      </form>
    </div>
  );
}
