"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createMeeting } from "../../lib/api";
import ErrorModal from "@/components/ui/ErrorModal";
import Spline from "@splinetool/react-spline";
import { ArrowRight } from "lucide-react";

export default function CreateMeetingPage() {
    const [meetingId, setMeetingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [loaded, setLoaded] = useState(false);
    const router = useRouter();
    const [showError, setShowError] = useState(false);

    function ErrorHandler() {
        const searchParams = useSearchParams();

        useEffect(() => {
            if (searchParams.get("error") === "notfound" && !showError) {
                setShowError(true);
            }
        }, [searchParams]);

        return null;
    }

    const handleCloseError = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete("error");
        router.replace(url.pathname + url.search, { scroll: false });

        setTimeout(() => {
            setShowError(false);
        }, 100);
    };

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
            await new Promise((res) => setTimeout(res, 1200));
            setMeetingId(data.meeting_id);
        } catch {
            setMeetingId("Error creating meeting");
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMeeting = () => {
        if (meetingId) {
            localStorage.setItem("lastCreatedMeetingId", meetingId);
            setTimeout(() => {
                router.push(`/meeting/${meetingId}`);
            }, 50);
        }
    };

    return (
        <div className="relative w-full min-h-screen flex items-center justify-center">
            <Suspense fallback={null}>
                <ErrorHandler />
            </Suspense>
            <>
                <ErrorModal
                    open={showError}
                    title="Meeting Not Found"
                    message="The meeting you tried to join does not exist or is no longer active."
                    onClose={handleCloseError}
                />
            </>
            <div className="absolute inset-0 blur-xl">
                <Spline
                    scene="https://prod.spline.design/NK5tL3OEjwwjxb5y/scene.splinecode"
                    onLoad={() => setLoaded(true)}
                    className={`absolute w-full h-full z-0 transition-opacity duration-2000 cubic-bezier(0.37, 0, 0.63, 1) ${loaded ? "opacity-100" : "opacity-0"}`}
                />
                <div
                    className="absolute bottom-0 right-0 w-48 h-18 rounded-lg z-10 pointer-events-none bg-[#FFFAFA]"
                    aria-hidden="true"
                />
            </div>
            <main className="relative z-20 flex min-h-screen flex-col items-center justify-center">
                <div className="glass-card p-10 md:p-14 flex flex-col items-center justify-center rounded-3xl max-w-md w-full">
                    <div className="rounded-full bg-primary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-primary border border-primary/20 font-body mb-6">
                        Create a New Meeting
                    </div>
                    <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl gradient-text font-medium mb-4 text-center">
                        Start Your Conversation
                    </h1>
                    <p className="font-body text-muted-foreground text-center mb-8 max-w-xs">
                        Give your meeting a title and join first to become the host. Once you’re in, you’ll get a unique link to invite others.
                    </p>
                    <input
                        type="text"
                        placeholder="Enter meeting title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setError(null);
                        }}
                        disabled={loading}
                        className="w-full mb-4 px-6 py-3 text-lg rounded-2xl border border-gray-300 text-gray-800 focus:outline-none font-body bg-white/80"
                    />

                    {error && (
                        <div className="text-red-500 font-medium text-base mb-4 underline decoration-2">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleCreateMeeting}
                        disabled={loading}
                        className={`glass-card font-body px-8 max-w-xs py-3 text-xl text-white rounded-2xl duration-200
                             opacity-100 hover:opacity-80 transition-colors flex items-center justify-center gap-2
                            ${loading
                                ? "bg-primary/50"
                                : "bg-primary/80 hover:bg-primary/65 cursor-pointer"
                            }`}
                    >
                        {loading ? (
                            <>
                                Creating<span className="loading-ellipsis -ml-2" />
                            </>
                        ) : (
                            <>
                                Create Meeting <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                        )}
                    </button>

                    {meetingId && (
                        <div className="mt-8 flex flex-col items-center text-lg text-gray-800 w-full">
                            <button
                                onClick={handleJoinMeeting}
                                className="glass-button rounded-xl font-body backdrop-blur-sm px-8 py-3 text-lg font-semibold text-black opacity-90 hover:opacity-80 cursor-pointer"
                            >
                                Join as Host
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}