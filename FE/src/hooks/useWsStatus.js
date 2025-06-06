import { useState, useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function useWsStatus() {
  const ws = useWebSocket();
  const [online, setOnline] = useState(ws?.connected ?? false);

  useEffect(() => {
    if (!ws) {
      setOnline(false);
      return;
    }

    setOnline(ws.connected);

    const unsubscribe = ws.subscribe("__status", (statusMessage) => {
      console.log("useWsStatus: Connection status changed", statusMessage);
      setOnline(statusMessage.connected);
    });

    return unsubscribe;
  }, [ws]);

  return online;
}
