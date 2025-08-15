"use client";
import { use } from "react";
import { useWebSocket } from "../../../hooks/useWebSocket";

interface MeetingPageProps {
    params: Promise<{ id: string }>;
}

export default function MeetingPage({ params }: MeetingPageProps) {

    const { id } = use(params);
    const { status, sendMessage } = useWebSocket(id);

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "#f9f9f9",
            }}>
            <div>
                <h1 style={{ color: "#222" }}>Meeting: {id}</h1>
                <div style={{ color: "#222" }} id="transcript">Transcript will appear here...</div>
            </div>
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
    );
}
