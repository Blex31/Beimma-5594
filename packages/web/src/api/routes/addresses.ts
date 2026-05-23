import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

export const addresses = new Hono()
  .get("/", async (c) => {
    const userId = c.req.query("userId") || "guest";
    const addrs = await db.select().from(schema.addresses).where(eq(schema.addresses.userId, userId));
    return c.json({ addresses: addrs }, 200);
  })
  .post("/", async (c) => {
    const body = await c.req.json();
    // If setting as default, unset others
    if (body.isDefault) {
      await db.update(schema.addresses).set({ isDefault: false }).where(eq(schema.addresses.userId, body.userId || "guest"));
    }
    const [addr] = await db.insert(schema.addresses).values({ ...body, userId: body.userId || "guest" }).returning();
    return c.json({ address: addr }, 201);
  })
  .delete("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    await db.delete(schema.addresses).where(eq(schema.addresses.id, id));
    return c.json({ success: true }, 200);
  });
