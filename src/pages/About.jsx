// src/pages/About.jsx
import React from 'react';
import { BookOpen } from 'lucide-react';

export default function About() {
  return (
    <div className="flex flex-col gap-4">
      <div className="border-b border-white/8 pb-3">
        <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-1">
          <BookOpen size={18} /> Deep-Dive: Core Acoustic Detection Algorithms
        </h3>
        <p className="text-xs text-zinc-400">
          When audio is recorded or uploaded, VoiceGuard decodes raw audio buffers into Float32Array PCM samples and computes 6 core acoustic features in O(n) linear time:
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-1">1. RMS Energy Variance (O(n))</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Divides audio into 20ms frames and computes Root-Mean-Square loudness variance across frames. Human speech has natural loudness fluctuations from breathing; generative TTS produces unnaturally flat energy.
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-1">2. Zero Crossing Rate (ZCR)</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Counts y=0 axis line crossings. Natural speech operates between 0.06 - 0.25. Extremely low ZCR indicates artificial pure tones; high ZCR indicates synthetic noise injection.
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-1">3. High-Frequency Energy Ratio</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Uses a first-difference discrete filter (d[i] = x[i] - x[i-1]) to measure high-pass energy ratio without requiring an O(n^2) Fourier transform. Smooth AI voices lack high-frequency fricative noise.
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-1">4. Pitch Periodicity (Autocorrelation)</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Computes normalized autocorrelation at pitch lag ~5.5ms (~180Hz). Synthetic voices display rigid mathematical periodicity across frames, whereas human vocal cords exhibit micro-jitter.
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-1">5. Silence &amp; Pause Distribution</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Measures the ratio of silent frames below an energy threshold (0.008). AI voices feature either continuous speech with zero pauses or unnaturally uniform pause spacing.
          </p>
        </div>

        <div className="bg-white/3 border border-white/8 rounded-xl p-4">
          <h4 className="text-xs font-semibold text-white mb-1">6. Dynamic Range Calculation</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Calculates peak-to-noise-floor ratio in decibels (20 log10(V_peak / V_floor)). Human voices span 40–70 dB; TTS outputs are over-compressed (&lt;20dB) or unnaturally clean (&gt;80dB).
          </p>
        </div>
      </div>
    </div>
  );
}
