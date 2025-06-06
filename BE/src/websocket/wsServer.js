import { createNodeWebSocket } from "@hono/node-ws";
import jwt from "jsonwebtoken";
import { app, upgradeWebSocket } from "../app.js";

const allSockets = new Set();
const anonymousSockets = new Set();
const adminSockets = new Set();

function authenticateWebSocket(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    return null;
  }
}

export const createWebSocketHandler = () => {
  return upgradeWebSocket((c) => {
    const token =
      c.req.query("token") ||
      c.req.header("authorization")?.replace("Bearer ", "");

    const decoded = token ? authenticateWebSocket(token) : null;
    const isAnonymous = !token || !decoded;

    return {
      onOpen: (ev, ws) => {
        allSockets.add(ws);

        if (isAnonymous) {
          anonymousSockets.add(ws);
          ws.isAnonymous = true;
          console.log("Anonymous WebSocket connected");
        } else {
          ws.userId = decoded.userId;
          ws.isAdmin = decoded.role === "admin";
          ws.userRole = decoded.role;

          if (ws.isAdmin) {
            adminSockets.add(ws);
            console.log(`Admin WebSocket connected: ${ws.userId}`);
          } else {
            console.log(`User WebSocket connected: ${ws.userId}`);
          }
        }
      },
      onClose: (evt, ws) => {
        allSockets.delete(ws);

        if (ws.isAnonymous) {
          anonymousSockets.delete(ws);
          console.log("Anonymous WebSocket disconnected");
        } else if (ws.isAdmin) {
          adminSockets.delete(ws);
          console.log(`Admin WebSocket disconnected: ${ws.userId}`);
        } else {
          console.log(`User WebSocket disconnected: ${ws.userId}`);
        }
      },
      onMessage: async (evt, ws) => {
        try {
          const message = JSON.parse(evt.data);

          if (ws.isAnonymous) {
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

          console.log(
            "WebSocket message received:",
            message.type,
            "from user:",
            ws.userId
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
    };
  });
};

export function sendToAll(payload) {
  const message = JSON.stringify(payload);

  for (const ws of allSockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }

  const authenticatedCount = allSockets.size - anonymousSockets.size;
  const anonymousCount = anonymousSockets.size;
  console.log(
    `Sent message to ${allSockets.size} connected sockets (${authenticatedCount} authenticated, ${anonymousCount} anonymous)`
  );
}

export function sendToAdmins(eventType, data) {
  if (adminSockets.size === 0) {
    console.log(`No admin connections for ${eventType} notification`);
    return;
  }

  const message = JSON.stringify({
    type: "adminNotification",
    data: {
      type: eventType,
      ...data,
    },
    timestamp: new Date().toISOString(),
  });

  for (const ws of adminSockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }

  console.log(`Sent ${eventType} notification to ${adminSockets.size} admins`);
}

export function sendToUser(userId, payload) {
  if (!payload) return;

  const message = JSON.stringify(payload);
  let sentCount = 0;

  for (const ws of allSockets) {
    if (ws.userId === userId && ws.readyState === ws.OPEN) {
      ws.send(message);
      sentCount++;
    }
  }

  console.log(`Sent message to user ${userId} (${sentCount} connections)`);
}

export function sendDashboardMetrics(metrics) {
  if (adminSockets.size === 0) {
    console.log("No admin connections for dashboard metrics");
    return;
  }

  const message = JSON.stringify({
    type: "dashboardMetrics",
    data: metrics,
    timestamp: new Date().toISOString(),
  });

  for (const ws of adminSockets) {
    if (ws.readyState === ws.OPEN) {
      ws.send(message);
    }
  }

  console.log(`Sent dashboard metrics to ${adminSockets.size} admins`);
}
