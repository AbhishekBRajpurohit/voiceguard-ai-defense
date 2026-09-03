// src/components/result/DecisionBanner.jsx
import React from 'react';
import ConfidenceGauge from './ConfidenceGauge';

export default function DecisionBanner({ decision, detail, trustScore }) {
  let bgStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
  if (decision === "BLOCK" || decision === "BLOCKED") {
    bgStyle = "bg-red-500/10 border-red-500/40 text-red-400";
  } else if (decision === "FLAGGED" || decision === "FLAG") {
    bgStyle = "bg-amber-500/10 border-amber-500/40 text-amber-400";
  }

  return (
    <div className={`border rounded-xl p-4 flex items-center justify-between transition-all ${bgStyle}`}>
      <div>
        <div className="text-[10px] font-bold tracking-widest text-zinc-400 uppercase">Authorization Decision</div>
        <h2 className="text-xl font-bold mt-0.5 mb-1">{decision}</h2>
        <p className="text-xs text-zinc-300">{detail}</p>
      </div>
      <ConfidenceGauge score={trustScore} />
    </div>
  );
}
