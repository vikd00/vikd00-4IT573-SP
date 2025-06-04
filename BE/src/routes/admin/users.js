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

// Update user information (admin can edit any user)
router.put("/:id", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));
    const updates = await c.req.json();
    
    const user = await userController.adminUpdateUser(userId, updates);
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

// Admin password reset (without knowing current password)
router.patch("/:id/password", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));
    const { password } = await c.req.json();
    
    if (!password || password.length < 6) {
      return c.json({
        error: {
          code: "INVALID_INPUT",
          message: "Password must be at least 6 characters long",
          details: {}
        }
      }, 400);
    }
    
    const user = await userController.adminUpdatePassword(userId, password);
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

// Create new user
router.post("/", async (c) => {
  try {
    const { username, password, email, firstName, lastName, role } = await c.req.json();
    
    if (!username || !password) {
      return c.json({
        error: {
          code: "INVALID_INPUT",
          message: "Username and password are required",
          details: {}
        }
      }, 400);
    }

    if (password.length < 6) {
      return c.json({
        error: {
          code: "INVALID_INPUT",
          message: "Password must be at least 6 characters long",
          details: {}
        }
      }, 400);
    }

    const userData = {
      username,
      password,
      email,
      firstName,
      lastName,
      role: role || "user"
    };

    const user = await userController.createUser(userData);
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

// Delete user
router.delete("/:id", async (c) => {
  try {
    const userId = parseInt(c.req.param("id"));
    
    if (isNaN(userId)) {
      return c.json({
        error: {
          code: "INVALID_INPUT",
          message: "Invalid user ID",
          details: {}
        }
      }, 400);
    }
    
    const result = await userController.deleteUser(userId);
    return c.json(result);
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
