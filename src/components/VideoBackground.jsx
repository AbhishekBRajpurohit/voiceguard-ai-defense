// src/components/VideoBackground.jsx
import React from 'react';

export default function VideoBackground() {
  return (
    <div className="bg-video-container">
      <video className="bg-video" autoPlay muted loop playsInline>
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260809_012548_ef22562c-c0ae-4816-ad9d-f8922af4e6a7.mp4"
          type="video/mp4"
        />
      </video>
      <div className="bg-overlay"></div>
    </div>
  );
}
