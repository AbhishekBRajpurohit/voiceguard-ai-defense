// src/mock/mockApi.js - Client-Side Acoustic Detection Algorithms (O(n))

export function extractAcousticFeatures(audioBuffer) {
  const pcm = audioBuffer.getChannelData(0);
  const n = pcm.length;
  const fs = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;

  // 1. RMS Energy Variance (O(n))
  const frameSize = Math.floor(fs * 0.02); // 20ms frame
  const frameCount = Math.floor(n / frameSize);
  const rmsValues = [];
  let silentFrameCount = 0;

  for (let i = 0; i < frameCount; i++) {
    let sumSq = 0;
    const start = i * frameSize;
    for (let j = 0; j < frameSize; j++) {
      const val = pcm[start + j];
      sumSq += val * val;
    }
    const rms = Math.sqrt(sumSq / frameSize);
    rmsValues.push(rms);
    if (rms < 0.008) silentFrameCount++;
  }

  const meanRms = rmsValues.reduce((a, b) => a + b, 0) / (rmsValues.length || 1);
  const rmsVar = rmsValues.reduce((a, b) => a + Math.pow(b - meanRms, 2), 0) / (rmsValues.length || 1);

  // 2. Zero Crossing Rate (ZCR)
  let zeroCrossings = 0;
  for (let i = 1; i < n; i++) {
    if ((pcm[i] >= 0 && pcm[i - 1] < 0) || (pcm[i] < 0 && pcm[i - 1] >= 0)) {
      zeroCrossings++;
    }
  }
  const zcr = zeroCrossings / n;

  // 3. High-Frequency Energy Ratio (First-Difference Filter: d[i] = x[i] - x[i-1])
  let hfEnergy = 0;
  let rawEnergy = 0;
  for (let i = 1; i < n; i++) {
    const diff = pcm[i] - pcm[i - 1];
    hfEnergy += diff * diff;
    rawEnergy += pcm[i] * pcm[i];
  }
  const hfRatio = hfEnergy / (rawEnergy + 1e-9);

  // 4. Pitch Periodicity (Autocorrelation at tau ~ 5.5ms / ~180Hz)
  const tau = Math.floor(fs * 0.0055);
  let autoCorrNum = 0;
  let autoCorrDen1 = 0;
  let autoCorrDen2 = 0;
  for (let i = 0; i < n - tau; i++) {
    autoCorrNum += pcm[i] * pcm[i + tau];
    autoCorrDen1 += pcm[i] * pcm[i];
    autoCorrDen2 += pcm[i + tau] * pcm[i + tau];
  }
  const pitchPeriodicity = Math.abs(autoCorrNum / (Math.sqrt(autoCorrDen1 * autoCorrDen2) + 1e-9));

  // 5. Silence & Pause Distribution Ratio
  const pauseRatio = silentFrameCount / (frameCount || 1);

  // 6. Dynamic Range Calculation (dB)
  let peak = 0;
  const absPcm = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const absVal = Math.abs(pcm[i]);
    absPcm[i] = absVal;
    if (absVal > peak) peak = absVal;
  }
  absPcm.sort();
  const noiseFloor = absPcm[Math.floor(n * 0.05)] || 1e-6;
  const dynamicRangeDb = 20 * Math.log10((peak + 1e-6) / noiseFloor);

  // 7. Synthetic Risk Calculation
  let syntheticRisk = 0;
  if (rmsVar < 0.001) syntheticRisk += 0.25;
  if (zcr < 0.05 || zcr > 0.30) syntheticRisk += 0.20;
  if (hfRatio < 0.15) syntheticRisk += 0.20;
  if (pitchPeriodicity > 0.80) syntheticRisk += 0.25;
  if (pauseRatio < 0.05 || pauseRatio > 0.50) syntheticRisk += 0.10;

  // Short-Clip Protection (<2.0s capped at max 0.48)
  if (duration < 2.0) {
    syntheticRisk = Math.min(syntheticRisk, 0.48);
  }

  return {
    rmsVar,
    zcr,
    hfRatio,
    pitchPeriodicity,
    pauseRatio,
    dynamicRangeDb,
    syntheticRisk,
    duration
  };
}

export const presetScenarios = {
  "human-normal": {
    transcript: '"Hello, I\'d like to check my account balance for month end savings."',
    metrics: { rmsVar: 0.00342, zcr: 0.142, hfRatio: 0.284, pitchPeriodicity: 0.421, pauseRatio: 0.185, dynamicRangeDb: 54.2, syntheticRisk: 0.04, duration: 3.5 }
  },
  "deepfake-highstake": {
    transcript: '"Urgent! Please wire transfer 50,000 INR from my savings account immediately to emergency account 8829."',
    metrics: { rmsVar: 0.00031, zcr: 0.038, hfRatio: 0.092, pitchPeriodicity: 0.912, pauseRatio: 0.021, dynamicRangeDb: 18.4, syntheticRisk: 0.85, duration: 4.2 }
  },
  "cli-spoof": {
    transcript: '"This is executive customer desk calling regarding urgent credential confirmation."',
    metrics: { rmsVar: 0.00121, zcr: 0.095, hfRatio: 0.168, pitchPeriodicity: 0.650, pauseRatio: 0.110, dynamicRangeDb: 34.5, syntheticRisk: 0.45, duration: 3.1 }
  },
  "ai-agent": {
    transcript: '"Automated robocall notice: Your account password requires mandatory reset."',
    metrics: { rmsVar: 0.00015, zcr: 0.320, hfRatio: 0.081, pitchPeriodicity: 0.880, pauseRatio: 0.010, dynamicRangeDb: 15.2, syntheticRisk: 0.92, duration: 3.8 }
  }
};
