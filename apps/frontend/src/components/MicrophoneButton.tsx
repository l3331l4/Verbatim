"use client";
import { useState, useRef } from "react";

export default function MicrophoneButton() {
    const [isMicActive, setIsMicActive] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);

    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const rafIdRef = useRef<number | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    const logAudioLevel = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
            const val = (dataArrayRef.current[i] - 128) / 128;
            sum += val * val;
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);
        const level = Math.round(rms * 1000);
        console.log("Audio level:", level);
        rafIdRef.current = requestAnimationFrame(logAudioLevel);
    };

    const stopAudio = () => {
        stream?.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsMicActive(false);
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
        analyserRef.current = null;
        console.log("Microphone turned off");
    };

    const startAudio = async () => {
        try {
            const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setStream(userStream);
            setIsMicActive(true);
            console.log("Microphone permission granted");

            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(userStream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyserRef.current = analyser;
            source.connect(analyser);
            dataArrayRef.current = new Uint8Array(analyser.fftSize);

            logAudioLevel();
        } catch (err) {
            console.error("Microphone permission denied:", err);
            alert("Microphone access denied");
        }
    };

    const toggleMic = () => {
        if (isMicActive) {
            stopAudio();
        } else {
            startAudio();
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
