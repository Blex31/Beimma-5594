import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";

export const promos = new Hono()
  .post("/validate", async (c) => {
    const { code, subtotal } = await c.req.json();
    if (!code) return c.json({ valid: false, error: "No code provided" }, 200);

    const [promo] = await db.select().from(schema.promoCodes).where(eq(schema.promoCodes.code, code.toUpperCase()));
    
    if (!promo) return c.json({ valid: false, error: "Invalid promo code" }, 200);
    if (!promo.isActive) return c.json({ valid: false, error: "Promo code is no longer active" }, 200);
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) return c.json({ valid: false, error: "Promo code has expired" }, 200);
    if (subtotal < (promo.minOrder || 0)) return c.json({ valid: false, error: `Minimum order of KES ${promo.minOrder} required` }, 200);
    if ((promo.usedCount || 0) >= (promo.maxUses || 100)) return c.json({ valid: false, error: "Promo code limit reached" }, 200);

    let discount = 0;
    if (promo.discountType === "percent") {
      discount = (subtotal * promo.discountValue) / 100;
    } else {
      discount = promo.discountValue;
    }

    return c.json({ valid: true, discount, promo }, 200);
  })
  .get("/", async (c) => {
    const promoList = await db.select().from(schema.promoCodes).where(eq(schema.promoCodes.isActive, true));
    return c.json({ promos: promoList }, 200);
  });
