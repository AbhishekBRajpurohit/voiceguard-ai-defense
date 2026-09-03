// src/components/result/ConfidenceGauge.jsx
import React from 'react';

export default function ConfidenceGauge({ score }) {
  return (
    <div className="w-16 h-16 rounded-full border-4 border-white flex flex-col items-center justify-center bg-[#111216]">
      <span className="text-base font-bold text-white">{score}%</span>
      <span className="text-[9px] text-zinc-400 uppercase">Trust</span>
    </div>
  );
}
