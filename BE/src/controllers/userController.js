import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import * as schema from "../models/schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function createUser({
  username,
  password,
  email,
  firstName,
  lastName,
  role = "user",
}) {
  const existingUser = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  if (existingUser) {
    throw new Error("Username already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.insert(schema.users).values({
    username,
    passwordHash,
    email,
    firstName,
    lastName,
    role,
  });

  return getUserById(result.lastInsertRowid);
}

export async function loginUser({ username, password }) {
  const user = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .get();

  if (!user) {
    throw new Error("Invalid credentials");
  }

  if (!user.active) {
    throw new Error("Account is deactivated. Please contact support.");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

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
  delete updates.role;

  if (updates.password) {
    if (updates.currentPassword) {
      const user = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, id))
        .get();

      if (!user) {
        throw new Error("User not found");
      }

      const passwordMatch = await bcrypt.compare(
        updates.currentPassword,
        user.passwordHash
      );
      if (!passwordMatch) {
        throw new Error("Current password is incorrect");
      }
    }

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

export async function setUserActiveStatus(userId, active) {
  await db
    .update(schema.users)
    .set({ active })
    .where(eq(schema.users.id, userId));

  return getUserById(userId);
}

export async function updateUserRole(userId, role) {
  if (!["user", "admin"].includes(role)) {
    throw new Error("Invalid role. Must be 'user' or 'admin'");
  }

  await db
    .update(schema.users)
    .set({ role })
    .where(eq(schema.users.id, userId));

  return getUserById(userId);
}

export async function adminUpdateUser(id, updates) {
  if (updates.role && !["user", "admin"].includes(updates.role)) {
    throw new Error("Invalid role. Must be 'user' or 'admin'");
  }

  delete updates.password;
  delete updates.currentPassword;
  delete updates.passwordHash;

  await db.update(schema.users).set(updates).where(eq(schema.users.id, id));

  return getUserById(id);
}

export async function adminUpdatePassword(userId, newPassword) {
  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, userId));

  return getUserById(userId);
}

export async function deleteUser(id) {
  const user = await getUserById(id);
  if (!user) {
    throw new Error("User not found");
  }

  await db.delete(schema.users).where(eq(schema.users.id, id));

  return { message: "User deleted successfully" };
}
