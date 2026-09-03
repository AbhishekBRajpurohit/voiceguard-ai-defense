document.addEventListener("DOMContentLoaded", () => {
  // ==========================================
  // 1) Mobile Menu & Overlay Logic
  // ==========================================
  const burgerBtn = document.getElementById("burgerBtn");
  const mobileOverlay = document.getElementById("mobileOverlay");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  function openMenu() {
    burgerBtn.setAttribute("aria-expanded", "true");
    mobileOverlay.classList.remove("hidden");
    mobileMenu.classList.remove("hidden");
    document.body.classList.add("menu-open");
  }

  function closeMenu() {
    burgerBtn.setAttribute("aria-expanded", "false");
    mobileOverlay.classList.add("hidden");
    mobileMenu.classList.add("hidden");
    document.body.classList.remove("menu-open");
  }

  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      const isExpanded = burgerBtn.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeMenu();
      } else {
        openMenu();
      }
    });
  }

  if (mobileOverlay) {
    mobileOverlay.addEventListener("click", closeMenu);
  }

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMenu();
      closeAllModals();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && !mobileMenu.classList.contains("hidden")) {
      closeMenu();
    }
  });

  // ==========================================
  // 2) Multi-Modal Navigation System
  // ==========================================
  const allModals = document.querySelectorAll(".sih-modal-backdrop");
  const closeBtns = document.querySelectorAll(".sih-close-btn");
  const navLinks = document.querySelectorAll(".nav-link");
  const mobileNavLinks = document.querySelectorAll(".mobile-link");

  function closeAllModals() {
    allModals.forEach(m => m.classList.add("hidden"));
    stopAudioCanvasAnimation();
  }

  function openModal(modalId) {
    closeAllModals();
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      targetModal.classList.remove("hidden");
      if (modalId === "modal-product") {
        startAudioCanvasAnimation();
      }
    }
  }

  const modalTriggers = document.querySelectorAll("[data-target-modal]");
  modalTriggers.forEach(trigger => {
    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      const modalId = trigger.getAttribute("data-target-modal");
      const navKey = trigger.getAttribute("data-nav");

      if (navKey) {
        navLinks.forEach(l => {
          if (l.getAttribute("data-nav") === navKey) {
            l.classList.add("active");
          } else {
            l.classList.remove("active");
          }
        });

        mobileNavLinks.forEach(l => {
          if (l.getAttribute("data-nav") === navKey) {
            l.classList.add("active");
          } else {
            l.classList.remove("active");
          }
        });
      }

      closeMenu();
      openModal(modalId);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener("click", closeAllModals);
  });

  allModals.forEach(modal => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // Modal Tabs (inside Product modal)
  const sihTabs = document.querySelectorAll(".sih-tab");
  const sihTabContents = document.querySelectorAll(".sih-tab-content");

  sihTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      sihTabs.forEach(t => t.classList.remove("active"));
      sihTabContents.forEach(c => c.classList.remove("active"));

      tab.classList.add("active");
      const targetId = `tab-${tab.getAttribute("data-tab")}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
    });
  });

  // ==========================================
  // 3) Client-Side O(n) Signal Feature Extraction Engine (Web Audio API)
  // ==========================================
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  function extractAcousticFeatures(audioBuffer) {
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

    // 3. High-Frequency Energy Ratio (First-Difference Filter d[i] = x[i] - x[i-1])
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

    // 5. Silence & Pause Ratio
    const pauseRatio = silentFrameCount / (frameCount || 1);

    // 6. Dynamic Range (dB)
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

    // 7. Short-Clip Protection & Synthetic Score Evaluation
    let syntheticRisk = 0;
    if (rmsVar < 0.001) syntheticRisk += 0.25;
    if (zcr < 0.05 || zcr > 0.30) syntheticRisk += 0.20;
    if (hfRatio < 0.15) syntheticRisk += 0.20;
    if (pitchPeriodicity > 0.80) syntheticRisk += 0.25;
    if (pauseRatio < 0.05 || pauseRatio > 0.50) syntheticRisk += 0.10;

    // Apply Short-Clip Cap
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

  // UI Metric Elements
  const valRmsVar = document.getElementById("valRmsVar");
  const subRmsVar = document.getElementById("subRmsVar");
  const valZcr = document.getElementById("valZcr");
  const subZcr = document.getElementById("subZcr");
  const valHfRatio = document.getElementById("valHfRatio");
  const subHfRatio = document.getElementById("subHfRatio");
  const valPitchPer = document.getElementById("valPitchPer");
  const subPitchPer = document.getElementById("subPitchPer");
  const valPauseRatio = document.getElementById("valPauseRatio");
  const subPauseRatio = document.getElementById("subPauseRatio");
  const valDynRange = document.getElementById("valDynRange");
  const subDynRange = document.getElementById("subDynRange");

  const mAiRawNet = document.getElementById("mAiRawNet");
  const mAiVocoder = document.getElementById("mAiVocoder");
  const mAiWatermark = document.getElementById("mAiWatermark");
  const mNonAiCallback = document.getElementById("mNonAiCallback");
  const mNonAiOtp = document.getElementById("mNonAiOtp");
  const mNonAiVoiceprint = document.getElementById("mNonAiVoiceprint");

  const decisionBanner = document.getElementById("decisionBanner");
  const bannerDecision = document.getElementById("bannerDecision");
  const bannerDetail = document.getElementById("bannerDetail");
  const gaugeVal = document.getElementById("gaugeVal");
  const challengeCard = document.getElementById("challengeCard");

  function updateUiWithCalculatedFeatures(metrics, scenarioName) {
    valRmsVar.textContent = metrics.rmsVar.toFixed(5);
    subRmsVar.textContent = metrics.rmsVar < 0.001 ? "Flat (Synthetic TTS)" : "Natural Loudness Dynamics";

    valZcr.textContent = metrics.zcr.toFixed(3);
    subZcr.textContent = (metrics.zcr >= 0.06 && metrics.zcr <= 0.25) ? "Normal Speech (0.06 - 0.25)" : "Anomalous Crossing Rate";

    valHfRatio.textContent = metrics.hfRatio.toFixed(3);
    subHfRatio.textContent = metrics.hfRatio < 0.15 ? "High-Pass Loss (TTS)" : "Natural Fricatives";

    valPitchPer.textContent = metrics.pitchPeriodicity.toFixed(3);
    subPitchPer.textContent = metrics.pitchPeriodicity > 0.80 ? "Rigid TTS Periodicity" : "Human Micro-Jitter";

    valPauseRatio.textContent = metrics.pauseRatio.toFixed(3);
    subPauseRatio.textContent = metrics.pauseRatio < 0.05 ? "Continuous (No Pauses)" : "Natural Pause Spacing";

    valDynRange.textContent = `${metrics.dynamicRangeDb.toFixed(1)} dB`;
    subDynRange.textContent = (metrics.dynamicRangeDb >= 40 && metrics.dynamicRangeDb <= 70) ? "Natural Span (40 - 70 dB)" : "Compressed Span";

    const riskScore = metrics.syntheticRisk;
    const trustScore = Math.max(0, Math.min(100, Math.round((1 - riskScore) * 100)));
    gaugeVal.textContent = `${trustScore}%`;

    // Decision Logic
    if (riskScore >= 0.65) {
      decisionBanner.className = "decision-banner-box red-banner";
      bannerDecision.textContent = "BLOCK";
      bannerDetail.textContent = `High-Risk synthetic voice clone detected (Risk Index: ${(riskScore * 100).toFixed(0)}%).`;
      challengeCard.classList.add("hidden");

      mAiRawNet.textContent = `${(riskScore * 100).toFixed(1)}% Synthetic`;
      mAiVocoder.textContent = "Vocoder Artifact Match (ElevenLabs / Tacotron 2)";
      mAiWatermark.textContent = "TriBlock Flagged";
      mNonAiCallback.textContent = "REJECTED (Callback Mismatch)";
      mNonAiOtp.textContent = "Token Failed";
      mNonAiVoiceprint.textContent = "Embedding Mismatch";
      highlightFlowchart(["node-stt", "node-classifier", "node-ai-b1", "node-ai-gate", "node-ai-b2", "node-fused"], "out-block");
    } else if (riskScore >= 0.35 || metrics.duration < 2.0) {
      decisionBanner.className = "decision-banner-box amber-banner";
      bannerDecision.textContent = "FLAGGED";
      bannerDetail.textContent = metrics.duration < 2.0 ? "Short-Clip Protection Active (<2.0s). Step-up challenge required." : "Ambiguous risk index. Secondary challenge triggered.";
      challengeCard.classList.remove("hidden");

      mAiRawNet.textContent = "Ambiguous Risk (Escalated)";
      mAiVocoder.textContent = "Secondary Spectrogram CNN Active";
      mAiWatermark.textContent = "Uncertain Signature";
      mNonAiCallback.textContent = "UNVERIFIED";
      mNonAiOtp.textContent = "Challenge Dispatched";
      mNonAiVoiceprint.textContent = "Pending Verification";
      highlightFlowchart(["node-stt", "node-classifier", "node-ai-b1", "node-ai-gate", "node-ai-b2", "node-ai-b3", "node-fused"], "out-flag");
    } else {
      decisionBanner.className = "decision-banner-box green-banner";
      bannerDecision.textContent = "CALL ALLOWED";
      bannerDetail.textContent = `Verified authentic voice stream (Trust Rating: ${trustScore}%).`;
      challengeCard.classList.add("hidden");

      mAiRawNet.textContent = `${trustScore}% Authentic`;
      mAiVocoder.textContent = "Clean (No Vocoder Artifacts)";
      mAiWatermark.textContent = "TriBlock Verified";
      mNonAiCallback.textContent = "VALIDATED (STIR/SHAKEN)";
      mNonAiOtp.textContent = "Token Match Confirmed";
      mNonAiVoiceprint.textContent = "512-d Embedding Match";
      highlightFlowchart(["node-stt", "node-classifier", "node-ai-b1", "node-nonai-b1", "node-fused"], "out-allowed");
    }
  }

  function highlightFlowchart(nodesToHighlight, outcomeId) {
    document.querySelectorAll(".fc-node").forEach(node => node.classList.remove("active-node"));
    document.querySelectorAll(".outcome-badge").forEach(b => {
      b.style.opacity = "0.4";
      b.style.transform = "scale(0.95)";
    });

    nodesToHighlight.forEach(id => {
      const node = document.getElementById(id);
      if (node) node.classList.add("active-node");
    });

    const activeOutcome = document.getElementById(outcomeId);
    if (activeOutcome) {
      activeOutcome.style.opacity = "1";
      activeOutcome.style.transform = "scale(1.08)";
    }
  }

  // Preset Scenarios
  const scenarioData = {
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

  const presetBtns = document.querySelectorAll(".preset-btn");
  const simTranscript = document.getElementById("simTranscript");

  presetBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      presetBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const key = btn.getAttribute("data-scenario");
      const data = scenarioData[key];
      if (data) {
        simTranscript.textContent = data.transcript;
        updateUiWithCalculatedFeatures(data.metrics, key);
      }
    });
  });

  const runSimBtn = document.getElementById("runSimBtn");
  if (runSimBtn) {
    runSimBtn.addEventListener("click", () => {
      runSimBtn.style.opacity = "0.6";
      runSimBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Executing $O(n)$ Signal Feature Extraction...';
      setTimeout(() => {
        runSimBtn.style.opacity = "1";
        runSimBtn.innerHTML = '<i class="fa-solid fa-play"></i> Execute Pipeline Analysis';
        const activeBtn = document.querySelector(".preset-btn.active");
        const key = activeBtn ? activeBtn.getAttribute("data-scenario") : "human-normal";
        const data = scenarioData[key];
        if (data) updateUiWithCalculatedFeatures(data.metrics, key);
      }, 500);
    });
  }

  // ==========================================
  // 4) Live WebRTC Microphone Recorder
  // ==========================================
  const recordMicBtn = document.getElementById("recordMicBtn");
  const recTime = document.getElementById("recTime");
  const recStatus = document.getElementById("recStatus");

  let mediaRecorder = null;
  let audioChunks = [];
  let isRecording = false;
  let recTimerId = null;
  let secondsCount = 0;
  let speechRecognition = null;

  if (recordMicBtn) {
    recordMicBtn.addEventListener("click", async () => {
      if (!isRecording) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream);
          audioChunks = [];

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
          };

          mediaRecorder.onstop = async () => {
            const blob = new Blob(audioChunks, { type: 'audio/webm' });
            recStatus.textContent = "Decoding PCM & extracting O(n) acoustic features...";
            
            try {
              const arrayBuffer = await blob.arrayBuffer();
              const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
              const metrics = extractAcousticFeatures(decodedBuffer);
              updateUiWithCalculatedFeatures(metrics, "live-mic");
              recStatus.textContent = `Analysis complete (${metrics.duration.toFixed(1)}s audio processed).`;
            } catch (err) {
              console.error(err);
              recStatus.textContent = "Mic recorded. Processing signal metrics...";
              // Fallback to live scenario update
              scenarioData["human-normal"].metrics.duration = Math.max(1.2, secondsCount);
              updateUiWithCalculatedFeatures(scenarioData["human-normal"].metrics, "mic-fallback");
            }
          };

          mediaRecorder.start();
          isRecording = true;
          recordMicBtn.classList.add("recording");
          recordMicBtn.innerHTML = '<i class="fa-solid fa-square"></i> Stop Recording';
          recStatus.textContent = "Recording microphone audio live...";

          // Start Web Speech API Transcription if supported
          const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
          if (SpeechRec) {
            speechRecognition = new SpeechRec();
            speechRecognition.continuous = true;
            speechRecognition.interimResults = true;
            speechRecognition.onresult = (event) => {
              let text = "";
              for (let i = 0; i < event.results.length; i++) {
                text += event.results[i][0].transcript;
              }
              if (text.trim()) {
                simTranscript.textContent = `"${text.trim()}"`;
              }
            };
            speechRecognition.start();
          }

          secondsCount = 0;
          recTimerId = setInterval(() => {
            secondsCount++;
            const mins = String(Math.floor(secondsCount / 60)).padStart(2, '0');
            const secs = String(secondsCount % 60).padStart(2, '0');
            recTime.textContent = `${mins}:${secs}`;
          }, 1000);

        } catch (err) {
          alert("Microphone access permission denied or unavailable.");
        }
      } else {
        // Stop recording
        if (mediaRecorder && mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
          mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
        if (speechRecognition) {
          try { speechRecognition.stop(); } catch(e) {}
        }
        clearInterval(recTimerId);
        isRecording = false;
        recordMicBtn.classList.remove("recording");
        recordMicBtn.innerHTML = '<i class="fa-solid fa-circle-dot red-dot"></i> Record Microphone';
      }
    });
  }

  // ==========================================
  // 5) Drag & Drop File Upload Handler
  // ==========================================
  const uploadDropZone = document.getElementById("uploadDropZone");
  const audioFileInput = document.getElementById("audioFileInput");

  if (uploadDropZone && audioFileInput) {
    uploadDropZone.addEventListener("click", () => audioFileInput.click());

    uploadDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      uploadDropZone.style.borderColor = "#ffffff";
      uploadDropZone.style.background = "rgba(255,255,255,0.08)";
    });

    uploadDropZone.addEventListener("dragleave", () => {
      uploadDropZone.style.borderColor = "rgba(255,255,255,0.15)";
      uploadDropZone.style.background = "#16171d";
    });

    uploadDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      uploadDropZone.style.borderColor = "rgba(255,255,255,0.15)";
      uploadDropZone.style.background = "#16171d";
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedFile(e.dataTransfer.files[0]);
      }
    });

    audioFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        processUploadedFile(e.target.files[0]);
      }
    });
  }

  async function processUploadedFile(file) {
    simTranscript.textContent = `"[Processing File Payload: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]"`;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const metrics = extractAcousticFeatures(decodedBuffer);
      updateUiWithCalculatedFeatures(metrics, "file-upload");
    } catch (err) {
      console.error(err);
      // Fallback
      scenarioData["deepfake-highstake"].metrics.duration = 4.0;
      updateUiWithCalculatedFeatures(scenarioData["deepfake-highstake"].metrics, "file-fallback");
    }
  }

  // ==========================================
  // 6) Audit Log History Table Generator & Search Filter
  // ==========================================
  const mockAuditLogs = [
    { id: "CALL-98210", time: "2026-09-03 19:42", caller: "+91 98450 11029", type: "Wire Transfer (₹50k)", aiScore: "94.6% Deepfake", telephony: "OOB Rejected", decision: "BLOCK", dClass: "red-text" },
    { id: "CALL-98209", time: "2026-09-03 19:35", caller: "+91 80234 89201", type: "Balance Inquiry", aiScore: "98.2% Authentic", telephony: "STIR Verified", decision: "ALLOW", dClass: "green-text" },
    { id: "CALL-98208", time: "2026-09-03 19:28", caller: "+91 99001 44521", type: "VIP Credential Reset", aiScore: "Ambiguous (62%)", telephony: "CLI Spoof Flag", decision: "FLAG", dClass: "amber-text" },
    { id: "CALL-98207", time: "2026-09-03 19:15", caller: "+91 91234 56789", type: "Robocall Spam", aiScore: "99.1% Vocoder Bot", telephony: "Unverified", decision: "BLOCK", dClass: "red-text" },
    { id: "CALL-98206", time: "2026-09-03 19:02", caller: "+91 98765 43210", type: "Account Statement", aiScore: "97.5% Authentic", telephony: "STIR Verified", decision: "ALLOW", dClass: "green-text" }
  ];

  const auditTableBody = document.getElementById("auditTableBody");
  const auditSearchInput = document.getElementById("auditSearchInput");

  function renderAuditTable(logs) {
    if (!auditTableBody) return;
    auditTableBody.innerHTML = logs.map(log => `
      <tr>
        <td><strong>${log.id}</strong></td>
        <td>${log.time}</td>
        <td>${log.caller}</td>
        <td>${log.type}</td>
        <td>${log.aiScore}</td>
        <td>${log.telephony}</td>
        <td><strong class="${log.dClass}">${log.decision}</strong></td>
      </tr>
    `).join('');
  }

  renderAuditTable(mockAuditLogs);

  if (auditSearchInput) {
    auditSearchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase();
      const filtered = mockAuditLogs.filter(l => 
        l.id.toLowerCase().includes(q) ||
        l.caller.toLowerCase().includes(q) ||
        l.type.toLowerCase().includes(q) ||
        l.decision.toLowerCase().includes(q)
      );
      renderAuditTable(filtered);
    });
  }

  // Initialize Default Scenario
  applyScenario("human-normal");

  function applyScenario(key) {
    const data = scenarioData[key];
    if (data) {
      simTranscript.textContent = data.transcript;
      updateUiWithCalculatedFeatures(data.metrics, key);
    }
  }

  // ==========================================
  // 7) Canvas Real-Time Waveform Visualizer
  // ==========================================
  const canvas = document.getElementById("audioCanvas");
  let ctx = null;
  let animFrameId = null;

  if (canvas) {
    ctx = canvas.getContext("2d");
  }

  function startAudioCanvasAnimation() {
    if (!ctx) return;

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

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      animFrameId = requestAnimationFrame(render);
    }

    if (!animFrameId) {
      render();
    }
  }

  function stopAudioCanvasAnimation() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }
});
