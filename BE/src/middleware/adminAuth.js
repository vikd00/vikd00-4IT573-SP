import { authMiddleware } from "./auth.js";

// Admin user authentication
export const adminAuthMiddleware = async (c, next) => {
  // First run the regular auth middleware
  await authMiddleware(c, async () => {
    // Then check if user has admin role
    const userRole = c.get("userRole");
    
    if (userRole !== "admin") {
      return c.json({ error: "Forbidden: Admin access required" }, 403);
    }
    
    await next();
  });
};
