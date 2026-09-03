// src/components/pipeline/PipelineStages.jsx
import React from 'react';
import { Mic, Tag, Shield, Scale, CheckCircle2 } from 'lucide-react';

export default function PipelineStages({ currentStep }) {
  const steps = [
    { id: 'asr', label: 'ASR Transcribe', icon: Mic },
    { id: 'classifier', label: 'Classification', icon: Tag },
    { id: 'dual', label: 'Dual Detection', icon: Shield },
    { id: 'fusion', label: 'Risk Fusion', icon: Scale },
    { id: 'decision', label: 'Decision', icon: CheckCircle2 }
  ];

  return (
    <div className="bg-[#111216] border border-white/8 rounded-xl p-3">
      <div className="text-[11px] text-zinc-400 font-semibold uppercase mb-2 flex items-center gap-1.5">
        <i className="fa-solid fa-diagram-project text-zinc-400"></i> Pipeline Stepper &amp; Dual Layer Inspection
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {steps.map(step => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="bg-[#16171d] border border-white/10 rounded-lg py-1.5 px-2 text-center flex flex-col items-center justify-center gap-1"
            >
              <Icon size={12} className="text-white" />
              <span className="text-[10px] font-medium text-white">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
