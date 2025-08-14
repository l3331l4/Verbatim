const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL not set");

interface MeetingResponse {
    meeting_id: string;
}

async function fetchWrapper<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: { "Content-Type": "application/json", ...options.headers },
            ...options,
        });

        if (!res.ok) {
            const error = await res.text();
            throw new Error(error || `API error: ${res.status}`);
        }

        return await res.json();
    } catch (err: any) {
        throw new Error(err.message || "Network error");
    }
}

export async function createMeeting(title?: string): Promise<MeetingResponse> {
    const body = JSON.stringify(title ? { title } : {});
    return fetchWrapper<MeetingResponse>("/meetings", {
        method: "POST",
        body
    });
}