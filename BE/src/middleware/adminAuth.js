import { authMiddleware } from "./auth.js";

export const adminAuthMiddleware = async (c, next) => {
  await authMiddleware(c, async () => {
    const userRole = c.get("userRole");

    if (userRole !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }

    await next();
  });
};
