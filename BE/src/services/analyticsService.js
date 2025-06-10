import { db } from "../config/database.js";
import { eq, gte, lte, desc } from "drizzle-orm";
import * as schema from "../models/schema.js";

export async function calcMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  try {
    const todaysOrders = await db
      .select()
      .from(schema.orders)
      .where(gte(schema.orders.createdAt, todayISO))
      .all();

    const todaysRevenue = await db
      .select({
        orderId: schema.orderItems.orderId,
        totalPrice: schema.orderItems.price,
        quantity: schema.orderItems.quantity,
      })
      .from(schema.orderItems)
      .leftJoin(schema.orders, eq(schema.orderItems.orderId, schema.orders.id))
      .where(gte(schema.orders.createdAt, todayISO))
      .all();

    const revenue = todaysRevenue.reduce(
      (sum, item) => sum + item.totalPrice * item.quantity,
      0
    );

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeUsers = await db
      .select({
        userId: schema.orders.userId,
      })
      .from(schema.orders)
      .where(gte(schema.orders.createdAt, thirtyDaysAgo.toISOString()))
      .groupBy(schema.orders.userId)
      .all();

    const lowStockProducts = await db
      .select()
      .from(schema.products)
      .where(lte(schema.products.inventory, 5))
      .all();

    const recentOrders = await db
      .select({
        id: schema.orders.id,
        userId: schema.orders.userId,
        status: schema.orders.status,
        createdAt: schema.orders.createdAt,
        username: schema.users.username,
        email: schema.users.email,
      })
      .from(schema.orders)
      .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
      .orderBy(desc(schema.orders.createdAt))
      .limit(10)
      .all();

    return {
      activeUsers: activeUsers.length,
      ordersToday: todaysOrders.length,
      revenue: revenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        inventory: p.inventory,
      })),
      recentOrders: recentOrders,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error calculating metrics:", error);
    throw error;
  }
}

export async function getLowStockProducts() {
  try {
    return await db
      .select()
      .from(schema.products)
      .where(lte(schema.products.inventory, 5))
      .all();
  } catch (error) {
    console.error("Error getting low stock products:", error);
    throw error;
  }
}

export async function getActiveUsersCount() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await db
      .select({
        userId: schema.orders.userId,
      })
      .from(schema.orders)
      .where(gte(schema.orders.createdAt, thirtyDaysAgo.toISOString()))
      .groupBy(schema.orders.userId)
      .all();

    return activeUsers.length;
  } catch (error) {
    console.error("Error getting active users count:", error);
    throw error;
  }
}
