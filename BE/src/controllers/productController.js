import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import * as schema from "../models/schema.js";

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
