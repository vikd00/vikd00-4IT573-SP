import { Hono } from "hono";
import * as orderController from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = new Hono();

router.use("*", authMiddleware);

router.post("/", async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();

    const order = await orderController.createOrder(userId, body);
    return c.json(order, 201);
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

router.get("/", async (c) => {
  try {
    const userId = c.get("userId");
    const orders = await orderController.getUserOrders(userId);
    return c.json(orders);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch orders",
          details: {},
        },
      },
      500
    );
  }
});

router.get("/:id", async (c) => {
  try {
    const userId = c.get("userId");
    const orderId = Number(c.req.param("id"));

    const order = await orderController.getOrderById(orderId, userId);
    if (!order) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Order not found",
            details: {},
          },
        },
        404
      );
    }

    return c.json(order);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch order",
          details: {},
        },
      },
      500
    );
  }
});

export default router;
