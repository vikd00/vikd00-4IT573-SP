import { Hono } from "hono";
import * as analyticsService from "../../services/analyticsService.js";
import { adminAuthMiddleware } from "../../middleware/adminAuth.js";

const router = new Hono();

router.use("*", adminAuthMiddleware);

router.get("/", async (c) => {
  try {
    const stats = await analyticsService.calcMetrics();
    return c.json(stats);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch dashboard stats",
          details: {},
        },
      },
      500
    );
  }
});

router.get("/metrics", async (c) => {
  try {
    const stats = await analyticsService.calcMetrics();
    return c.json(stats);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch dashboard metrics",
          details: {},
        },
      },
      500
    );
  }
});

export default router;
