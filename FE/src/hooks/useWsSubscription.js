import { useEffect } from "react";
import { useWebSocket } from "../contexts/WebSocketContext";

export default function useWsSubscription(eventType, callback) {
  const ws = useWebSocket();

  useEffect(() => {
    if (!ws || !eventType || !callback) {
      return;
    }

    console.log(`useWsSubscription: Subscribing to ${eventType}`);
    const unsubscribe = ws.subscribe(eventType, callback);

    return () => {
      console.log(`useWsSubscription: Unsubscribing from ${eventType}`);
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [ws, eventType, callback]);
}
