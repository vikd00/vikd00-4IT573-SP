import { Hono } from "hono";
import * as productController from "../../controllers/productController.js";
import { adminAuthMiddleware } from "../../middleware/adminAuth.js";
import { broadcastInventoryUpdate } from "../../websocket/wsServer.js";

const router = new Hono();

// All admin product routes require admin authentication
router.use("*", adminAuthMiddleware);

router.get("/", async (c) => {
  try {
    const products = await productController.getAllProducts(true); // Include inactive products
    return c.json(products);
  } catch (error) {
    return c.json({ 
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch products",
        details: {}
      }
    }, 500);
  }
});

router.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const product = await productController.createProduct(body);
    await broadcastInventoryUpdate();
    return c.json(product, 201);
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

router.put("/:id", async (c) => {
  try {
    const productId = Number(c.req.param("id"));
    const body = await c.req.json();
    const product = await productController.updateProduct(productId, body);
    await broadcastInventoryUpdate();
    return c.json(product);
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

router.delete("/:id", async (c) => {
  try {
    const productId = Number(c.req.param("id"));
    await productController.deleteProduct(productId);
    await broadcastInventoryUpdate();
    return c.json({ message: "Product deleted successfully" });
  } catch (error) {
    return c.json({ 
      error: {
        code: "INVALID_INPUT",
        message: error.message,
        details: {}
      }
    }, 400);
  }
});

export default router;
