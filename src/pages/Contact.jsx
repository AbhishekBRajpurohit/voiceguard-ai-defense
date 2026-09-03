// src/pages/Contact.jsx
import React from 'react';
import { Key, Send, ShieldCheck } from 'lucide-react';

export default function Contact() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white/3 border border-white/8 rounded-2xl p-4.5 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
            <ShieldCheck size={18} /> VoiceGuard Architecture Lab
          </h3>
          <p className="text-xs text-zinc-400 mb-4">Enterprise Voice Security &amp; Telecom Integration Team</p>

          <div className="flex flex-col gap-2.5 mb-4">
            <div className="bg-[#181920] border border-white/6 rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white grid place-items-center text-xs">
                <i className="fa-solid fa-user-gear"></i>
              </div>
              <div>
                <strong className="text-xs text-white block">Classification Architecture Group</strong>
                <span className="text-[11px] text-zinc-500">Dual Request Classification &amp; High-Stake Logic</span>
              </div>
            </div>

            <div className="bg-[#181920] border border-white/6 rounded-xl p-2.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 text-white grid place-items-center text-xs">
                <i className="fa-solid fa-code-branch"></i>
              </div>
              <div>
                <strong className="text-xs text-white block">AI Detection &amp; Biometrics Group</strong>
                <span className="text-[11px] text-zinc-500">RawNet2, VocoderID &amp; Zero-Knowledge Proof Verification</span>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-zinc-400 flex flex-col gap-1 border-t border-white/6 pt-3">
          <p><strong>Engineering Lab:</strong> Enterprise Cyber Defense Center</p>
          <p><strong>Inquiries:</strong> enterprise@voiceguard.io</p>
        </div>
      </div>

      <div className="bg-white/3 border border-white/8 rounded-2xl p-4.5">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
          <Key size={16} /> Request Developer API Access
        </h3>
        <p className="text-xs text-zinc-400 mb-4">Integrate VoiceGuard into your WebRTC, Asterisk, or Twilio telecom infrastructure.</p>

        <form onSubmit={(e) => { e.preventDefault(); alert("API Access Request Submitted! Developer API Key generated."); }} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase">Organization Name</label>
            <input type="text" placeholder="e.g. Enterprise Security Ops" required className="bg-[#111216] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-semibold text-zinc-400 uppercase">Developer Email</label>
            <input type="email" placeholder="dev@organization.com" required className="bg-[#111216] border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-white" />
          </div>

          <button type="submit" className="w-full py-2.5 rounded-lg bg-white text-black font-semibold text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all mt-1 cursor-pointer">
            <Send size={14} /> Request API Key
          </button>
        </form>
      </div>
    </div>
  );
}
