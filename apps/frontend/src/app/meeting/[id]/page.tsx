"use client";
import { use, useState, useEffect, useRef } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import ClientAvatars from "@/components/ClientAvatars";
import { getMeeting } from "@/lib/api";
import { usePathname } from "next/navigation";

import MicrophoneButton from "@/components/MicrophoneButton";
import AudioChunkRecorder from "@/components/AudioChunkRecorder";
import Spline from "@splinetool/react-spline";


interface MeetingPageProps {
    params: Promise<{ id: string }>;
}

interface TranscriptMessage {
    text: string;
    timestamp: string;
}

export default function MeetingPage({ params }: MeetingPageProps) {

    const { id } = use(params);
    const [meetingTitle, setMeetingTitle] = useState<string | null>(null);
    const { status, sendMessage, lastMessage, sendBinary, canRecord, clientId, clients } = useWebSocket(id);
    const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
    const transcriptContainerRef = useRef<HTMLDivElement>(null);
    const [copied, setCopied] = useState(false);
    const [transcriptMode, setTranscriptMode] = useState<"interview" | "paragraph">("interview");
    const [copiedLink, setCopiedLink] = useState(false);
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";

    useEffect(() => {
        getMeeting(id)
            .then(data => setMeetingTitle(data.title))
            .catch(() => setMeetingTitle(null));
    }, [id]);

    useEffect(() => {
        if (lastMessage) {
            try {
                const data = JSON.parse(lastMessage);

                if (data.text) {
                    const timestamp = new Date().toLocaleTimeString();
                    setTranscripts((prev) => [...prev, { text: data.text, timestamp }]);

                    setTimeout(() => {
                        if (transcriptContainerRef.current) {
                            transcriptContainerRef.current.scrollTop =
                                transcriptContainerRef.current.scrollHeight;
                        }
                    }, 100);
                }
            } catch (e) {
                console.error("Failed to parse WebSocket message", e);
            }
        }
    }, [lastMessage]);

    function getTranscriptText() {
        if (transcriptMode === "paragraph") {
            return transcripts.map(t => t.text).join(" ");
        } else {
            return transcripts.map(t => `[${t.timestamp}] ${t.text}`).join("\n");
        }
    }

    const handleCopyTranscript = () => {
        const text = getTranscriptText();
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        });
    };

    const meetingLink = typeof window !== "undefined"
        ? `${window.location.origin}/meeting/${id}`
        : `https://yourapp.com/meeting/${id}`;

    function exportTranscript() {
        const text = getTranscriptText();
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "transcript.txt";
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 0);
    }



    return (

        <main>
            <Spline
                scene="https://prod.spline.design/NK5tL3OEjwwjxb5y/scene.splinecode"
                className="fixed inset-0 w-full h-full z-0"
            />
            <div
                className="fixed bottom-0 right-0 w-48 h-18 rounded-lg z-0 pointer-events-none"
                style={{ backgroundColor: "#FFFAFA" }}
                aria-hidden="true"
            />

            <div className="min-h-screen flex items-center justify-center relative"
                style={{
                }}
            >
                {/* Glass Panel */}
                <div className="glass-card-less-depth shadow-2xl backdrop-blur-2xl w-full max-w-7xl px-8 pt-8 pb-0">
                    {/* glass-card w-full max-w-7xl p-8 */}
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="">
                            <h1 className="text-2xl font-heading font-medium text-gray-800 ">
                                {meetingTitle || "Untitled Meeting"}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2 mb-4">
                                <span className="font-body text-sm text-gray-500">
                                    Meeting Link:
                                </span>
                                <span
                                    className="font-body text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded select-all max-w-1/3 truncate"
                                    title={meetingLink} // tooltip shows full link
                                >
                                    {meetingLink}
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(meetingLink);
                                        setCopiedLink(true);
                                        setTimeout(() => setCopiedLink(false), 1200);
                                    }}
                                    className="ml-2 px-3 py-1 rounded bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition"
                                >
                                    {copiedLink ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Client avatars display */}
                            <ClientAvatars clients={clients} currentClientId={clientId} />

                            <div
                                className={`glass-effect     inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status === "connected"
                                    ? "bg-green-100 text-green-700"
                                    : status === "connecting"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-red-100 text-red-700"
                                    }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full mr-2 ${status === "connected" ? "bg-green-500" : status === "connecting" ?
                                        "bg-yellow-500 animate-pulse" : "bg-red-500"
                                        }`}
                                />
                                {status === "connected" ? "Connected" : status === "connecting" ? (
                                    <span>Connecting<span className="loading-ellipsis"></span></span>
                                ) : "Disconnected"}
                            </div>
                        </div>
                    </div>

                    {/* Transcript Section */}
                    <div
                        ref={transcriptContainerRef}
                        className="min-h-[300px] max-h-[400px] overflow-y-auto mb-6 p-6 rounded-2xl"
                    >
                        {transcripts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center min-h-[240px] text-center">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-6 h-6 text-gray-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                        <line x1="12" y1="19" x2="12" y2="22" />
                                    </svg>
                                </div>
                                <p className="text-gray-600 italic">
                                    Transcription will appear here when you speak...
                                </p>
                            </div>
                        ) : transcriptMode === "interview" ? (
                            transcripts.map((item, index) => (
                                <div
                                    key={index}
                                    className="px-4 py-3 rounded-xl mb-3 bg-white/90 border border-white/20 text-gray-800"
                                >
                                    <span className="block text-xs font-medium text-gray-500 mb-1">
                                        [{item.timestamp}]
                                    </span>
                                    <span className="block leading-relaxed">{item.text}</span>
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-3 rounded-xl mb-3 bg-white/90 border border-white/20 text-gray-800 text-base leading-relaxed">
                                {transcripts.map(t => t.text).join(" ")}
                            </div>
                        )}
                    </div>

                    {/* Clear Transcript Button */}
                    {transcripts.length > 0 && (
                        <div className="text-right mb-6">
                            <button
                                onClick={() => setTranscripts([])}
                                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-600 
                         hover:bg-gray-50 transition"
                            >
                                Clear Transcript
                            </button>
                        </div>
                    )}

                    {transcripts.length > 0 && (
                        <div className="flex justify-center gap-4 mb-4">
                            <button
                                onClick={handleCopyTranscript}
                                className="glass-card-less-depth text-white rounded px-4 py-2 transition-all duration-200 opacity-70 hover:opacity-60"
                                style={{
                                    background: "linear-gradient(135deg, #5D81E3 0%, #b09cfc 100%)",
                                    border: "none",
                                    borderRadius: "1rem",
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                {copied ? "Copied!" : "Copy Transcript"}
                            </button>
                            {/* Download Transcript Button */}
                            <button
                                onClick={exportTranscript}
                                className="glass-card-less-depth text-white rounded px-4 py-2 transition-all duration-200 opacity-70 hover:opacity-60"
                                style={{
                                    background: "linear-gradient(315deg, #9374E8 0%, #A8AAFF 100%)",
                                    border: "none",
                                    borderRadius: "1rem",
                                    padding: "0.5rem 1rem",
                                    cursor: "pointer",
                                    boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Export Transcript
                            </button>
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col items-center space-y-6">
                        {/* <MicrophoneButton /> */}
                        <AudioChunkRecorder meetingId={id} status={status} sendBinary={sendBinary} canRecord={canRecord} />
                        {/* <button
                        onClick={() => sendMessage({ type: "ping" })}
                        disabled={status !== "connected"}
                        className={`px-8 py-3 rounded-full text-white text-lg shadow-md transition ${status === "connected"
                                ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                                : "bg-gray-400 cursor-not-allowed"
                            }`}
                    >
                        Send Ping
                    </button> */}
                    </div>
                </div>
                <div className="glass-card fixed bottom-8 right-8 flex gap-4 z-50">
                    <div
                        className={`absolute top-0 bottom-0 w-11 bg-white rounded-full shadow-md transition-all duration-500 cubic-bezier(0.5, 1, 0.89, 1) 
                            ${transcriptMode === "interview"
                                ? "left-0 border-violet-400/50"
                                : "left-[60px] border-indigo-400/50"
                            } border-2`}
                    />

                    {/* Interview Style */}
                    <button
                        onClick={() => setTranscriptMode("interview")}
                        className={`p-2 rounded-full transition-all duration-500 relative z-10 data-tooltip-target="tooltip-hover" data-tooltip-trigger="hover" ${transcriptMode === "interview"
                            ? "border-transparent"
                            : "border-gray-300 hover:bg-gray-100"
                            }`}
                        aria-label="Interview Style Transcript"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-violet-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                        </svg>
                    </button>

                    {/* Paragraph Style */}
                    <button
                        onClick={() => setTranscriptMode("paragraph")}
                        className={`p-2 rounded-full transition-all duration-500 relative z-10 ${transcriptMode === "paragraph"
                            ? "border-transparent"
                            : "border-gray-300 hover:bg-gray-100"
                            }`}
                        aria-label="Paragraph Style Transcript"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-indigo-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </main >
    );
}
