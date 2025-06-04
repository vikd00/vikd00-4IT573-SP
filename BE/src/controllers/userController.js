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

  // Check if user is active
  if (!user.active) {
    throw new Error("Account is deactivated. Please contact support.");
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
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      address: user.address,
      role: user.role,
      active: user.active,
    },
  };
}

export async function getUserById(id) {
  const user = await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      phone: schema.users.phone,
      address: schema.users.address,
      role: schema.users.role,
      active: schema.users.active,
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

  // Handle password change if provided
  if (updates.password) {
    // If changing password, verify current password first
    if (updates.currentPassword) {
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .get();

      if (!user) {
        throw new Error("User not found");
      }

      // Verify current password
      const passwordMatch = await bcrypt.compare(updates.currentPassword, user.passwordHash);
      if (!passwordMatch) {
        throw new Error("Current password is incorrect");
      }
    }

    // Hash new password
    updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;
    delete updates.currentPassword;
  }

  await db.update(schema.users).set(updates).where(eq(schema.users.id, id));

  return getUserById(id);
}

export async function getAllUsers() {
  return await db
    .select({
      id: schema.users.id,
      username: schema.users.username,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
      phone: schema.users.phone,
      address: schema.users.address,
      role: schema.users.role,
      active: schema.users.active,
      createdAt: schema.users.createdAt,
    })
    .from(schema.users)
    .all();
}

// Admin function to activate/deactivate users
export async function setUserActiveStatus(userId, active) {
  await db
    .update(schema.users)
    .set({ active })
    .where(eq(schema.users.id, userId));
  
  return getUserById(userId);
}

// Admin function to update user role
export async function updateUserRole(userId, role) {
  if (!['user', 'admin'].includes(role)) {
    throw new Error("Invalid role. Must be 'user' or 'admin'");
  }
  
  await db
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));
  
  return getUserById(userId);
}

// Admin function to update user password without knowing current password
export async function adminUpdatePassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await db
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId));
  
  return getUserById(userId);
}
