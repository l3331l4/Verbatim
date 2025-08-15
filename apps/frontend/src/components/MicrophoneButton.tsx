"use client";
import { useState } from "react";

export default function MicrophoneButton() {
  const [isMicActive, setIsMicActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const toggleMic = async () => {
    if (isMicActive) {
      stream?.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsMicActive(false);
      console.log("Microphone turned off");
    } else {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(userStream);
        setIsMicActive(true);
        console.log("Microphone permission granted");
      } catch (err) {
        console.error("Microphone permission denied:", err);
        alert("Microphone access denied");
      }
    }
  };

  return (
    <button
      onClick={toggleMic}
      style={{
        padding: "0.5rem 1rem",
        fontSize: "1rem",
        borderRadius: "1.5rem",
        border: "none",
        background: isMicActive ? "#22c55e" : "#ef4444",
        color: "#fff",
        cursor: "pointer",
      }}
    >
      {isMicActive ? "Mic On" : "Mic Off"}
    </button>
  );
}
