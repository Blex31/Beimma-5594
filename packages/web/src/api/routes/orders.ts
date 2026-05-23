import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, desc } from "drizzle-orm";

export const orders = new Hono()
  .get("/", async (c) => {
    const userId = c.req.query("userId") || "guest";
    const allOrders = await db.select().from(schema.orders)
      .where(eq(schema.orders.userId, userId))
      .orderBy(desc(schema.orders.createdAt));

    const enriched = await Promise.all(allOrders.map(async (order) => {
      const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
      return { ...order, items };
    }));

    return c.json({ orders: enriched }, 200);
  })
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, id));
    if (!order) return c.json({ error: "Not found" }, 404);

    const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, id));
    
    let rider = null;
    if (order.riderId) {
      const [r] = await db.select().from(schema.riders).where(eq(schema.riders.id, order.riderId));
      if (r) {
        const [loc] = await db.select().from(schema.riderLocations).where(eq(schema.riderLocations.riderId, r.id));
        rider = { ...r, location: loc };
      }
    }

    return c.json({ order, items, rider }, 200);
  })
  .post("/", async (c) => {
    const body = await c.req.json();
    const { sessionId, addressId, promoCode, scheduledFor, notes, userId } = body;

    // Validate promo
    let discount = 0;
    let validPromo = null;
    if (promoCode) {
      const [promo] = await db.select().from(schema.promoCodes).where(eq(schema.promoCodes.code, promoCode.toUpperCase()));
      if (promo && promo.isActive) {
        validPromo = promo;
      }
    }

    // Get cart items
    const cartItems = await db.select().from(schema.cartItems).where(eq(schema.cartItems.sessionId, sessionId));
    if (cartItems.length === 0) return c.json({ error: "Cart is empty" }, 400);

    const itemsWithProducts = await Promise.all(cartItems.map(async (item) => {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.id, item.productId!));
      return { ...item, product };
    }));

    const subtotal = itemsWithProducts.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    const deliveryFee = 50;

    if (validPromo) {
      if (subtotal >= (validPromo.minOrder || 0)) {
        if (validPromo.discountType === "percent") {
          discount = (subtotal * validPromo.discountValue) / 100;
        } else {
          discount = validPromo.discountValue;
        }
      }
    }

    const total = subtotal + deliveryFee - discount;

    // Get address
    let addressSnapshot = null;
    if (addressId) {
      const [addr] = await db.select().from(schema.addresses).where(eq(schema.addresses.id, addressId));
      if (addr) addressSnapshot = JSON.stringify(addr);
    }

    // Assign a rider
    const [availableRider] = await db.select().from(schema.riders).where(eq(schema.riders.status, "available"));

    const estimatedDelivery = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const [order] = await db.insert(schema.orders).values({
      userId: userId || "guest",
      status: "confirmed",
      total,
      subtotal,
      deliveryFee,
      discount,
      promoCode: promoCode || null,
      addressId: addressId || null,
      addressSnapshot,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      estimatedDelivery,
      notes: notes || null,
      riderId: availableRider?.id || null,
    }).returning();

    // Insert order items
    await db.insert(schema.orderItems).values(
      itemsWithProducts.map(i => ({
        orderId: order.id,
        productId: i.productId,
        productSnapshot: JSON.stringify(i.product),
        quantity: i.quantity,
        price: i.product.price,
      }))
    );

    // Clear cart
    await db.delete(schema.cartItems).where(eq(schema.cartItems.sessionId, sessionId));

    // Increment promo usage
    if (validPromo) {
      await db.update(schema.promoCodes)
        .set({ usedCount: (validPromo.usedCount || 0) + 1 })
        .where(eq(schema.promoCodes.id, validPromo.id));
    }

    return c.json({ order }, 201);
  })
  .patch("/:id/status", async (c) => {
    const id = parseInt(c.req.param("id"));
    const { status } = await c.req.json();
    await db.update(schema.orders).set({ status, updatedAt: new Date() }).where(eq(schema.orders.id, id));
    return c.json({ success: true }, 200);
  });
