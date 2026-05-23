import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, and } from "drizzle-orm";

export const cart = new Hono()
  .get("/:sessionId", async (c) => {
    const sessionId = c.req.param("sessionId");
    const items = await db.select().from(schema.cartItems)
      .where(eq(schema.cartItems.sessionId, sessionId));

    // Enrich with product data
    const enriched = await Promise.all(items.map(async (item) => {
      const [product] = await db.select().from(schema.products)
        .where(eq(schema.products.id, item.productId!));
      return { ...item, product };
    }));

    // Smart suggestions: find products from same categories
    const categoryIds = [...new Set(enriched.map(i => i.product?.categoryId).filter(Boolean))];
    const cartProductIds = enriched.map(i => i.productId);
    
    let suggestions: typeof schema.products.$inferSelect[] = [];
    if (categoryIds.length > 0) {
      const allProds = await db.select().from(schema.products);
      suggestions = allProds
        .filter(p => categoryIds.includes(p.categoryId) && !cartProductIds.includes(p.id))
        .slice(0, 4);
    }

    const subtotal = enriched.reduce((sum, i) => sum + (i.product?.price || 0) * i.quantity, 0);

    return c.json({ items: enriched, suggestions, subtotal }, 200);
  })
  .post("/:sessionId", async (c) => {
    const sessionId = c.req.param("sessionId");
    const { productId, quantity } = await c.req.json();

    // Check if already in cart
    const [existing] = await db.select().from(schema.cartItems)
      .where(and(eq(schema.cartItems.sessionId, sessionId), eq(schema.cartItems.productId, productId)));

    if (existing) {
      await db.update(schema.cartItems)
        .set({ quantity: existing.quantity + (quantity || 1) })
        .where(eq(schema.cartItems.id, existing.id));
    } else {
      await db.insert(schema.cartItems).values({ sessionId, productId, quantity: quantity || 1 });
    }

    return c.json({ success: true }, 200);
  })
  .patch("/:sessionId/:itemId", async (c) => {
    const itemId = parseInt(c.req.param("itemId"));
    const { quantity } = await c.req.json();

    if (quantity <= 0) {
      await db.delete(schema.cartItems).where(eq(schema.cartItems.id, itemId));
    } else {
      await db.update(schema.cartItems).set({ quantity }).where(eq(schema.cartItems.id, itemId));
    }

    return c.json({ success: true }, 200);
  })
  .delete("/:sessionId/:itemId", async (c) => {
    const itemId = parseInt(c.req.param("itemId"));
    await db.delete(schema.cartItems).where(eq(schema.cartItems.id, itemId));
    return c.json({ success: true }, 200);
  })
  .delete("/:sessionId", async (c) => {
    const sessionId = c.req.param("sessionId");
    await db.delete(schema.cartItems).where(eq(schema.cartItems.sessionId, sessionId));
    return c.json({ success: true }, 200);
  });
