import { useEffect, useRef, useState } from "react";

export function useWebSocket(meetingId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  const [latency, setLatency] = useState<number | null>(null);
  const pingTimestamp = useRef<number | null>(null);
  const pongTimeout = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const setPongTimeout = () => {
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    pongTimeout.current = setTimeout(() => setStatus("disconnected"), 60000);
  };

  const clearAllTimers = () => {
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      pingTimestamp.current = Date.now();
      wsRef.current.send(JSON.stringify({ type: "ping" }));
      setPongTimeout();
    }
  };

  useEffect(() => {
    if (status !== "connected") return;
    intervalRef.current = setInterval(sendPing, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    if (!meetingId) return;
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_WS_URL not set");

    const ws = new WebSocket(`${baseUrl}/ws/meetings/${meetingId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      sendPing();
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "pong" && pingTimestamp.current) {
          const rtt = Date.now() - pingTimestamp.current;
          setLatency(rtt);
          console.log(`Ping: ${rtt}ms`);
          pingTimestamp.current = null;
          if (pongTimeout.current) clearTimeout(pongTimeout.current);
        }
        if (msg.type === "message") {
          console.log(`Message from meeting ${meetingId}: ${msg.content}`);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    ws.onclose = ws.onerror = () => {
      setStatus("disconnected");
      clearAllTimers();
    };

    return () => {
      ws.close();
      clearAllTimers();
    };
  }, [meetingId]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (message.type === "ping") sendPing();
      else wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not open");
    }
  };

  return { status, sendMessage, latency };
}