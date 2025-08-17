"use client";
import { use, useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";

import MicrophoneButton from "@/components/MicrophoneButton";
import AudioChunkRecorder from "@/components/AudioChunkRecorder";


interface MeetingPageProps {
    params: Promise<{ id: string }>;
}

interface TranscriptMessage {
    text: string;
    timestamp: string;
}

export default function MeetingPage({ params }: MeetingPageProps) {

    const { id } = use(params);
    const { status, sendMessage, lastMessage } = useWebSocket(id);
    const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (lastMessage) {
            console.log("Received WebSocket message:", lastMessage);
            try {
                const data = JSON.parse(lastMessage);
                console.log("Parsed data:", data);
                if (data.text) {
                    console.log("Found transcript text:", data.text);
                    const timestamp = new Date().toLocaleTimeString();
                    setTranscripts(prev => [
                        ...prev,
                        { text: data.text, timestamp }
                    ]);
                    setTimeout(() => {
                        if (transcriptContainerRef.current) {
                            transcriptContainerRef.current.scrollTop = transcriptContainerRef.current.scrollHeight;
                        }
                    }, 100);
                } else {
                    console.log("No text property found in message");
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message", e);
            }
        }
    }, [lastMessage]);


    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "#f9f9f9",
                padding: "2rem 1rem",
            }}>
            <div style={{ width: "100%", maxWidth: "1200px" }}>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem"
                }}>
                    {/* Meeting text */}
                    <h1 style={{
                        color: "#222",
                        margin: 0,
                        fontSize: "1.8rem"
                    }}>Meeting: {id}</h1>

                    {/* Connected or Disconnected */}
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "1rem",
                        backgroundColor: status === "connected" ? "#dcfce7" : "#fee2e2",
                        color: status === "connected" ? "#166534" : "#991b1b",
                        fontSize: "0.9rem",
                        fontWeight: 500
                    }}>
                        <span style={{
                            height: "8px",
                            width: "8px",
                            borderRadius: "50%",
                            backgroundColor: status === "connected" ? "#16a34a" : "#ef4444",
                            marginRight: "0.5rem"
                        }}></span>
                        {status === "connected" ? "Connected" : "Disconnected"}
                    </div>
                </div>
                {/* Transcript container */}
                <div
                    ref={transcriptContainerRef}
                    style={{
                        color: "#222",
                        background: "white",
                        padding: "1.5rem",
                        borderRadius: "0.75rem",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                        minHeight: "300px",
                        maxHeight: "500px",
                        overflowY: "auto",
                        marginBottom: "2rem",
                        width: "100%",
                        border: "1px solid #f3f4f6"
                    }}
                    id="transcript"
                >
                    {/* Conditional rendering for empty transcript svg and transcript goes here text */}
                    {transcripts.length === 0 ? (
                        <div style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            minHeight: "240px"
                        }}>
                            <div style={{
                                width: "48px",
                                height: "48px",
                                borderRadius: "50%",
                                backgroundColor: "#f3f4f6",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "1rem"
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                                    <line x1="12" y1="19" x2="12" y2="22"></line>
                                </svg>
                            </div>
                            <p style={{
                                color: "#666",
                                fontStyle: "italic",
                                textAlign: "center",
                                margin: 0
                            }}>
                                Transcription will appear here when you speak...
                            </p>
                        </div> 
                    ) : (
                        // Transcript list iteration, styling based on index, timestamp styling
                        transcripts.map((item, index) => (
                            <div key={index} style={{
                                marginBottom: "0.75rem",
                                padding: "0.75rem 1rem",
                                backgroundColor: index % 2 === 0 ? "#f9fafb" : "transparent",
                                borderRadius: "0.5rem"
                            }}>
                                <span style={{
                                    color: "#6b7280",
                                    fontSize: "0.8rem",
                                    fontWeight: 500
                                }}>
                                    [{item.timestamp}]
                                </span>{" "}
                                <span style={{
                                    display: "block",
                                    marginTop: "0.25rem",
                                    lineHeight: "1.5"
                                }}>{item.text}</span>
                            </div>
                        ))
                    )}
                </div>
                {/* Clear transcript button */}
                {transcripts.length > 0 && (
                    <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                        <button
                            onClick={() => setTranscripts([])}
                            style={{
                                background: "transparent",
                                color: "#6b7280",
                                border: "1px solid #d1d5db",
                                borderRadius: "0.375rem",
                                padding: "0.5rem 1rem",
                                fontSize: "0.875rem",
                                cursor: "pointer",
                                transition: "all 0.2s",
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                            Clear Transcript
                        </button>
                    </div>
                )}
            </div>
            {/* Control Section */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "1200px"
            }}>
                <MicrophoneButton />
                <br />
                <AudioChunkRecorder meetingId={id} />
                <br />
                <button
                    style={{
                        marginTop: "1rem",
                        padding: "0.75rem 2rem",
                        fontSize: "1.1rem",
                        borderRadius: "1.5rem",
                        border: "none",
                        background: status === "connected" ? "#22c55e" : "#94a3b8",
                        color: "#fff",
                        cursor: status === "connected" ? "pointer" : "default",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                        transition: "background 0.2s",
                    }}
                    onClick={() => sendMessage({ type: "ping" })}
                    disabled={status !== "connected"}
                >
                    Send Ping
                </button>
            </div>
        </div>
    );
}
