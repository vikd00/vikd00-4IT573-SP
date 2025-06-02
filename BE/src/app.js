import { Hono } from "hono";
import { logger } from "hono/logger";
import { serveStatic } from "@hono/node-server/serve-static";
import { createNodeWebSocket } from "@hono/node-ws";
import { cors } from "hono/cors";
import * as db from "./db.js";

export const app = new Hono();

export const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({
  app,
});

app.use(logger());
app.use(cors());
app.use("/public", serveStatic({ root: "public" }));

// Set of active WebSocket connections
const connections = new Set();

// WebSocket endpoint
app.get(
  "/ws",
  upgradeWebSocket((c) => {
    return {
      onOpen: (ev, ws) => {
        connections.add(ws);
        ws.userId = null; // Will be set after authentication
        console.log("WebSocket connection opened");
      },
      onClose: (evt, ws) => {
        connections.delete(ws);
        console.log("WebSocket connection closed");
      },
      onMessage: async (evt, ws) => {
        try {
          const message = JSON.parse(evt.data);
          console.log("WebSocket message received:", message.type);
          
          switch (message.type) {
            case "authenticate":
              // In a real app, validate the token and extract user ID
              ws.userId = message.userId;
              ws.send(JSON.stringify({
                type: "authenticated",
                success: true
              }));
              break;
              
            case "cart.update":
              // Handle cart updates
              if (ws.userId) {
                await handleCartUpdate(ws.userId, message.data);
              }
              break;
              
            default:
              console.log(`Unknown message type: ${message.type}`);
          }
        } catch (error) {
          console.error("Error processing WebSocket message:", error);
          ws.send(JSON.stringify({
            type: "error",
            code: "WS_MESSAGE_ERROR",
            message: "Failed to process message"
          }));
        }
      },
    };
  })
);

// Home route
app.get("/", (c) => {
  return c.json({ message: "E-Shop API is running" });
});

// Users API
app.post("/api/users/register", async (c) => {
  try {
    const body = await c.req.json();
    const user = await db.createUser(body);
    return c.json({ message: "User registered successfully", user });
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.post("/api/users/login", async (c) => {
  try {
    const body = await c.req.json();
    const result = await db.loginUser(body);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 401);
  }
});

app.get("/api/users/profile", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const user = await db.getUserById(userId);
  if (!user) return c.json({ error: "User not found" }, 404);
  return c.json(user);
});

app.put("/api/users/profile", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  try {
    const body = await c.req.json();
    const user = await db.updateUser(userId, body);
    return c.json(user);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// Products API
app.get("/api/products", async (c) => {
  const products = await db.getAllProducts();
  return c.json(products);
});

app.get("/api/products/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const product = await db.getProductById(id);
  
  if (!product) return c.json({ error: "Product not found" }, 404);
  return c.json(product);
});

// Cart API
app.get("/api/cart", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const cart = await db.getCartByUserId(userId);
  return c.json(cart);
});

app.post("/api/cart/items", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const body = await c.req.json();
  
  try {
    const result = await db.addItemToCart(userId, body);
    await broadcastCartUpdate(userId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.put("/api/cart/items/:id", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const itemId = Number(c.req.param("id"));
  const body = await c.req.json();
  
  try {
    const result = await db.updateCartItem(userId, itemId, body);
    await broadcastCartUpdate(userId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.delete("/api/cart/items/:id", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const itemId = Number(c.req.param("id"));
  
  try {
    const result = await db.removeCartItem(userId, itemId);
    await broadcastCartUpdate(userId);
    return c.json(result);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

// Orders API
app.post("/api/orders", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const body = await c.req.json();
  
  try {
    const order = await db.createOrder(userId, body);
    await broadcastCartUpdate(userId);
    return c.json(order);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.get("/api/orders", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const orders = await db.getUserOrders(userId);
  return c.json(orders);
});

app.get("/api/orders/:id", async (c) => {
  // TODO: Implement auth middleware
  const userId = 1; // This should come from auth token
  const orderId = Number(c.req.param("id"));
  
  const order = await db.getOrderById(orderId, userId);
  if (!order) return c.json({ error: "Order not found" }, 404);
  
  return c.json(order);
});

// Admin API
app.get("/api/admin/dashboard", async (c) => {
  // TODO: Implement admin auth middleware
  const stats = await db.getAdminDashboardStats();
  return c.json(stats);
});

app.get("/api/admin/products", async (c) => {
  // TODO: Implement admin auth middleware
  const products = await db.getAllProducts(true); // Include inactive products
  return c.json(products);
});

app.post("/api/admin/products", async (c) => {
  // TODO: Implement admin auth middleware
  try {
    const body = await c.req.json();
    const product = await db.createProduct(body);
    await broadcastInventoryUpdate();
    return c.json(product);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.put("/api/admin/products/:id", async (c) => {
  // TODO: Implement admin auth middleware
  const productId = Number(c.req.param("id"));
  try {
    const body = await c.req.json();
    const product = await db.updateProduct(productId, body);
    await broadcastInventoryUpdate();
    return c.json(product);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.get("/api/admin/orders", async (c) => {
  // TODO: Implement admin auth middleware
  const orders = await db.getAllOrders();
  return c.json(orders);
});

app.put("/api/admin/orders/:id", async (c) => {
  // TODO: Implement admin auth middleware
  const orderId = Number(c.req.param("id"));
  try {
    const body = await c.req.json();
    const order = await db.updateOrderStatus(orderId, body.status);
    await broadcastOrderStatusUpdate(order);
    return c.json(order);
  } catch (error) {
    return c.json({ error: error.message }, 400);
  }
});

app.get("/api/admin/users", async (c) => {
  // TODO: Implement admin auth middleware
  const users = await db.getAllUsers();
  return c.json(users);
});

// WebSocket broadcasting functions
async function broadcastCartUpdate(userId) {
  const cart = await db.getCartByUserId(userId);
  
  for (const ws of connections) {
    if (ws.userId === userId) {
      ws.send(JSON.stringify({
        type: "cart.sync",
        data: cart
      }));
    }
  }
}

async function broadcastInventoryUpdate() {
  const products = await db.getAllProducts();
  
  for (const ws of connections) {
    ws.send(JSON.stringify({
      type: "inventory.update",
      data: products.map(p => ({ id: p.id, inventory: p.inventory }))
    }));
  }
}

async function broadcastOrderStatusUpdate(order) {
  for (const ws of connections) {
    // Send to the order owner
    if (ws.userId === order.userId) {
      ws.send(JSON.stringify({
        type: "order.status",
        data: {
          orderId: order.id,
          status: order.status
        }
      }));
    }
    
    // Send to admins (in a real app, check if user is admin)
    // This is a placeholder for now
  }
}

async function handleCartUpdate(userId, data) {
  // Handle cart update message from client
  try {
    if (data.action === "add") {
      await db.addItemToCart(userId, data);
    } else if (data.action === "update") {
      await db.updateCartItem(userId, data.itemId, data);
    } else if (data.action === "remove") {
      await db.removeCartItem(userId, data.itemId);
    }
    await broadcastCartUpdate(userId);
  } catch (error) {
    console.error("Error handling cart update:", error);
  }
}