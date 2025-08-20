import { useEffect, useRef, useState, useCallback } from "react";

export function useWebSocket(meetingId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [canRecord, setCanRecord] = useState(false);

  const [latency, setLatency] = useState<number | null>(null);
  const pingTimestamp = useRef<number | null>(null);
  const pongTimeout = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef<number>(0);
  const MAX_RECONNECT_ATTEMPTS = 10;
  
  const isCleaningUpRef = useRef<boolean>(false);
  
  const setPongTimeout = () => {
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    pongTimeout.current = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        setStatus("disconnected");
      }
    }, 60000);
  };

  const clearAllTimers = () => {
    if (pongTimeout.current) clearTimeout(pongTimeout.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
  };

  const sendPing = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isCleaningUpRef.current) {
      pingTimestamp.current = Date.now();
      wsRef.current.send(JSON.stringify({ type: "ping" }));
      setPongTimeout();
    }
  };

  const reconnect = useCallback(() => {
    if (isCleaningUpRef.current) {
      return;
    }

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn("Maximum reconnection attempts reached");
      return;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    const backoffDelay = Math.min(
      1000 * Math.pow(1.5, reconnectAttemptsRef.current),
      30000
    );
    console.log(`Attempting to reconnect in ${Math.round(backoffDelay / 1000)}s...`);
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isCleaningUpRef.current) {
        reconnectAttemptsRef.current += 1;
        initializeWebSocket();
      }
    }, backoffDelay);
  }, []);

  const initializeWebSocket = useCallback(() => {
    if (!meetingId){
      return;
    }

    if (isCleaningUpRef.current){
      return;
    } 

    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onmessage = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      
      if (wsRef.current.readyState === WebSocket.CONNECTING || 
          wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close(1000);
      }
      wsRef.current = null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (!baseUrl) {
      console.error("NEXT_PUBLIC_WS_URL not set");
      return;
    }

    if (!isCleaningUpRef.current) {
      setStatus("connecting");
    }

    const ws = new WebSocket(`${baseUrl}/ws/meetings/${meetingId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!isCleaningUpRef.current) {
        setStatus("connecting"); // transport open, waiting for app handshake
        sendPing();
        reconnectAttemptsRef.current = 0;
      }
    };

    ws.onmessage = (event) => {
      if (isCleaningUpRef.current) return;
      
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

        if (msg.type === "connection_status") {
          setStatus(msg.status);   // "connected" once backend confirms
          setCanRecord(msg.canRecord);
          return;
        }
              
        if (msg.type === "message") {
          console.log(`Message from meeting ${meetingId}: ${msg.content}`);
        }
      } catch (error) {
        // ignore non-JSON messages
        console.log("Received non-JSON message:", event.data);
      }
    };

    ws.onclose = (event) => {
      console.log(`WebSocket closed with code: ${event.code}`);
      
      if (!isCleaningUpRef.current) {
        setStatus("disconnected");
        clearAllTimers();

        // Only reconnect on unexpected closures
        if (event.code !== 1000) {
          reconnect();
        }
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      if (!isCleaningUpRef.current) {
        setStatus("disconnected");
        clearAllTimers();
      }
    };
  }, [meetingId, reconnect]);

  // Set up ping interval when connected
  useEffect(() => {
    if (status !== "connected" || isCleaningUpRef.current) return;
    
    intervalRef.current = setInterval(sendPing, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [status]);

  // Main effect for WebSocket lifecycle
  useEffect(() => {
    isCleaningUpRef.current = false;
    initializeWebSocket();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && 
          status === "disconnected" && 
          !isCleaningUpRef.current) {
        reconnectAttemptsRef.current = 0;
        initializeWebSocket();
      }
    };

    const handleOnline = () => {
      if (status === "disconnected" && !isCleaningUpRef.current) {
        reconnectAttemptsRef.current = 0;
        initializeWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      isCleaningUpRef.current = true;
      
      // Clean up event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      
      // Clean up WebSocket
      if (wsRef.current) {
        wsRef.current.onopen = null;
        wsRef.current.onmessage = null;
        wsRef.current.onclose = null;
        wsRef.current.onerror = null;
        
        if (wsRef.current.readyState === WebSocket.CONNECTING || 
            wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000);
        }
        wsRef.current = null;
      }
      
      // Clear all timers
      clearAllTimers();
    };
  }, [meetingId]); 

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isCleaningUpRef.current) {
      if (message.type === "ping") {
        sendPing();
      } else {
        wsRef.current.send(JSON.stringify(message));
      }
    } else {
      console.warn("WebSocket not open");
    }
  }, []);

  const sendBinary = useCallback((data: ArrayBuffer) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !isCleaningUpRef.current) {
      wsRef.current.send(data);
    } else {
      console.warn("WebSocket not open for binary data");
    }
  }, []);

  const manualReconnect = useCallback(() => {
    reconnectAttemptsRef.current = 0;
    initializeWebSocket();
  }, [initializeWebSocket]);

  return { 
    status, 
    sendMessage, 
    sendBinary, 
    latency, 
    lastMessage, 
    canRecord,
    reconnect: manualReconnect 
  };
}