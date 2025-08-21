"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMeeting } from "../../lib/api";
import Spline from "@splinetool/react-spline";

export default function CreateMeetingPage() {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleCreateMeeting = async () => {
        if (title.trim() === "") {
            setError("Meeting title is required!");
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
            localStorage.setItem("lastCreatedMeetingId", meetingId);
            
            // Use setTimeout to allow time for state to be saved
            // and ensure clean navigation
            setTimeout(() => {
                router.push(`/meeting/${meetingId}`);
            }, 50);
        }
    };

    return (
        <div className="relative w-full h-screen">
            {/* Spline background */}
            <Spline
                scene="https://prod.spline.design/NK5tL3OEjwwjxb5y/scene.splinecode"
                className="absolute w-full h-full z-0 blur-md"
            />

            {/* Decorative overlay */}
            <div
                className="absolute bottom-0 right-0 w-48 h-18 rounded-lg z-10 pointer-events-none bg-[#FFFAFA]"
                aria-hidden="true"
            />

            {/* Form */}
            <main className="relative z-20 flex min-h-screen flex-col items-center justify-center">
                <div className="flex min-h-screen flex-col items-center justify-center">
                    <input
                        type="text"
                        placeholder="Enter meeting title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setError(null);
                        }}
                        disabled={loading}
                        className="w-[300px] mb-6 px-6 py-3 text-lg rounded-2xl border border-gray-300 text-gray-800 focus:outline-none"
                    />

                        {error && (
                            <div className=" text-red-500 font-medium text-xl mb-4">
                                {error}
                            </div>
                        )}

                    <button
                        onClick={handleCreateMeeting}
                        disabled={loading}
                        className={`glass-card px-10 py-4 text-xl  text-white rounded-2xl duration-200 opacity-100 hover:opacity-80 transition-colors
                 ${loading
                                ? "bg-primary/70 cursor-not-allowed"
                                : "bg-primary/80 hover:bg-primary/70 cursor-pointer"
                            }`}
                    >
                        {loading ? "Creating..." : "Create Meeting"}
                    </button>

                    {meetingId && (
                        <div className="mt-8 flex flex-col items-center text-lg text-gray-800">
                            <div className="mb-6">
                                <strong>Meeting ID:</strong> {meetingId}
                            </div>
                            <button
                                onClick={handleJoinMeeting}
                                className="
                                glass-card bg-primary/80 backdrop-blur-sm px-8 rounded-2xl py-3 text-lg font-semibold text-white opacity-90 hover:opacity-80 cursor-pointer"
                            >
                                Join Meeting
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
