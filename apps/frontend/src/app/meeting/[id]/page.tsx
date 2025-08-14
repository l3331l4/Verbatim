interface MeetingPageProps {
    params: { id: string };
}

export default function MeetingPage({ params }: MeetingPageProps) {
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
                <h1 style={{ color: "#222" }}>Meeting: {params.id}</h1>
                <div style={{ color: "#222" }} id="transcript">Transcript will appear here...</div>
            </div>
        </div>
    );
}
