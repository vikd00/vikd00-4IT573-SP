import { Hono } from "hono";
import * as userController from "../../controllers/userController.js";
import { adminAuthMiddleware } from "../../middleware/adminAuth.js";

const router = new Hono();

// All admin user routes require admin authentication
router.use("*", adminAuthMiddleware);

router.get("/", async (c) => {
  try {
    const users = await userController.getAllUsers();
    return c.json(users);
  } catch (error) {
    return c.json({ 
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch users",
        details: {}
      }
    }, 500);
  }
});

export default router;
