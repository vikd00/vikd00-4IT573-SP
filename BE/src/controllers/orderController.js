import { db } from "../config/database.js";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import * as schema from "../models/schema.js";
import { getProductById } from "./productController.js";
import { getCartByUserId } from "./cartController.js";
import * as wsNotifyService from "../services/wsNotifyService.js";

export async function createOrder(userId, { shippingAddress }) {
  const cart = await getCartByUserId(userId);
  if (cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  try {
    const orderResult = await db.insert(schema.orders).values({
      userId,
      shippingAddress,
    });

    const orderId = Number(orderResult.lastInsertRowid);

    for (const item of cart.items) {
      const product = await getProductById(item.productId);
      if (product.inventory < item.quantity) {
        throw new Error(`Not enough inventory for ${product.name}`);
      }
      await db.insert(schema.orderItems).values({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
      });

      const newInventory = product.inventory - item.quantity;
      await db
        .update(schema.products)
        .set({
          inventory: newInventory,
        })
        .where(eq(schema.products.id, item.productId));
      if (newInventory <= 5 && newInventory > 0) {
        wsNotifyService.lowStock({
          id: product.id,
          name: product.name,
          inventory: newInventory,
        });
      }
    }

    await db
      .delete(schema.cartItems)
      .where(eq(schema.cartItems.cartId, cart.id));
    const newOrder = await getOrderById(orderId, userId);

    wsNotifyService.orderCreated(newOrder);

    return newOrder;
  } catch (error) {
    throw error;
  }
}

export async function getUserOrders(userId) {
  const orders = await db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.userId, userId))
    .orderBy(desc(schema.orders.createdAt))
    .all();

  const ordersWithDetails = await Promise.all(
    orders.map(async (order) => {
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
        .where(eq(schema.orderItems.orderId, order.id))
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
    })
  );

  return ordersWithDetails;
}

export async function getOrderById(orderId, userId = null) {
  let query = db
    .select()
    .from(schema.orders)
    .where(eq(schema.orders.id, orderId));

  if (userId) {
    query = query.where(eq(schema.orders.userId, userId));
  }

  const order = await query.get();

  if (!order) return null;

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

  const updatedOrder = await getOrderById(orderId);

  wsNotifyService.orderStatusChanged(updatedOrder);

  return updatedOrder;
}

export async function getAllOrders() {
  const orders = await db
    .select({
      id: schema.orders.id,
      userId: schema.orders.userId,
      status: schema.orders.status,
      shippingAddress: schema.orders.shippingAddress,
      createdAt: schema.orders.createdAt,
      updatedAt: schema.orders.updatedAt,
      username: schema.users.username,
      email: schema.users.email,
      firstName: schema.users.firstName,
      lastName: schema.users.lastName,
    })
    .from(schema.orders)
    .leftJoin(schema.users, eq(schema.orders.userId, schema.users.id))
    .orderBy(desc(schema.orders.createdAt))
    .all();

  const ordersWithDetails = await Promise.all(
    orders.map(async (order) => {
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
        .where(eq(schema.orderItems.orderId, order.id))
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
    })
  );

  return ordersWithDetails;
}

export async function deleteOrder(orderId) {
  const order = await getOrderById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "cancelled") {
    throw new Error("Only cancelled orders can be deleted");
  }

  await db
    .delete(schema.orderItems)
    .where(eq(schema.orderItems.orderId, orderId));

  await db.delete(schema.orders).where(eq(schema.orders.id, orderId));

  wsNotifyService.orderDeleted(orderId);

  return { success: true, message: "Order deleted successfully" };
}
