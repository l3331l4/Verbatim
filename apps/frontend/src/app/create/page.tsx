"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMeeting } from "../../lib/api";

export default function CreateMeetingPage() {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleCreateMeeting = async () => {
        if (title.trim() === "") {
            setError("Meeting title is required.");
            return;
        }
        setError(null);
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

    const handleJoinMeeting = () => {
        if (meetingId) {
            router.push(`/meeting/${meetingId}`);
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
                onChange={e => {
                    setTitle(e.target.value)
                    setError(null);
                }}
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
            {error && (
                <div style={{ color: "#ef4444", marginBottom: "1rem" }}>{error}</div>
            )}
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
                <div style={{
                    marginTop: 32,
                    fontSize: "1.2rem",
                    color: "#222",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}>
                    <div>
                        <strong>Meeting ID:</strong> {meetingId}
                    </div>
                    <button
                        onClick={handleJoinMeeting}
                        style={{
                            marginTop: "1rem",
                            padding: "0.75rem 2rem",
                            fontSize: "1.1rem",
                            borderRadius: "1.5rem",
                            border: "none",
                            background: "#22c55e",
                            color: "#fff",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                            transition: "background 0.2s",
                        }}
                    >
                        Join Meeting
                    </button>
                </div>
            )}
        </div>
    );
}