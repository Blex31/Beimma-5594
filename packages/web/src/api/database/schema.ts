import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("🛒"),
  color: text("color").notNull().default("#16a34a"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description"),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  image: text("image").notNull().default(""),
  categoryId: integer("category_id").references(() => categories.id),
  unit: text("unit").notNull().default("kg"),
  stock: integer("stock").notNull().default(100),
  isFeatured: integer("is_featured", { mode: "boolean" }).default(false),
  isFlashSale: integer("is_flash_sale", { mode: "boolean" }).default(false),
  isBestSeller: integer("is_best_seller", { mode: "boolean" }).default(false),
  rating: real("rating").default(4.5),
  reviewCount: integer("review_count").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const addresses = sqliteTable("addresses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("guest"),
  label: text("label").notNull().default("Home"),
  street: text("street").notNull(),
  city: text("city").notNull(),
  area: text("area"),
  instructions: text("instructions"),
  lat: real("lat").default(-1.2921),
  lng: real("lng").default(36.8219),
  isDefault: integer("is_default", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const promoCodes = sqliteTable("promo_codes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  discountType: text("discount_type").notNull().default("percent"), // percent | fixed
  discountValue: real("discount_value").notNull(),
  minOrder: real("min_order").default(0),
  maxUses: integer("max_uses").default(100),
  usedCount: integer("used_count").default(0),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
});

export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().default("guest"),
  status: text("status").notNull().default("pending"), // pending | confirmed | preparing | out_for_delivery | delivered | cancelled
  total: real("total").notNull(),
  subtotal: real("subtotal").notNull(),
  deliveryFee: real("delivery_fee").notNull().default(50),
  discount: real("discount").default(0),
  promoCode: text("promo_code"),
  addressId: integer("address_id").references(() => addresses.id),
  addressSnapshot: text("address_snapshot"), // JSON snapshot
  scheduledFor: integer("scheduled_for", { mode: "timestamp" }),
  estimatedDelivery: integer("estimated_delivery", { mode: "timestamp" }),
  notes: text("notes"),
  riderId: integer("rider_id").references(() => riders.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const orderItems = sqliteTable("order_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  productSnapshot: text("product_snapshot"), // JSON
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

export const cartItems = sqliteTable("cart_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const riders = sqliteTable("riders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  avatar: text("avatar").default(""),
  status: text("status").notNull().default("offline"), // offline | available | busy
  vehicleType: text("vehicle_type").default("bike"),
  vehiclePlate: text("vehicle_plate"),
  rating: real("rating").default(4.8),
  totalDeliveries: integer("total_deliveries").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const riderLocations = sqliteTable("rider_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  riderId: integer("rider_id").references(() => riders.id),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  heading: real("heading").default(0),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
