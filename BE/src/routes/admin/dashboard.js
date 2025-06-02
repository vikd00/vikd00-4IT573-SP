import { Hono } from "hono";
import * as userController from "../../controllers/userController.js";
import * as productController from "../../controllers/productController.js";
import * as orderController from "../../controllers/orderController.js";
import { adminAuthMiddleware } from "../../middleware/adminAuth.js";

const router = new Hono();

// All admin routes require admin authentication
router.use("*", adminAuthMiddleware);

router.get("/", async (c) => {
  try {
    const stats = await orderController.getAdminDashboardStats();
    return c.json(stats);
  } catch (error) {
    return c.json({ 
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch dashboard stats",
        details: {}
      }
    }, 500);
  }
});

export default router;
