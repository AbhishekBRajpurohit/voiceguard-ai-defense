// src/pages/LiveCheck.jsx
import React, { useState, useEffect, useRef } from 'react';
import AudioRecorder from '../components/input/AudioRecorder';
import FileUpload from '../components/input/FileUpload';
import PipelineStages from '../components/pipeline/PipelineStages';
import ChallengeResponseCard from '../components/pipeline/ChallengeResponseCard';
import AIDetectionLayerCard from '../components/layers/AIDetectionLayerCard';
import NonAIDetectionLayerCard from '../components/layers/NonAIDetectionLayerCard';
import DecisionBanner from '../components/result/DecisionBanner';
import { presetScenarios } from '../mock/mockApi';

export default function LiveCheck() {
  const [activeScenario, setActiveScenario] = useState('human-normal');
  const [transcript, setTranscript] = useState('"Hello, I\'d like to check my account balance for month end savings."');
  const [metrics, setMetrics] = useState(presetScenarios['human-normal'].metrics);

  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animFrameId = null;
    let step = 0;

    function render() {
      step += 0.05;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = "#08090c";
      ctx.fillRect(0, 0, w, h);

      const cols = 40;
      const colWidth = w / cols;
      for (let i = 0; i < cols; i++) {
        const energy = Math.sin(step + i * 0.3) * 0.5 + 0.5;
        const barHeight = energy * (h * 0.7);
        const hue = 220 + energy * 60;
        ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.15)`;
        ctx.fillRect(i * colWidth, h - barHeight, colWidth - 2, barHeight);
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ffffff";
      const points = 100;
      const sliceWidth = w / points;
      let x = 0;
      for (let i = 0; i < points; i++) {
        const freq1 = Math.sin(step * 2 + i * 0.1) * 15;
        const freq2 = Math.cos(step * 3 + i * 0.05) * 10;
        const y = (h / 2) + freq1 + freq2;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.stroke();
      animFrameId = requestAnimationFrame(render);
    }
    render();

    return () => cancelAnimationFrame(animFrameId);
  }, []);

  const handleAudioAnalyzed = (calculatedFeatures) => {
    setMetrics(calculatedFeatures);
  };

  const handlePresetSelect = (key) => {
    setActiveScenario(key);
    const data = presetScenarios[key];
    if (data) {
      setTranscript(data.transcript);
      setMetrics(data.metrics);
    }
  };

  const riskScore = metrics.syntheticRisk;
  const trustScore = Math.max(0, Math.min(100, Math.round((1 - riskScore) * 100)));

  let decision = "ALLOW";
  let detail = `Verified authentic voice stream (Trust Rating: ${trustScore}%).`;
  if (riskScore >= 0.65) {
    decision = "BLOCK";
    detail = `High-Risk synthetic voice clone detected (Risk Index: ${(riskScore * 100).toFixed(0)}%).`;
  } else if (riskScore >= 0.35 || metrics.duration < 2.0) {
    decision = "FLAGGED";
    detail = metrics.duration < 2.0 ? "Short-Clip Protection Active (<2.0s). Step-up challenge required." : "Ambiguous risk index. Secondary challenge triggered.";
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Input Panel */}
      <div className="lg:col-span-4 bg-black/40 border border-white/8 rounded-2xl p-4.5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-1">
            <i className="fa-solid fa-microphone text-white"></i> Audio Stream Capture
          </h3>
          <p className="text-xs text-zinc-400">Record live microphone stream via WebRTC or upload audio file to compute O(n) PCM metrics.</p>
        </div>

        <AudioRecorder onAudioAnalyzed={handleAudioAnalyzed} setTranscript={setTranscript} />

        <div className="text-center text-[10px] font-bold text-zinc-500 tracking-wider">OR UPLOAD FILE</div>

        <FileUpload onAudioAnalyzed={handleAudioAnalyzed} setTranscript={setTranscript} />

        <div className="flex flex-col gap-2">
          <label className="text-[11px] text-zinc-400 font-semibold flex items-center gap-1.5">
            <i className="fa-solid fa-list-check"></i> Or Select Preset Test Profile:
          </label>
          <div className="flex flex-col gap-1.5">
            {[
              { key: 'human-normal', label: 'Authentic Human Balance Query' },
              { key: 'deepfake-highstake', label: 'ElevenLabs Wire Transfer Deepfake' },
              { key: 'cli-spoof', label: 'CLI Caller ID Spoof Request' },
              { key: 'ai-agent', label: 'Vocoder Synthetic Bot' }
            ].map(p => (
              <button
                key={p.key}
                onClick={() => handlePresetSelect(p.key)}
                className={`p-2.5 rounded-lg border text-left text-xs font-medium transition-all cursor-pointer ${
                  activeScenario === p.key 
                    ? 'bg-white/10 border-white text-white font-semibold' 
                    : 'bg-[#16171d] border-white/8 text-zinc-400 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Output Panel */}
      <div className="lg:col-span-8 bg-black/40 border border-white/8 rounded-2xl p-4.5 flex flex-col gap-3.5">
        {/* Waveform Canvas */}
        <div className="bg-[#111216] border border-white/8 rounded-xl p-3">
          <div className="flex justify-between items-center text-xs text-zinc-400 mb-2">
            <span className="flex items-center gap-1.5"><i className="fa-solid fa-chart-simple"></i> Real-Time Waveform &amp; Spectrogram (PCM Analysis)</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active Engine</span>
          </div>
          <canvas ref={canvasRef} width={600} height={110} className="w-full h-28 rounded-lg bg-[#08090c]"></canvas>
        </div>

        {/* Speech-to-Text Transcription */}
        <div className="bg-[#16171d] border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-zinc-400 font-semibold uppercase mb-1 flex items-center gap-1.5">
            <i className="fa-solid fa-comment-dots text-zinc-400"></i> Live Speech-to-Text Transcription (Web Speech API)
          </div>
          <div className="text-xs text-zinc-200 italic">{transcript}</div>
        </div>

        {/* Real Calculated Features Table */}
        <div className="bg-[#111216] border border-white/8 rounded-xl p-3">
          <div className="text-[10px] text-zinc-400 font-semibold uppercase mb-2 flex items-center gap-1.5">
            <i className="fa-solid fa-calculator"></i> Client-Side O(n) Signal Feature Extraction
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#16171d] border border-white/6 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">RMS Energy Var</span>
              <strong className="text-sm font-mono font-bold text-white my-0.5">{metrics.rmsVar.toFixed(5)}</strong>
              <small className="text-[10px] text-zinc-400">{metrics.rmsVar < 0.001 ? "Flat (Synthetic TTS)" : "Natural Dynamics"}</small>
            </div>

            <div className="bg-[#16171d] border border-white/6 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Zero Crossing (ZCR)</span>
              <strong className="text-sm font-mono font-bold text-white my-0.5">{metrics.zcr.toFixed(3)}</strong>
              <small className="text-[10px] text-zinc-400">{(metrics.zcr >= 0.06 && metrics.zcr <= 0.25) ? "Normal (0.06 - 0.25)" : "Anomalous Rate"}</small>
            </div>

            <div className="bg-[#16171d] border border-white/6 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">HF Energy Ratio</span>
              <strong className="text-sm font-mono font-bold text-white my-0.5">{metrics.hfRatio.toFixed(3)}</strong>
              <small className="text-[10px] text-zinc-400">{metrics.hfRatio < 0.15 ? "High-Pass Loss (TTS)" : "Natural Fricatives"}</small>
            </div>

            <div className="bg-[#16171d] border border-white/6 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Pitch Periodicity</span>
              <strong className="text-sm font-mono font-bold text-white my-0.5">{metrics.pitchPeriodicity.toFixed(3)}</strong>
              <small className="text-[10px] text-zinc-400">{metrics.pitchPeriodicity > 0.80 ? "Rigid TTS Periodicity" : "Human Micro-Jitter"}</small>
            </div>

            <div className="bg-[#16171d] border border-white/6 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Pause Ratio</span>
              <strong className="text-sm font-mono font-bold text-white my-0.5">{metrics.pauseRatio.toFixed(3)}</strong>
              <small className="text-[10px] text-zinc-400">{metrics.pauseRatio < 0.05 ? "No Pauses (Continuous)" : "Natural Spacing"}</small>
            </div>

            <div className="bg-[#16171d] border border-white/6 rounded-lg p-2 flex flex-col">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase">Dynamic Range</span>
              <strong className="text-sm font-mono font-bold text-white my-0.5">{metrics.dynamicRangeDb.toFixed(1)} dB</strong>
              <small className="text-[10px] text-zinc-400">{(metrics.dynamicRangeDb >= 40 && metrics.dynamicRangeDb <= 70) ? "Natural Span (40-70dB)" : "Compressed Span"}</small>
            </div>
          </div>
        </div>

        {/* Stepper Track */}
        <PipelineStages currentStep={decision} />

        {/* Challenge Response Card */}
        <ChallengeResponseCard visible={decision === "FLAGGED"} />

        {/* Dual Detection Layers */}
        <div className="grid grid-cols-2 gap-2.5">
          <AIDetectionLayerCard 
            rawNetScore={riskScore >= 0.65 ? `${(riskScore * 100).toFixed(1)}% Synthetic` : `${trustScore}% Authentic`}
            vocoderScan={riskScore >= 0.65 ? "Vocoder Artifact Match (ElevenLabs)" : "Clean (No Vocoder Artifacts)"}
            watermarkAudit={riskScore >= 0.65 ? "TriBlock Flagged" : "TriBlock Verified"}
          />
          <NonAIDetectionLayerCard 
            callbackStatus={riskScore >= 0.65 ? "REJECTED (Callback Mismatch)" : "VALIDATED (STIR/SHAKEN)"}
            otpStatus={riskScore >= 0.65 ? "Token Failed" : "Token Match Confirmed"}
            voiceprintStatus={riskScore >= 0.65 ? "Embedding Mismatch" : "512-d Embedding Match"}
          />
        </div>

        {/* Decision Banner */}
        <DecisionBanner decision={decision} detail={detail} trustScore={trustScore} />
      </div>
    </div>
  );
}
