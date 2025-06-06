import { Hono } from "hono";
import * as productController from "../controllers/productController.js";

const router = new Hono();

router.get("/", async (c) => {
  try {
    const products = await productController.getAllProducts();
    return c.json(products);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch products",
          details: {},
        },
      },
      500
    );
  }
});

router.get("/:id", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    const product = await productController.getProductById(id);

    if (!product) {
      return c.json(
        {
          error: {
            code: "NOT_FOUND",
            message: "Product not found",
            details: {},
          },
        },
        404
      );
    }

    return c.json(product);
  } catch (error) {
    return c.json(
      {
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch product",
          details: {},
        },
      },
      500
    );
  }
});

export default router;
