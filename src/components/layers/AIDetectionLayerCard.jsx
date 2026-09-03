// src/components/layers/AIDetectionLayerCard.jsx
import React from 'react';
import { Bot } from 'lucide-react';

export default function AIDetectionLayerCard({ rawNetScore, vocoderScan, watermarkAudit }) {
  return (
    <div className="bg-[#111216] border border-white/8 rounded-xl p-3 flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
        <Bot size={14} />
        <span>AI Detection Layer</span>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-400">
        <span>RawNet2 Score:</span>
        <strong className="text-white">{rawNetScore}</strong>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-400">
        <span>VocoderID Scan:</span>
        <strong className="text-white">{vocoderScan}</strong>
      </div>
      <div className="flex justify-between text-[11px] text-zinc-400">
        <span>Watermark Audit:</span>
        <strong className="text-white">{watermarkAudit}</strong>
      </div>
    </div>
  );
}
