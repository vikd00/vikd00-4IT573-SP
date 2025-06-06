import React, { createContext, useContext, useMemo } from "react";
import { useAuth } from "./AuthContext";
import createWsClient from "../websocket/wsClient";

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();

  const wsApi = useMemo(() => {
    const wsUrl =
      isAuthenticated && token
        ? `ws://localhost:3003/ws?token=${encodeURIComponent(token)}`
        : `ws://localhost:3003/ws`; // Anonymous connection

    return createWsClient(wsUrl);
  }, [token, isAuthenticated]);

  return (
    <WebSocketContext.Provider value={wsApi}>
      {children}
    </WebSocketContext.Provider>
  );
};
