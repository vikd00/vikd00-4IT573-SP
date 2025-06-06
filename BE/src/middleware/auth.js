import jwt from "jsonwebtoken";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import * as schema from "../models/schema.js";

export const authMiddleware = async (c, next) => {
  try {
    const authHeader = c.req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return c.json({ error: "Unauthorized: No token provided" }, 401);
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );

      const user = await db
        .select({ active: schema.users.active })
        .from(schema.users)
        .where(eq(schema.users.id, decoded.userId))
        .get();

      if (!user || !user.active) {
        return c.json({ error: "Unauthorized: Account is deactivated" }, 401);
      }

      c.set("userId", decoded.userId);
      c.set("userRole", decoded.role);

      await next();
    } catch (error) {
      return c.json({ error: "Unauthorized: Invalid token" }, 401);
    }
  } catch (error) {
    return c.json(
      { error: "Internal server error during authentication" },
      500
    );
  }
};
