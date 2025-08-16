"use client";
import { useRef, useState } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function AudioChunkRecorder({ meetingId }: { meetingId: string }) {
    const [isRecording, setIsRecording] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef(false);
    const { status, sendBinary } = useWebSocket(meetingId);

    const startRecording = async () => {

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: 16000,    // 16kHz
                    channelCount: 1,      // Mono audio (single channel)
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const audioContext = new AudioContext({ sampleRate: 16000 });

            await audioContext.audioWorklet.addModule('/audio-worklet.js');

            const source = audioContext.createMediaStreamSource(stream);

            const workletNode = new AudioWorkletNode(audioContext, 'audio-capture-processor');

            let chunkCount = 0;
            let totalSamples = 0;
            let startTime = Date.now();

            workletNode.port.onmessage = (event) => {

                const int16Array = event.data;
                chunkCount++;
                totalSamples += int16Array.length;

                if (!isRecordingRef.current) return;
                if (status === "connected") {
                    console.log("Sending audio chunk to server:", int16Array.length, "samples");
                    sendBinary(int16Array.buffer);
                }
            };

            source.connect(workletNode);

            audioContextRef.current = audioContext;
            workletNodeRef.current = workletNode;
            streamRef.current = stream;

            isRecordingRef.current = true;
            setIsRecording(true);

        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    };

    const stopRecording = () => {
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        isRecordingRef.current = false;
        setIsRecording(false);
        console.log("Stopped recording");
    };

    return (
        <div style={{ 
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%"
    }}>
        <button
            onClick={isRecording ? stopRecording : startRecording}
            style={{
                padding: "0.5rem 1rem",
                fontSize: "1rem",
                borderRadius: "1.5rem",
                border: "none",
                background: isRecording ? "#ef4444" : "#22c55e",
                color: "#fff",
                cursor: "pointer",
                width: "150px", 
                textAlign: "center"
            }}
        >
            {isRecording ? "Stop Recording" : "Start Recording"}
        </button>

        <div 
            style={{ 
                marginTop: "1rem", 
                fontSize: "0.9rem", 
                color: "#666",
                height: "1.2rem", 
                opacity: isRecording ? 1 : 0,  
                transition: "opacity 0.2s",   
                textAlign: "center",
                width: "100%"
            }}
        >
            {isRecording ? "Recording continuous audio..." : ""}
        </div>
    </div>
    );
}