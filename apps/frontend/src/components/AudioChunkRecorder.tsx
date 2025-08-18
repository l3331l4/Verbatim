"use client";
import { useRef, useState } from "react";
import GlowingMicButton from "./GlowingMicButton";
import WaveformBars from "./WaveformBars";


interface AudioChunkRecorderProps {
    meetingId: string;
    status: "connecting" | "connected" | "disconnected";
    sendBinary: (data: ArrayBuffer) => void;
}

export default function AudioChunkRecorder({ meetingId, status, sendBinary }: AudioChunkRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isRecordingRef = useRef(false);

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

    const toggleRecording = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    return (
        <div className="flex flex-col items-center w-full">
            <div
                className={`mt-4 text-[0.9rem] mb-2 text-gray-600 h-[1.2rem] transition-opacity duration-200 text-center w-full ${isRecording ? "opacity-100" : "opacity-0"
                    }`}
            >
                {isRecording ? "Recording continuous audio..." : ""}
            </div>

            <GlowingMicButton
                isRecording={isRecording}
                onClick={toggleRecording}
                size={90}
                className="mb-2"
            />

            <div className={`flex flex-col items-center transition-opacity duration-200 ${isRecording ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
                {/* <span className="text-indigo-500/80 text-sm font-medium mb-2">Listening...</span> */}
                <div className="relative z-10 h-12">
                    <WaveformBars active={isRecording} className="h-8" />
                </div>
            </div>
        </div>
    );
}