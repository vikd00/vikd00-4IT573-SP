import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { cors } from "hono/cors";

// Import routes
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import cartRouter from "./routes/cart.js";
import ordersRouter from "./routes/orders.js";
import adminDashboardRouter from "./routes/admin/dashboard.js";
import adminProductsRouter from "./routes/admin/products.js";
import adminOrdersRouter from "./routes/admin/orders.js";
import adminUsersRouter from "./routes/admin/users.js";

import { createNodeWebSocket } from "@hono/node-ws";
import { createWebSocketHandler } from "./websocket/wsServer.js";

export const app = new Hono();

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});

app.get("/ws", upgradeWebSocket(createWebSocketHandler()));

// Middleware
app.use(logger());
app.use(cors());
app.use("/public", serveStatic({ root: "public" }));

// API Routes
app.route("/api/users", usersRouter);
app.route("/api/products", productsRouter);
app.route("/api/cart", cartRouter);
app.route("/api/orders", ordersRouter);

// Admin Routes
app.route("/api/admin/dashboard", adminDashboardRouter);
app.route("/api/admin/products", adminProductsRouter);
app.route("/api/admin/orders", adminOrdersRouter);
app.route("/api/admin/users", adminUsersRouter);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: {
        code: "NOT_FOUND",
        message: "Endpoint not found",
        details: {},
      },
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error("Application error:", err);
  return c.json(
    {
      error: {
        code: "SERVER_ERROR",
        message: "Internal server error",
        details: {},
      },
    },
    500
  );
});
