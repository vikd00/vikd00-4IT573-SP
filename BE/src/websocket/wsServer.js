import { createNodeWebSocket } from "@hono/node-ws";
import jwt from "jsonwebtoken";
import * as cartController from "../controllers/cartController.js";

// Set of active WebSocket connections
const connections = new Set();

// Create WebSocket capabilities
const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket();

// Export the injectWebSocket for the server
export { injectWebSocket };

// WebSocket authentication helper
function authenticateWebSocket(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
  } catch (error) {
    return null;
  }
}

// Create WebSocket handler
export const createWebSocketHandler = () => {
  return upgradeWebSocket((c) => {
    return {
      onOpen: (ev, ws) => {
        connections.add(ws);
        ws.userId = null;
        ws.isAdmin = false;
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
          
          await handleWebSocketMessage(message, ws);
        } catch (error) {
          console.error("WebSocket message error:", error);
          ws.send(JSON.stringify({
            type: "error",
            error: {
              code: "WS_CONN_ERROR",
              message: "Invalid message format",
              details: {}
            }
          }));
        }
      }
    };
  });
};

// Handle different WebSocket message types
async function handleWebSocketMessage(message, ws) {
  switch (message.type) {
    case "authenticate":
      await handleAuthentication(message, ws);
      break;
      
    case "cart.update":
      await handleCartUpdate(message, ws);
      break;
      
    default:
      ws.send(JSON.stringify({
        type: "error",
        error: {
          code: "WS_CONN_ERROR",
          message: "Unknown message type",
          details: {}
        }
      }));
  }
}

// Handle WebSocket authentication
async function handleAuthentication(message, ws) {
  const decoded = authenticateWebSocket(message.token);
  
  if (!decoded) {
    ws.send(JSON.stringify({
      type: "auth_failed",
      error: {
        code: "AUTH_FAILED",
        message: "Invalid or expired token",
        details: {}
      }
    }));
    return;
  }
  
  ws.userId = decoded.userId;
  ws.isAdmin = decoded.role === "admin";
  
  ws.send(JSON.stringify({
    type: "authenticated",
    success: true,
    userId: decoded.userId,
    role: decoded.role
  }));
}

// Handle cart update from client
async function handleCartUpdate(message, ws) {
  if (!ws.userId) {
    ws.send(JSON.stringify({
      type: "error",
      error: {
        code: "AUTH_FAILED",
        message: "Authentication required",
        details: {}
      }
    }));
    return;
  }

  try {
    const { action, data } = message;
    
    switch (action) {
      case "add":
        await cartController.addItemToCart(ws.userId, data);
        break;
      case "update":
        await cartController.updateCartItem(ws.userId, data.itemId, data);
        break;
      case "remove":
        await cartController.removeCartItem(ws.userId, data.itemId);
        break;
      default:
        throw new Error("Unknown cart action");
    }
    
    await broadcastCartUpdate(ws.userId);
  } catch (error) {
    ws.send(JSON.stringify({
      type: "error",
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }));
  }
}

// Broadcasting functions
export async function broadcastCartUpdate(userId) {
  try {
    const cart = await cartController.getCartByUserId(userId);
    
    for (const ws of connections) {
      if (ws.userId === userId) {
        ws.send(JSON.stringify({
          type: "cart.sync",
          data: cart
        }));
      }
    }
  } catch (error) {
    console.error("Error broadcasting cart update:", error);
  }
}

export async function broadcastInventoryUpdate() {
  try {
    const { getAllProducts } = await import("../controllers/productController.js");
    const products = await getAllProducts();
    
    for (const ws of connections) {
      ws.send(JSON.stringify({
        type: "inventory.update",
        data: products.map(p => ({ id: p.id, inventory: p.inventory }))
      }));
    }
  } catch (error) {
    console.error("Error broadcasting inventory update:", error);
  }
}

export async function broadcastOrderStatusUpdate(order) {
  try {
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
      
      // Send to admins
      if (ws.isAdmin) {
        ws.send(JSON.stringify({
          type: "admin.notification",
          data: {
            type: "order_status_change",
            orderId: order.id,
            status: order.status,
            userId: order.userId
          }
        }));
      }
    }
  } catch (error) {
    console.error("Error broadcasting order status update:", error);
  }
}

export async function broadcastInventoryAlert(product) {
  try {
    for (const ws of connections) {
      if (ws.isAdmin) {
        ws.send(JSON.stringify({
          type: "admin.notification",
          data: {
            type: "low_inventory",
            productId: product.id,
            productName: product.name,
            inventory: product.inventory
          }
        }));
      }
    }
  } catch (error) {
    console.error("Error broadcasting inventory alert:", error);
  }
}
