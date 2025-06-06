import { Hono } from "hono";
import * as orderController from "../../controllers/orderController.js";
import { adminAuthMiddleware } from "../../middleware/adminAuth.js";

const router = new Hono();

router.use("*", adminAuthMiddleware);

router.get("/", async (c) => {
  try {
    const orders = await orderController.getAllOrders();
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

router.put("/:id", async (c) => {
  try {
    const orderId = Number(c.req.param("id"));
    const body = await c.req.json();
    const order = await orderController.updateOrderStatus(orderId, body.status);
    return c.json(order);
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

router.delete("/:id", async (c) => {
  try {
    const orderId = Number(c.req.param("id"));
    const result = await orderController.deleteOrder(orderId);
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
