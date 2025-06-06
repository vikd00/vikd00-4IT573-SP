import { db } from "../config/database.js";
import { eq, and } from "drizzle-orm";
import * as schema from "../models/schema.js";
import { getProductById } from "./productController.js";
import * as wsNotifyService from "../services/wsNotifyService.js";

export async function getCartByUserId(userId) {
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
  const product = await getProductById(productId);
  if (!product || !product.active) {
    throw new Error("Product not found or unavailable");
  }

  if (product.inventory < quantity) {
    throw new Error("Not enough inventory");
  }

  const cart = await getCartByUserId(userId);

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
    const newQuantity = existingItem.quantity + quantity;

    if (product.inventory < newQuantity) {
      throw new Error("Not enough inventory");
    }

    await db
      .update(schema.cartItems)
      .set({ quantity: newQuantity })
      .where(eq(schema.cartItems.id, existingItem.id));
  } else {
    await db.insert(schema.cartItems).values({
      cartId: cart.id,
      productId,
      quantity,
    });
  }

  const updatedCart = await getCartByUserId(userId);

  wsNotifyService.cartUpdated(userId, updatedCart);

  return updatedCart;
}

export async function updateCartItem(userId, itemId, { quantity }) {
  const cart = await getCartByUserId(userId);

  const item = await db
    .select()
    .from(schema.cartItems)
    .where(
      and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cart.id))
    )
    .get();

  if (!item) {
    throw new Error("Cart item not found");
  }

  const product = await getProductById(item.productId);

  if (product.inventory < quantity) {
    throw new Error("Not enough inventory");
  }

  await db
    .update(schema.cartItems)
    .set({ quantity })
    .where(eq(schema.cartItems.id, itemId));

  const updatedCart = await getCartByUserId(userId);

  wsNotifyService.cartUpdated(userId, updatedCart);

  return updatedCart;
}

export async function removeCartItem(userId, itemId) {
  const cart = await getCartByUserId(userId);

  await db
    .delete(schema.cartItems)
    .where(
      and(eq(schema.cartItems.id, itemId), eq(schema.cartItems.cartId, cart.id))
    );

  const updatedCart = await getCartByUserId(userId);

  wsNotifyService.cartUpdated(userId, updatedCart);

  return updatedCart;
}

export async function clearCart(userId) {
  const cart = await getCartByUserId(userId);

  await db.delete(schema.cartItems).where(eq(schema.cartItems.cartId, cart.id));

  const updatedCart = await getCartByUserId(userId);

  wsNotifyService.cartUpdated(userId, updatedCart);

  return updatedCart;
}
