import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import * as schema from "../models/schema.js";
import * as wsNotifyService from "../services/wsNotifyService.js";

export async function createProduct(productData) {
  const result = await db.insert(schema.products).values(productData);

  const newProduct = await getProductById(result.lastInsertRowid);

  wsNotifyService.productCreated(newProduct);

  return newProduct;
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
  const oldProduct = await getProductById(id);
  if (!oldProduct) {
    throw new Error("Product not found");
  }

  await db
    .update(schema.products)
    .set(updates)
    .where(eq(schema.products.id, id));

  const updatedProduct = await getProductById(id);

  wsNotifyService.productUpdated(updatedProduct);

  if (updatedProduct.inventory <= 10 && updatedProduct.inventory > 0) {
    wsNotifyService.lowStock(updatedProduct);
  }

  return updatedProduct;
}

export async function deleteProduct(id) {
  const product = await getProductById(id);
  if (!product) {
    throw new Error("Product not found");
  }

  await db.delete(schema.products).where(eq(schema.products.id, id));

  wsNotifyService.productDeleted(id);

  return product;
}
