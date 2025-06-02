import { db } from "../config/database.js";
import { eq, and } from "drizzle-orm";
import * as schema from "../models/schema.js";
import { getProductById } from "./productController.js";
import { getCartByUserId } from "./cartController.js";

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

export async function getAdminDashboardStats() {
  // Get basic statistics for admin dashboard
  const totalOrders = await db.select().from(schema.orders).all();
  const totalProducts = await db.select().from(schema.products).all();
  const totalUsers = await db.select().from(schema.users).all();
  
  const ordersByStatus = {
    pending: totalOrders.filter(order => order.status === 'pending').length,
    processing: totalOrders.filter(order => order.status === 'processing').length,
    shipped: totalOrders.filter(order => order.status === 'shipped').length,
    delivered: totalOrders.filter(order => order.status === 'delivered').length
  };
  
  const lowStockProducts = totalProducts.filter(product => product.inventory < 10);
  
  return {
    totalOrders: totalOrders.length,
    totalProducts: totalProducts.length,
    totalUsers: totalUsers.length,
    ordersByStatus,
    lowStockProducts: lowStockProducts.map(p => ({
      id: p.id,
      name: p.name,
      inventory: p.inventory
    }))
  };
}
