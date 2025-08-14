"use client";
import { useState } from "react";

export default function CreateMeetingPage() {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleCreateMeeting = async () => {
        setLoading(true);
        setMeetingId(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            const res = await fetch(`${apiUrl}/meetings`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            setMeetingId(data.meeting_id);
        } catch (err) {
            setMeetingId("Error creating meeting");
        } finally {
            setLoading(false);
        }
    };

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
            <button
                onClick={handleCreateMeeting}
                disabled={loading}
                style={{
                    padding: "1rem 2.5rem",
                    fontSize: "1.5rem",
                    borderRadius: "2rem",
                    border: "none",
                    background: "#0070f3",
                    color: "#fff",
                    cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    transition: "background 0.2s",
                }}>
                {loading ? "Creating..." : "Create Meeting"}
            </button>
            {meetingId && (
                <div style={{ marginTop: 32, fontSize: "1.2rem", color: "#222" }}>
                    <strong>Meeting ID:</strong> {meetingId}
                </div>
            )}
        </div>
    );
}