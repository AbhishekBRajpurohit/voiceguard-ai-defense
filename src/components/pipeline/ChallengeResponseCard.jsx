// src/components/pipeline/ChallengeResponseCard.jsx
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ChallengeResponseCard({ visible, phrase = "Repeat phrase: Blue Horizon Seven Zero" }) {
  if (!visible) return null;

  return (
    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5">
      <div className="flex items-center gap-2 text-amber-500 font-semibold text-xs mb-1">
        <AlertTriangle size={16} />
        <span>Secondary Challenge Required (Escalation Triggered)</span>
      </div>
      <p className="text-xs text-zinc-300">The acoustic AI score is ambiguous. Please instruct the caller to speak the dynamic phrase below:</p>
      <div className="mt-2 p-2.5 bg-[#111216] rounded-lg font-mono text-xs text-white text-center border border-white/10">
        "{phrase}"
      </div>
    </div>
  );
}
