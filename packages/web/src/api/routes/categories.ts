import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";

export const categories = new Hono()
  .get("/", async (c) => {
    const cats = await db.select().from(schema.categories);
    return c.json({ categories: cats }, 200);
  });
