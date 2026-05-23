import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

export const riders = new Hono()
  .get("/", async (c) => {
    const allRiders = await db.select().from(schema.riders);
    const enriched = await Promise.all(allRiders.map(async (r) => {
      const [loc] = await db.select().from(schema.riderLocations).where(eq(schema.riderLocations.riderId, r.id));
      return { ...r, location: loc };
    }));
    return c.json({ riders: enriched }, 200);
  })
  .get("/:id/location", async (c) => {
    const riderId = parseInt(c.req.param("id"));
    const [loc] = await db.select().from(schema.riderLocations).where(eq(schema.riderLocations.riderId, riderId));
    return c.json({ location: loc || null }, 200);
  })
  .patch("/:id/location", async (c) => {
    const riderId = parseInt(c.req.param("id"));
    const { lat, lng, heading } = await c.req.json();

    const [existing] = await db.select().from(schema.riderLocations).where(eq(schema.riderLocations.riderId, riderId));
    if (existing) {
      await db.update(schema.riderLocations)
        .set({ lat, lng, heading: heading || 0, updatedAt: new Date() })
        .where(eq(schema.riderLocations.riderId, riderId));
    } else {
      await db.insert(schema.riderLocations).values({ riderId, lat, lng, heading: heading || 0 });
    }
    return c.json({ success: true }, 200);
  })
  .patch("/:id/status", async (c) => {
    const riderId = parseInt(c.req.param("id"));
    const { status } = await c.req.json();
    await db.update(schema.riders).set({ status }).where(eq(schema.riders.id, riderId));
    return c.json({ success: true }, 200);
  });
