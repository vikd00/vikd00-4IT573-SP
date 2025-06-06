import { Hono } from "hono";
import * as userController from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = new Hono();

router.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const user = await userController.createUser(body);
    return c.json(user, 201);
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

router.post("/login", async (c) => {
  try {
    const body = await c.req.json();
    const result = await userController.loginUser(body);
    return c.json(result);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "AUTH_FAILED",
          message: error.message,
          details: {},
        },
      },
      401
    );
  }
});

router.get("/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const user = await userController.getUserById(userId);
    if (!user) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "User not found",
            details: {},
          },
        },
        404
      );
    }
    return c.json(user);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Internal server error",
          details: {},
        },
      },
      500
    );
  }
});

router.put("/profile", authMiddleware, async (c) => {
  try {
    const userId = c.get("userId");
    const body = await c.req.json();
    const user = await userController.updateUser(userId, body);
    return c.json(user);
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
