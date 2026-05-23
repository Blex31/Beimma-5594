import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, like, and, or } from "drizzle-orm";

export const products = new Hono()
  .get("/", async (c) => {
    const categoryId = c.req.query("categoryId");
    const search = c.req.query("search");
    const featured = c.req.query("featured");
    const flashSale = c.req.query("flashSale");
    const bestSeller = c.req.query("bestSeller");

    let query = db.select().from(schema.products);
    const conditions = [];

    if (categoryId) conditions.push(eq(schema.products.categoryId, parseInt(categoryId)));
    if (featured === "true") conditions.push(eq(schema.products.isFeatured, true));
    if (flashSale === "true") conditions.push(eq(schema.products.isFlashSale, true));
    if (bestSeller === "true") conditions.push(eq(schema.products.isBestSeller, true));
    if (search) conditions.push(like(schema.products.name, `%${search}%`));

    const prods = conditions.length > 0
      ? await db.select().from(schema.products).where(and(...conditions))
      : await db.select().from(schema.products);

    return c.json({ products: prods }, 200);
  })
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
    if (!product) return c.json({ error: "Not found" }, 404);

    // Related products from same category
    const related = await db.select().from(schema.products)
      .where(and(eq(schema.products.categoryId, product.categoryId!), eq(schema.products.id, id)))
      .limit(4);

    return c.json({ product, related }, 200);
  });
