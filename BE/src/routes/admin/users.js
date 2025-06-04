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

// Activate/deactivate user
router.patch("/:id/status", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));
    const { active } = await c.req.json();
    
    if (typeof active !== "boolean") {
      return c.json({
        error: {
          code: "INVALID_INPUT",
          message: "Active status must be a boolean",
          details: {}
        }
      }, 400);
    }
    
    const user = await userController.setUserActiveStatus(userId, active);
    return c.json(user);
  } catch (error) {
    return c.json({
      error: {
        code: "SERVER_ERROR",
        message: "Failed to update user status",
        details: {}
      }
    }, 500);
  }
});

// Update user role
router.patch("/:id/role", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));
    const { role } = await c.req.json();
    
    const user = await userController.updateUserRole(userId, role);
    return c.json(user);
  } catch (error) {
    return c.json({
      error: {
        code: "SERVER_ERROR",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

export default router;
