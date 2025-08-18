"use client";

import { useState } from "react";

interface GlowingMicButtonProps {
  isRecording?: boolean;
  onClick?: () => void;
  size?: number;
  className?: string;
}

export default function GlowingMicButton({
  isRecording = false,
  onClick,
  size = 80,
  className = ""
}: GlowingMicButtonProps) {
  return (
    <div
      className={`relative flex items-center justify-center group transition-transform duration-200
        ${isRecording ? "scale-100" : ""}
        ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >

      {/* Lower blue glow */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-full pointer-events-none z-0 opacity-100"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 80%, rgba(89,130,246,0.55) 0%, rgba(59,130,246,0.38) 60%, transparent 100%)",
          filter: "blur(12px)",
        }}
      />
  
      {/* Soft purple halo */}
      <div
        className={`absolute inset-0 rounded-full scale-160 pointer-events-none opacity-80`}
        style={{
          background: 'radial-gradient(circle, rgba(200, 181, 253, 0.9) 0%, rgba(190, 197, 254, 0.6) 30%, rgba(188, 197, 254, 0.1) 50%, transparent 70%)'
        }}
      />

      <div className="glass-card-less-depth rounded-full w-full h-full flex items-center justify-center cursor-pointer">
        <svg
          viewBox="0 0 90 90"
          className={`w-1/2 h-1/2 transition-colors duration-250
          ${isRecording ? "text-white" : "text-white/60 group-hover:text-white"}`}
        >
          <path d="M45 70.968c-16.013 0-29.042-13.028-29.042-29.042 0-1.712 1.388-3.099 3.099-3.099 1.712 0 3.099 1.388 3.099 3.099C22.157 54.522 32.404 64.77 45 64.77c12.595 0 22.843-10.248 22.843-22.843 0-1.712 1.387-3.099 3.099-3.099s3.099 1.388 3.099 3.099C74.042 57.94 61.013 70.968 45 70.968z" fill="currentColor" />
          <path d="M45 60.738c-10.285 0-18.7-8.415-18.7-18.7V18.7C26.3 8.415 34.715 0 45 0s18.7 8.415 18.7 18.7v23.337c0 10.285-8.415 18.701-18.7 18.701z" fill="currentColor" />
          <path d="M45 89.213c-1.712 0-3.099-1.387-3.099-3.099V68.655c0-1.712 1.388-3.099 3.099-3.099s3.099 1.387 3.099 3.099v17.459c0 1.712-1.387 3.099-3.099 3.099z" fill="currentColor" />
          <path d="M55.451 90H34.549c-1.712 0-3.099-1.387-3.099-3.099s1.388-3.099 3.099-3.099h20.901c1.712 0 3.099 1.387 3.099 3.099S57.163 90 55.451 90z" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}