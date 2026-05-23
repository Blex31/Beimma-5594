import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc, count, sum } from "drizzle-orm";

export const admin = new Hono()
  .get("/stats", async (c) => {
    const allOrders = await db.select().from(schema.orders);
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
    const pendingOrders = allOrders.filter(o => ["pending", "confirmed", "preparing"].includes(o.status)).length;
    const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;

    const allProducts = await db.select().from(schema.products);
    const allRiders = await db.select().from(schema.riders);
    const activeRiders = allRiders.filter(r => r.status !== "offline").length;

    return c.json({
      totalOrders,
      totalRevenue,
      pendingOrders,
      deliveredOrders,
      totalProducts: allProducts.length,
      totalRiders: allRiders.length,
      activeRiders,
    }, 200);
  })
  .get("/orders", async (c) => {
    const allOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
    return c.json({ orders: allOrders }, 200);
  })
  .get("/products", async (c) => {
    const prods = await db.select().from(schema.products);
    return c.json({ products: prods }, 200);
  })
  .post("/products", async (c) => {
    const body = await c.req.json();
    const [product] = await db.insert(schema.products).values(body).returning();
    return c.json({ product }, 201);
  })
  .patch("/products/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    await db.update(schema.products).set(body).where(eq(schema.products.id, id));
    return c.json({ success: true }, 200);
  })
  .delete("/products/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(schema.products).where(eq(schema.products.id, id));
    return c.json({ success: true }, 200);
  });
