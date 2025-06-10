import jwt from "jsonwebtoken";
import WebSocket from "ws";

const connections = new Map();
let connectionCounter = 0;

function authenticateWebSocket(token) {
  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    console.warn("JWT verification failed:", error.message);
    return null;
  }
}

export const createWebSocketHandler = () => {
  return (c) => {
    const token =
      c.req.query("token") ||
      c.req.header("authorization")?.replace("Bearer ", "");

    const decodedToken = authenticateWebSocket(token);
    const connId = `wsconn-${connectionCounter++}`;

    return {
      onOpen: (evt, ws) => {
        const connectionInfo = {
          ws,
          userId: null,
          role: null,
          isAdmin: false,
          isAnonymous: true,
          connectionId: connId,
        };

        if (decodedToken && decodedToken.userId) {
          connectionInfo.userId = decodedToken.userId;
          connectionInfo.role = decodedToken.role;
          connectionInfo.isAdmin = decodedToken.role === "admin";
          connectionInfo.isAnonymous = false;

          console.log(
            `WebSocket connected: UserID ${connectionInfo.userId}, Role ${connectionInfo.role}, Admin ${connectionInfo.isAdmin}, ConnID ${connId}`
          );
        } else {
          console.log(`WebSocket connected: Anonymous, ConnID ${connId}`);
        }

        ws.connId = connId;
        connections.set(connId, connectionInfo);

        const stats = getConnectionStats();
        console.log("Current connection stats:", stats);
      },
      onClose: (evt, ws) => {
        const closedConnId = ws.connId;

        if (connections.has(closedConnId)) {
          const connInfo = connections.get(closedConnId);
          connections.delete(closedConnId);

          console.log(
            `WebSocket disconnected: UserID ${
              connInfo.userId || "Anon"
            }, ConnID ${closedConnId}. Reason: ${evt.code} ${evt.reason}`
          );
        } else {
          console.warn(
            `WebSocket disconnected: Unknown ConnID ${closedConnId}`
          );
        }

        const stats = getConnectionStats();
        console.log("Current connection stats:", stats);
      },
      onMessage: async (evt, ws) => {
        const connInfo = connections.get(ws.connId);

        if (!connInfo) {
          console.error(
            `WebSocket message from untracked connection: ${ws.connId}`
          );
          ws.close(1011, "Untracked connection");
          return;
        }

        if (connInfo.isAnonymous) {
          ws.send(
            JSON.stringify({
              type: "error",
              error: {
                code: "WS_AUTH_REQUIRED",
                message: "Authentication required for sending messages",
                details: {},
              },
            })
          );
          return;
        }

        try {
          const message = JSON.parse(evt.data);
          console.log(
            "WebSocket message received:",
            message.type,
            "from user:",
            connInfo.userId,
            "connId:",
            connInfo.connectionId
          );

          ws.send(
            JSON.stringify({
              type: "message_received",
              success: true,
            })
          );
        } catch (error) {
          console.error("WebSocket message error:", error);
          ws.send(
            JSON.stringify({
              type: "error",
              error: {
                code: "WS_CONN_ERROR",
                message: "Invalid message format",
                details: {},
              },
            })
          );
        }
      },
      onError: (err, ws) => {
        console.error(
          "WebSocket error for connection:",
          ws.connId || "unknown",
          err
        );
      },
    };
  };
};

function getConnectionStats() {
  let totalConnections = 0;
  let anonymousConnections = 0;
  let authenticatedUserConnections = 0;
  let adminConnections = 0;
  const uniqueUserIds = new Set();

  for (const conn of connections.values()) {
    totalConnections++;

    if (conn.isAnonymous) {
      anonymousConnections++;
    } else {
      if (conn.isAdmin) {
        adminConnections++;
      } else {
        authenticatedUserConnections++;
      }

      if (conn.userId) {
        uniqueUserIds.add(conn.userId);
      }
    }
  }

  return {
    totalConnections,
    anonymousConnections,
    authenticatedUserConnections,
    adminConnections,
    distinctAuthenticatedUsers: uniqueUserIds.size,
  };
}

function sendToFilteredConnections(filterFn, payload, messageContext) {
  const message = JSON.stringify(payload);
  let sentCount = 0;

  connections.forEach((conn) => {
    if (filterFn(conn) && conn.ws.readyState === WebSocket.OPEN) {
      try {
        conn.ws.send(message);
        sentCount++;
      } catch (error) {
        console.error(
          `Failed to send message to connection ${conn.connectionId}:`,
          error
        );
      }
    }
  });

  const stats = getConnectionStats();
  console.log(
    `Sent ${messageContext} to ${sentCount} connection(s). Stats:`,
    stats
  );

  return sentCount;
}

export function sendToAll(payload) {
  return sendToFilteredConnections(
    () => true,
    payload,
    `message type ${payload.type} to ALL`
  );
}

export function sendToAdmins(eventType, data) {
  const payload = {
    type: "adminNotification",
    data: {
      type: eventType,
      timestamp: new Date().toISOString(),
      ...data,
    },
  };

  return sendToFilteredConnections(
    (conn) => conn.isAdmin && !conn.isAnonymous,
    payload,
    `admin event ${eventType}`
  );
}

export function sendToUser(userId, payload) {
  if (userId == null || userId === undefined) {
    console.warn("sendToUser called with null/undefined userId");
    return 0;
  }

  return sendToFilteredConnections(
    (conn) => conn.userId === userId && !conn.isAnonymous,
    payload,
    `message type ${payload.type} to UserID ${userId}`
  );
}

export function sendDashboardMetrics(metrics) {
  const payload = {
    type: "dashboardMetrics",
    data: metrics,
    timestamp: new Date().toISOString(),
  };

  return sendToFilteredConnections(
    (conn) => conn.isAdmin && !conn.isAnonymous,
    payload,
    "dashboard metrics"
  );
}
