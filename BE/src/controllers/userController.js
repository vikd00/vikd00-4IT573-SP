import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import * as schema from "../models/schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// User operations
export async function createUser({ username, password }) {
  // Check if username already exists
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  if (existingUser) {
    throw new Error("Username already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Insert user
  const result = await db.insert(schema.users).values({
    username,
    passwordHash,
    role: "user",
  });

  return getUserById(result.lastInsertRowid);
}

export async function loginUser({ username, password }) {
  // Find user by username
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check password
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "24h" }
  );

  return {
    token,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
    },
  };
}

export async function getUserById(id) {
  const user = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .get();

  return user;
}

export async function updateUser(id, updates) {
  // Don't allow updating role through this function
  delete updates.role;

  // Hash password if it's being updated
  if (updates.password) {
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
  }

  await db.update(schema.users).set(updates).where(eq(schema.users.id, id));

  return getUserById(id);
}

export async function getAllUsers() {
  return await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      role: schema.users.role,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .all();
}
