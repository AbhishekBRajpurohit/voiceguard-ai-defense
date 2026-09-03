// src/mock/mockApi.js — "Guilty Until Proven Innocent" Voice Detection Engine
//
// DESIGN: Modern AI/TTS (ElevenLabs, Google, Azure) produces audio that is
// nearly indistinguishable from human speech on simple features.
//
// STRATEGY: Start at HIGH base risk (0.60). Only REDUCE risk when we find
// strong *human-specific* indicators. AI audio won't have enough human
// indicators to bring risk below the BLOCK threshold.
//
// HUMAN indicators that reduce risk:
//   - High amplitude variation (breathing, emotion)
//   - Natural micro-pauses and silence
//   - Wide dynamic range
//   - Temporal energy irregularity
//   - Pitch instability (micro-jitter)
//   - Standard telephony sample rate
//
// This ensures uploaded AI audio = BLOCK, live mic = ALLOW.

export function extractAcousticFeatures(audioBuffer) {
  const pcm      = audioBuffer.getChannelData(0);
  const n        = pcm.length;
  const fs       = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // ── 1. RMS Energy Variance (20ms frames) ────────────────────────────────
  const frameSize  = Math.floor(fs * 0.02);
  const frameCount = Math.floor(n / frameSize);
  const rmsValues  = [];
  let silentFrameCount = 0;

  for (let i = 0; i < frameCount; i++) {
    let sumSq = 0;
    const start = i * frameSize;
    for (let j = 0; j < frameSize; j++) {
      const v = pcm[start + j];
      sumSq += v * v;
    }
    const rms = Math.sqrt(sumSq / frameSize);
    rmsValues.push(rms);
    if (rms < 0.008) silentFrameCount++;
  }

  const meanRms = rmsValues.reduce((a, b) => a + b, 0) / (rmsValues.length || 1);
  const rmsVar  = rmsValues.reduce((a, b) => a + Math.pow(b - meanRms, 2), 0)
                  / (rmsValues.length || 1);

  // ── 2. Zero Crossing Rate ────────────────────────────────────────────────
  let zeroCrossings = 0;
  for (let i = 1; i < n; i++) {
    if ((pcm[i] >= 0 && pcm[i - 1] < 0) || (pcm[i] < 0 && pcm[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / n;

  // ── 3. High-Frequency Energy Ratio ──────────────────────────────────────
  let hfEnergy = 0, rawEnergy = 0;
  for (let i = 1; i < n; i++) {
    const d = pcm[i] - pcm[i - 1];
    hfEnergy  += d * d;
    rawEnergy += pcm[i] * pcm[i];
  }
  const hfRatio = hfEnergy / (rawEnergy + 1e-9);

  // ── 4. Multi-Lag Pitch Periodicity ─────────────────────────────────────
  const lagMin = Math.floor(fs * 0.002);
  const lagMax = Math.floor(fs * 0.012);
  let maxPeriodicity = 0;
  for (let tau = lagMin; tau <= lagMax; tau += Math.max(1, Math.floor((lagMax - lagMin) / 25))) {
    let num = 0, d1 = 0, d2 = 0;
    const limit = Math.min(n - tau, 8192);
    for (let i = 0; i < limit; i++) {
      num += pcm[i] * pcm[i + tau];
      d1  += pcm[i] * pcm[i];
      d2  += pcm[i + tau] * pcm[i + tau];
    }
    const r = Math.abs(num / (Math.sqrt(d1 * d2) + 1e-9));
    if (r > maxPeriodicity) maxPeriodicity = r;
  }
  const pitchPeriodicity = maxPeriodicity;

  // ── 5. Silence / Pause Ratio ────────────────────────────────────────────
  const pauseRatio = silentFrameCount / (frameCount || 1);

  // ── 6. Dynamic Range (dB) ──────────────────────────────────────────────
  let peak = 0;
  const absPcm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.abs(pcm[i]);
    absPcm[i] = a;
    if (a > peak) peak = a;
  }
  absPcm.sort();
  const noiseFloor     = absPcm[Math.floor(n * 0.05)] || 1e-6;
  const dynamicRangeDb = 20 * Math.log10((peak + 1e-6) / noiseFloor);

  // ── 7. Temporal Regularity (8 equal chunks — is energy distribution even?) ─
  const chunkLen = Math.floor(n / 8);
  const chunkRms = [];
  for (let c = 0; c < 8; c++) {
    let s = 0;
    const start = c * chunkLen;
    for (let j = 0; j < chunkLen; j++) s += pcm[start + j] * pcm[start + j];
    chunkRms.push(Math.sqrt(s / chunkLen));
  }
  const chunkMean = chunkRms.reduce((a, b) => a + b, 0) / 8;
  const chunkVar  = chunkRms.reduce((a, b) => a + Math.pow(b - chunkMean, 2), 0) / 8;
  const temporalRegularity = chunkMean > 0.0005
    ? Math.min(1, chunkVar / (chunkMean * chunkMean + 1e-9))
    : 0;

  // ── 8. INVERTED "Guilty-Until-Proven-Innocent" Risk Score ──────────────
  //
  // Start at 0.60 (BLOCK by default). Only SUBTRACT when we see
  // convincing evidence of human speech.
  //
  let syntheticRisk = 0.60;

  // Human indicator 1: High RMS variance → natural loudness modulation
  // (breathing, emphasis, emotion create high variance)
  if (rmsVar > 0.008)      syntheticRisk -= 0.15;
  else if (rmsVar > 0.004) syntheticRisk -= 0.10;
  else if (rmsVar > 0.002) syntheticRisk -= 0.04;
  // rmsVar < 0.002 → no reduction → stays risky (AI-flat)

  // Human indicator 2: Natural pause presence
  // Real humans pause to think, breathe. TTS is continuous.
  if (pauseRatio > 0.15)      syntheticRisk -= 0.12;
  else if (pauseRatio > 0.08) syntheticRisk -= 0.07;
  else if (pauseRatio > 0.04) syntheticRisk -= 0.03;
  // pauseRatio < 0.04 → no reduction → stays risky

  // Human indicator 3: Pitch instability (low periodicity)
  // Human vocal cords jitter; TTS is hyper-periodic.
  if (pitchPeriodicity < 0.40)       syntheticRisk -= 0.15;
  else if (pitchPeriodicity < 0.55)  syntheticRisk -= 0.08;
  else if (pitchPeriodicity < 0.65)  syntheticRisk -= 0.03;
  // periodicity > 0.65 → no reduction → stays risky

  // Human indicator 4: Wide dynamic range (real mic captures room noise + voice)
  if (dynamicRangeDb > 50)      syntheticRisk -= 0.08;
  else if (dynamicRangeDb > 38) syntheticRisk -= 0.04;

  // Human indicator 5: Temporal irregularity (energy not evenly distributed)
  if (temporalRegularity > 0.25)       syntheticRisk -= 0.08;
  else if (temporalRegularity > 0.12)  syntheticRisk -= 0.04;

  // Human indicator 6: Normal ZCR range
  if (zcr >= 0.06 && zcr <= 0.25)     syntheticRisk -= 0.04;

  // Penalty: Unusual sample rate (22050, 24000 = TTS output default)
  if (fs === 22050 || fs === 24000)    syntheticRisk += 0.06;

  // Short-clip cap: < 2s → can't reliably classify → cap at FLAG level
  if (duration < 2.0) {
    syntheticRisk = Math.min(syntheticRisk, 0.48);
  }

  // Clamp to [0, 1]
  syntheticRisk = Math.min(1, Math.max(0, syntheticRisk));

  return {
    rmsVar,
    zcr,
    hfRatio,
    pitchPeriodicity,
    pauseRatio,
    dynamicRangeDb,
    temporalRegularity,
    syntheticRisk,
    duration,
    sampleRate: fs,
  };
}

// ── Preset Scenarios ─────────────────────────────────────────────────────────
export const presetScenarios = {
  "human-normal": {
    transcript: '"Hello, I\'d like to check my account balance for month end savings."',
    metrics: {
      rmsVar: 0.00921, zcr: 0.148, hfRatio: 0.312, pitchPeriodicity: 0.31,
      pauseRatio: 0.24, dynamicRangeDb: 56.4, temporalRegularity: 0.52,
      syntheticRisk: 0.04, duration: 3.5, sampleRate: 44100,
    }
  },
  "deepfake-highstake": {
    transcript: '"Urgent! Please wire transfer 50,000 INR from my savings account immediately to emergency account 8829."',
    metrics: {
      rmsVar: 0.00028, zcr: 0.035, hfRatio: 0.078, pitchPeriodicity: 0.93,
      pauseRatio: 0.012, dynamicRangeDb: 17.2, temporalRegularity: 0.03,
      syntheticRisk: 0.92, duration: 4.2, sampleRate: 22050,
    }
  },
  "cli-spoof": {
    transcript: '"This is executive customer desk calling regarding urgent credential confirmation."',
    metrics: {
      rmsVar: 0.00150, zcr: 0.092, hfRatio: 0.162, pitchPeriodicity: 0.68,
      pauseRatio: 0.065, dynamicRangeDb: 33.1, temporalRegularity: 0.09,
      syntheticRisk: 0.54, duration: 3.1, sampleRate: 24000,
    }
  },
  "ai-agent": {
    transcript: '"Automated robocall notice: Your account password requires mandatory reset."',
    metrics: {
      rmsVar: 0.00012, zcr: 0.328, hfRatio: 0.071, pitchPeriodicity: 0.91,
      pauseRatio: 0.005, dynamicRangeDb: 14.8, temporalRegularity: 0.02,
      syntheticRisk: 0.95, duration: 3.8, sampleRate: 22050,
    }
  }
};

// ── Audit Log Mock Data ──────────────────────────────────────────────────────
export const mockAuditLogs = [
  { id: "CALL-98210", time: "2026-09-03 19:42", caller: "+91 98450 11029", type: "Wire Transfer (₹50k)",   aiScore: "94.6% Deepfake",    telephony: "OOB Rejected",   decision: "BLOCK", dClass: "text-red-400"    },
  { id: "CALL-98209", time: "2026-09-03 19:35", caller: "+91 80234 89201", type: "Balance Inquiry",        aiScore: "98.2% Authentic",   telephony: "STIR Verified",  decision: "ALLOW", dClass: "text-emerald-400" },
  { id: "CALL-98208", time: "2026-09-03 19:28", caller: "+91 99001 44521", type: "VIP Credential Reset",   aiScore: "Ambiguous (62%)",   telephony: "CLI Spoof Flag", decision: "FLAG",  dClass: "text-amber-400"  },
  { id: "CALL-98207", time: "2026-09-03 19:15", caller: "+91 91234 56789", type: "Robocall Spam",          aiScore: "99.1% Vocoder Bot", telephony: "Unverified",     decision: "BLOCK", dClass: "text-red-400"    },
  { id: "CALL-98206", time: "2026-09-03 19:02", caller: "+91 98765 43210", type: "Account Statement",      aiScore: "97.5% Authentic",   telephony: "STIR Verified",  decision: "ALLOW", dClass: "text-emerald-400" },
  { id: "CALL-98205", time: "2026-09-03 18:55", caller: "+91 77890 22110", type: "Password Reset",         aiScore: "81.3% Synthetic",   telephony: "CLI Mismatch",   decision: "BLOCK", dClass: "text-red-400"    },
  { id: "CALL-98204", time: "2026-09-03 18:40", caller: "+91 90011 33456", type: "Loan Inquiry",           aiScore: "95.8% Authentic",   telephony: "STIR Verified",  decision: "ALLOW", dClass: "text-emerald-400" },
];
