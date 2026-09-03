// src/components/input/FileUpload.jsx
import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';
import { extractAcousticFeatures } from '../../mock/mockApi';

export default function FileUpload({ onAudioAnalyzed, setTranscript }) {
  const inputRef = useRef(null);

  const processFile = async (file) => {
    if (!file) return;
    setTranscript(`"[Processing File Payload: ${file.name} (${(file.size / 1024).toFixed(1)} KB)]"`);
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await file.arrayBuffer();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer);
      const features = extractAcousticFeatures(decoded);
      onAudioAnalyzed(features);
    } catch (err) {
      console.error(err);
      alert("Failed to decode audio file. Please upload a valid MP3, WAV, or WebM audio file.");
    }
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          processFile(e.dataTransfer.files[0]);
        }
      }}
      className="bg-[#16171d] border-2 border-dashed border-white/15 rounded-xl p-5 text-center cursor-pointer hover:border-white hover:bg-white/5 transition-all"
    >
      <input
        type="file"
        ref={inputRef}
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        accept="audio/*"
        className="hidden"
      />
      <UploadCloud size={24} className="mx-auto text-zinc-400 mb-1.5" />
      <p className="text-xs text-zinc-200 font-medium">Click or Drag &amp; Drop Audio File</p>
      <span className="text-[10px] text-zinc-500 mt-1 block">Supports .wav, .mp3, .m4a, .webm, .ogg</span>
    </div>
  );
}
