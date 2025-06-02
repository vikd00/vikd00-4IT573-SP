import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { migrate } from "drizzle-orm/libsql/migrator";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as schema from "./schema.js";

// Initialize database connection
const client = createClient({
  url: process.env.DATABASE_URL || "file:./db.sqlite",
});

export const db = drizzle(client, { schema });

// Function to run migrations
export async function runMigrations() {
  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("Migrations completed");
}

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

// Product operations
export async function createProduct(productData) {
  const result = await db.insert(schema.products).values(productData);
  return getProductById(result.lastInsertRowid);
}

export async function getAllProducts(includeInactive = false) {
  let query = db.select().from(schema.products);
  
  if (!includeInactive) {
    query = query.where(eq(schema.products.active, true));
  }
  
  return await query.all();
}

export async function getProductById(id) {
  return await db
    .select()
    .from(schema.products)
    .where(eq(schema.products.id, id))
    .get();
}

export async function updateProduct(id, updates) {
  await db
    .update(schema.products)
    .set(updates)
    .where(eq(schema.products.id, id));

  return getProductById(id);
}

// Cart operations
export async function getCartByUserId(userId) {
  // Find or create cart for user
  let cart = await db
    .select()
    .from(schema.carts)
    .where(eq(schema.carts.userId, userId))
    .get();

  if (!cart) {
    const result = await db.insert(schema.carts).values({ userId });
    cart = {
      id: Number(result.lastInsertRowid),
      userId,
      createdAt: new Date().toISOString(),
    };
  }

  // Get cart items with product details
  const cartItems = await db
    .select({
      id: schema.cartItems.id,
      productId: schema.cartItems.productId,
      quantity: schema.cartItems.quantity,
      name: schema.products.name,
      price: schema.products.price,
      imageUrl: schema.products.imageUrl,
    })
    .from(schema.cartItems)
    .leftJoin(
      schema.products,
      eq(schema.cartItems.productId, schema.products.id)
    )
    .where(eq(schema.cartItems.cartId, cart.id))
    .all();

  return {
    ...cart,
    items: cartItems,
    totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
  };
}

export async function addItemToCart(userId, { productId, quantity = 1 }) {
  // Check product exists and is active
  const product = await getProductById(productId);
  if (!product || !product.active) {
    throw new Error("Product not found or unavailable");
  }

  // Check inventory
  if (product.inventory < quantity) {
    throw new Error("Not enough inventory");
  }

  // Get or create cart
  const cart = await getCartByUserId(userId);

  // Check if product is already in cart
  const existingItem = await db
    .select()
    .from(schema.cartItems)
    .where(
      and(
        eq(schema.cartItems.cartId, cart.id),
        eq(schema.cartItems.productId, productId)
      )
    )
    .get();

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.inventory < newQuantity) {
      throw new Error("Not enough inventory");
    }

    await db
      .update(schema.cartItems)
      .set({ quantity: newQuantity })
      .where(eq(schema.cartItems.id, existingItem.id));
  } else {
    // Add new item
    await db.insert(schema.cartItems).values({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  return getCartByUserId(userId);
}

export async function updateCartItem(userId, itemId, { quantity }) {
  // Get cart
  const cart = await getCartByUserId(userId);

  // Find item
  const item = await db
    .select()
    .from(schema.cartItems)
    .where(
      and(
        eq(schema.cartItems.id, itemId),
        eq(schema.cartItems.cartId, cart.id)
      )
    )
    .get();

  if (!item) {
    throw new Error("Cart item not found");
  }

  // Check inventory
  const product = await getProductById(item.productId);
  if (product.inventory < quantity) {
    throw new Error("Not enough inventory");
  }

  // Update quantity
  await db
    .update(schema.cartItems)
    .set({ quantity })
    .where(eq(schema.cartItems.id, itemId));

  return getCartByUserId(userId);
}

export async function removeCartItem(userId, itemId) {
  // Get cart
  const cart = await getCartByUserId(userId);

  // Delete item
  await db
    .delete(schema.cartItems)
    .where(
      and(
        eq(schema.cartItems.id, itemId),
        eq(schema.cartItems.cartId, cart.id)
      )
    );

  return getCartByUserId(userId);
}

// Order operations
export async function createOrder(userId, { shippingAddress }) {
  // Get user's cart
  const cart = await getCartByUserId(userId);
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // Start transaction
  // Note: For SQLite in this example we're not using a real transaction
  // but in a production app you should

  try {
    // Create order
    const orderResult = await db.insert(schema.orders).values({
      userId,
      shippingAddress,
    });

    const orderId = Number(orderResult.lastInsertRowid);

    // Add order items
    for (const item of cart.items) {
      // Check inventory again
      const product = await getProductById(item.productId);
      if (product.inventory < item.quantity) {
        throw new Error(`Not enough inventory for ${product.name}`);
      }

      // Add order item
      await db.insert(schema.orderItems).values({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price, // Use current price
      });

      // Update inventory
      await db
        .update(schema.products)
        .set({
          inventory: product.inventory - item.quantity,
        })
        .where(eq(schema.products.id, item.productId));
    }

    // Clear cart
    await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));

    // Return the created order
    return getOrderById(orderId, userId);
  } catch (error) {
    // In a real transaction, we would rollback here
    throw error;
  }
}

export async function getUserOrders(userId) {
  return await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .all();
}

export async function getOrderById(orderId, userId = null) {
  // Build query - if userId is provided, ensure order belongs to user
  let query = db.select().from(schema.orders).where(eq(schema.orders.id, orderId));
  
  if (userId) {
    query = query.where(eq(schema.orders.userId, userId));
  }
  
  const order = await query.get();
  
  if (!order) return null;
  
  // Get order items with product details
  const orderItems = await db
    .select({
      id: schema.orderItems.id,
      productId: schema.orderItems.productId,
      quantity: schema.orderItems.quantity,
      price: schema.orderItems.price,
      name: schema.products.name,
      imageUrl: schema.products.imageUrl,
    })
    .from(schema.orderItems)
    .leftJoin(
      schema.products,
      eq(schema.orderItems.productId, schema.products.id)
    )
    .where(eq(schema.orderItems.orderId, orderId))
    .all();
    
  return {
    ...order,
    items: orderItems,
    totalItems: orderItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    ),
  };
}

export async function updateOrderStatus(orderId, status) {
  await db
    .update(schema.orders)
    .set({
      status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.orders.id, orderId));
    
  return getOrderById(orderId);
}

export async function getAllOrders() {
  return await db
    .select()
    .from(schema.orders)
    .all();
}

// Admin dashboard
export async function getAdminDashboardStats() {
  const totalOrders = await db.select().from(schema.orders).all();
  const totalUsers = await db.select().from(schema.users).all();
  const lowInventoryProducts = await db
    .select()
    .from(schema.products)
    .where(
      and(eq(schema.products.active, true), 
      schema.products.inventory < 10)
    )
    .all();
    
  // Calculate order stats
  const pendingOrders = totalOrders.filter(o => o.status === 'pending').length;
  const revenue = totalOrders.reduce((sum, order) => {
    // For a real app, we would sum order items here
    // This is simplified for this example
    return sum + (order._calculatedTotalPrice || 0);
  }, 0);
  
  return {
    totalOrders: totalOrders.length,
    pendingOrders,
    totalUsers: totalUsers.length,
    lowInventoryProducts,
    revenue,
  };
}