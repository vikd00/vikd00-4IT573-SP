import { Hono } from "hono";
import * as cartController from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = new Hono();

router.use("*", authMiddleware);

router.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const cart = await cartController.getCartByUserId(userId);
    return c.json(cart);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch cart",
          details: {},
        },
      },
      500
    );
  }
});

router.post("/items", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const result = await cartController.addItemToCart(userId, body);
    return c.json(result, 201);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: error.message,
          details: {},
        },
      },
      400
    );
  }
});

router.put("/items/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = Number(c.req.param("id"));
    const body = await c.req.json();

    const result = await cartController.updateCartItem(userId, itemId, body);
    return c.json(result);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: error.message,
          details: {},
        },
      },
      400
    );
  }
});

router.delete("/items/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const itemId = Number(c.req.param("id"));

    const result = await cartController.removeCartItem(userId, itemId);
    return c.json(result);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: error.message,
          details: {},
        },
      },
      400
    );
  }
});

router.delete("/", async (c) => {
  try {
    const userId = c.get("userId");

    const result = await cartController.clearCart(userId);
    return c.json(result);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "INVALID_INPUT",
          message: error.message,
          details: {},
        },
      },
      400
    );
  }
});

export default router;
