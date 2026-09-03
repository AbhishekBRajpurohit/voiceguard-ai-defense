// src/components/layers/NonAIDetectionLayerCard.jsx
import React from 'react';
import { PhoneCall } from 'lucide-react';

export default function NonAIDetectionLayerCard({ callbackStatus, otpStatus, voiceprintStatus }) {
  return (
    <div className="bg-[#111216] border border-white/8 rounded-xl p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
        <PhoneCall size={14} />
        <span>Non-AI Telephony Layer</span>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-400">
        <span>Callback Status:</span>
        <strong className="text-white">{callbackStatus}</strong>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-400">
        <span>Out-of-Band OTP:</span>
        <strong className="text-white">{otpStatus}</strong>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-400">
        <span>Voice Print Biometric:</span>
        <strong className="text-white">{voiceprintStatus}</strong>
      </div>
    </div>
  );
}
