import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";
import createWsClient from "../websocket/wsClient";

const WebSocketContext = createContext(null);

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const wsClientInstanceRef = useRef(null);
  const [wsApi, setWsApi] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    const targetWsUrl = token
      ? `ws://localhost:3003/ws?token=${encodeURIComponent(token)}`
      : "ws://localhost:3003/ws";

    let clientNeedsUpdate = false;

    if (wsClientInstanceRef.current) {
      if (wsClientInstanceRef.current.getUrl() !== targetWsUrl) {
        console.log(
          `WebSocketProvider: Token/URL changed. Disconnecting old client (${wsClientInstanceRef.current.getUrl()}).`
        );
        wsClientInstanceRef.current.disconnect(
          1000,
          "Client re-initializing due to URL change"
        );
        wsClientInstanceRef.current = null;
        clientNeedsUpdate = true;
      } else {
        if (wsApi !== wsClientInstanceRef.current) {
          console.log(
            "WebSocketProvider: Client instance is current, ensuring wsApi state sync."
          );
          setWsApi(wsClientInstanceRef.current);
        }
      }
    } else {
      clientNeedsUpdate = true;
    }

    if (clientNeedsUpdate) {
      console.log(
        `WebSocketProvider: Creating new WebSocket client for URL: ${targetWsUrl}`
      );
      const newClient = createWsClient(targetWsUrl);
      wsClientInstanceRef.current = newClient;
      setWsApi(newClient);
    }

    return () => {
      console.log(
        "WebSocketProvider: useEffect([token]) cleanup running. Current client URL (if any):",
        wsClientInstanceRef.current?.getUrl()
      );
    };
  }, [token]);

  useEffect(() => {
    const currentClientInstance = wsClientInstanceRef.current;
    return () => {
      if (currentClientInstance) {
        console.log(
          `WebSocketProvider: Component unmounting. Disconnecting client (${currentClientInstance.getUrl()}).`
        );
        currentClientInstance.disconnect(1000, "WebSocketProvider unmounted");

        if (wsClientInstanceRef.current === currentClientInstance) {
          wsClientInstanceRef.current = null;
        }
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={wsApi}>
      {children}
    </WebSocketContext.Provider>
  );
};
