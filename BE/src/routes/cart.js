import { Hono } from "hono";
import * as cartController from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/auth.js";
import { broadcastCartUpdate } from "../websocket/wsServer.js";

const router = new Hono();

// All cart routes require authentication
router.use("*", authMiddleware);

router.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const cart = await cartController.getCartByUserId(userId);
    return c.json(cart);
  } catch (error) {
    return c.json({ 
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch cart",
        details: {}
      }
    }, 500);
  }
});

router.post("/items", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    
    const result = await cartController.addItemToCart(userId, body);
    await broadcastCartUpdate(userId);
    return c.json(result, 201);
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

router.put("/items/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = Number(c.req.param("id"));
    const body = await c.req.json();
    
    const result = await cartController.updateCartItem(userId, itemId, body);
    await broadcastCartUpdate(userId);
    return c.json(result);
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

router.delete("/items/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = Number(c.req.param("id"));
    
    const result = await cartController.removeCartItem(userId, itemId);
    await broadcastCartUpdate(userId);
    return c.json(result);
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

// Add new route to clear the entire cart
router.delete("/", async (c) => {
  try {
    const userId = c.get("userId");
    
    const result = await cartController.clearCart(userId);
    await broadcastCartUpdate(userId);
    return c.json(result);
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

export default router;
