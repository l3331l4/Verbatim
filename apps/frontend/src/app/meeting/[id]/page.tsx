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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-200 via-gray-100 to-purple-100 p-6 relative">
      {/* Glass Panel */}
      <div className="glass-card w-full max-w-7xl p-8">
      {/* glass-card w-full max-w-7xl p-8 */}
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            Meeting: {id}
          </h1>
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              status === "connected"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full mr-2 ${
                status === "connected" ? "bg-green-500" : "bg-red-500"
              }`}
            />
            {status === "connected" ? "Connected" : "Disconnected"}
          </div>
        </div>

        {/* Transcript Section */}
        <div
          ref={transcriptContainerRef}
          className="min-h-[300px] max-h-[400px] overflow-y-auto mb-6 
                     p-6 rounded-2xl"
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
          ) : (
            transcripts.map((item, index) => (
              <div
                key={index}
                className="px-4 py-3 rounded-xl mb-3 bg-white/60 border border-white/20 text-gray-800"
              >
                <span className="block text-xs font-medium text-gray-500 mb-1">
                  [{item.timestamp}]
                </span>
                <span className="block leading-relaxed">{item.text}</span>
              </div>
            ))
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

        {/* Controls */}
        <div className="flex flex-col items-center space-y-6">
          <MicrophoneButton />
          <AudioChunkRecorder meetingId={id} />
          <button
            onClick={() => sendMessage({ type: "ping" })}
            disabled={status !== "connected"}
            className={`px-8 py-3 rounded-full text-white text-lg shadow-md transition ${
              status === "connected"
                ? "bg-green-500 hover:bg-green-600 cursor-pointer"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Send Ping
          </button>
        </div>
      </div>
    </div>
  );
}
