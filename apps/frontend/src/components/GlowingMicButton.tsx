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
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <div className="bg-blue-100 rounded-full w-full h-full flex items-center justify-center">
        {/* Placeholder for now */}
        <span className="text-blue-500">MIC</span>
      </div>
    </div>
  );
}