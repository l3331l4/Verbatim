import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(meetingId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [lastMessage, setLastMessage] = useState<string | null>(null);

  const [latency, setLatency] = useState<number | null>(null);
  const pingTimestamp = useRef<number | null>(null);
  const pongTimeout = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  
  const setPongTimeout = () => {
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    pongTimeout.current = setTimeout(() => setStatus("disconnected"), 60000);
  };

  const clearAllTimers = () => {
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      pingTimestamp.current = Date.now();
      wsRef.current.send(JSON.stringify({ type: "ping" }));
      setPongTimeout();
    }
  };

  const reconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("Maximum reconnection attempts reached");
      return;
    }
    if (reconnectTimeoutRef.current)
      clearTimeout(reconnectTimeoutRef.current);
    const backoffDelay = Math.min(
      1000 * Math.pow(1.5, reconnectAttemptsRef.current),
      30000
    );
    console.log(`Attempting to reconnect in ${Math.round(backoffDelay / 1000)}s...`);
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current += 1;
      initializeWebSocket();
    }, backoffDelay);
  }, []);

  const initializeWebSocket = useCallback(() => {
    if (!meetingId) return;

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_WS_URL not set");

    setStatus("connecting");
    const ws = new WebSocket(`${baseUrl}/ws/meetings/${meetingId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("connected");
      sendPing();
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        console.log("WebSocket message received:", event.data);
        setLastMessage(event.data);
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

    ws.onclose = (event) => {
      console.log(`WebSocket closed with code: ${event.code}`);
      setStatus("disconnected");
      clearAllTimers();

      // Only reconnect on unexpected closures
      if (event.code !== 1000) {
        reconnect();
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("disconnected");
      clearAllTimers();
    };
  }, [meetingId, reconnect]);

  useEffect(() => {
    if (status !== "connected") return;
    intervalRef.current = setInterval(sendPing, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [status]);

  useEffect(() => {
    initializeWebSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === "disconnected") {
        reconnectAttemptsRef.current = 0;
        initializeWebSocket();
      }
    };

    const handleOnline = () => {
      if (status === "disconnected") {
        reconnectAttemptsRef.current = 0;
        initializeWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000);
      }
      clearAllTimers();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [initializeWebSocket]);

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (message.type === "ping") sendPing();
      else wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn("WebSocket not open");
    }
  };

  const sendBinary = (data: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(data);
    } else {
      console.warn("WebSocket not open for binary data");
    }
  };

  return { status, sendMessage, sendBinary, latency, lastMessage, reconnect: () => { reconnectAttemptsRef.current = 0; initializeWebSocket() } };
}