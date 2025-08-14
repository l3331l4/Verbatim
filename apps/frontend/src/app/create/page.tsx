"use client";
import { useState } from "react";
import { createMeeting } from "../../lib/api";

export default function CreateMeetingPage() {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState<string>("");

    const handleCreateMeeting = async () => {
        setLoading(true);
        setMeetingId(null);
        try {
            const data = await createMeeting(title);
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
                <input
                type="text"
                placeholder="Enter meeting title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                style={{
                    padding: "0.75rem 1.5rem",
                    fontSize: "1.2rem",
                    borderRadius: "1rem",
                    border: "1px solid #ccc",
                    marginBottom: "1.5rem",
                    width: "300px",
                    outline: "none",
                    color: "#222"
                }}
                disabled={loading}
            />
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