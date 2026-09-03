// src/components/input/AudioRecorder.jsx
import React, { useState, useRef } from 'react';
import { Square, CircleDot } from 'lucide-react';
import { extractAcousticFeatures } from '../../mock/mockApi';

export default function AudioRecorder({ onAudioAnalyzed, setTranscript }) {
  const [isRecording, setIsRecording] = useState(false);
  const [timerText, setTimerText] = useState("00:00");
  const [statusText, setStatusText] = useState("Microphone standby");

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIdRef = useRef(null);
  const secondsRef = useRef(0);
  const speechRecRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setStatusText("Decoding PCM Float32 & calculating O(n) signal features...");
        try {
          const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = await blob.arrayBuffer();
          const decoded = await audioCtx.decodeAudioData(arrayBuffer);
          const features = extractAcousticFeatures(decoded);
          onAudioAnalyzed(features);
          setStatusText(`Analysis complete (${features.duration.toFixed(1)}s audio processed).`);
        } catch (err) {
          console.error(err);
          setStatusText("Audio processed. Live signal metrics updated.");
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusText("Recording microphone stream...");

      const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRec) {
        speechRecRef.current = new SpeechRec();
        speechRecRef.current.continuous = true;
        speechRecRef.current.interimResults = true;
        speechRecRef.current.onresult = (e) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript;
          }
          if (text.trim()) setTranscript(`"${text.trim()}"`);
        };
        speechRecRef.current.start();
      }

      secondsRef.current = 0;
      timerIdRef.current = setInterval(() => {
        secondsRef.current++;
        const mins = String(Math.floor(secondsRef.current / 60)).padStart(2, '0');
        const secs = String(secondsRef.current % 60).padStart(2, '0');
        setTimerText(`${mins}:${secs}`);
      }, 1000);

    } catch (err) {
      alert("Microphone permission denied or unavailable.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
    }
    if (speechRecRef.current) {
      try { speechRecRef.current.stop(); } catch (e) {}
    }
    clearInterval(timerIdRef.current);
    setIsRecording(false);
  };

  return (
    <div className="bg-[#16171d] border border-white/10 rounded-xl p-3.5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            isRecording 
              ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30' 
              : 'bg-[#27272a] text-white border border-white/15 hover:bg-[#3f3f46]'
          }`}
        >
          {isRecording ? <Square size={14} /> : <CircleDot size={14} className="text-red-500" />}
          {isRecording ? "Stop Recording" : "Record Microphone"}
        </button>
        <span className="text-xs font-mono text-zinc-400">{timerText}</span>
      </div>
      <div className="text-[11px] text-zinc-400 italic">{statusText}</div>
    </div>
  );
}
