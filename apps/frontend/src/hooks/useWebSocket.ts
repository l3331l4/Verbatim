import { useEffect, useRef, useState } from "react";

export function useWebSocket(meetingId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  useEffect(() => {
    if (!meetingId) return;

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_WS_URL not set");

    const ws = new WebSocket(`${baseUrl}/ws/meetings/${meetingId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      console.log("Connected to server");
    };

    ws.onclose = () => {
      setStatus("disconnected");
      console.log("Disconnected from server");
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      setStatus("disconnected");
    };

    return () => {
      ws.close();
    };
  }, [meetingId]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not open");
    }
  };

  return { status, sendMessage };
}
