// src/components/VideoBackground.jsx
import React from 'react';

export default function VideoBackground() {
  return (
    <div className="bg-video-container bg-gradient-to-b from-zinc-950 via-black to-[#0a0d18]">
      <video className="bg-video opacity-40" autoPlay muted loop playsInline>
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>
      <div className="bg-overlay bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/20 via-black/60 to-black"></div>
    </div>
  );
}
