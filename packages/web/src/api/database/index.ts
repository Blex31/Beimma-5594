import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "./schema";

export const client = createClient({
  url: process.env.DATABASE_URL || "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });

const TABLE_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '🛒',
    color TEXT NOT NULL DEFAULT '#16a34a',
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    original_price REAL,
    image TEXT NOT NULL DEFAULT '',
    category_id INTEGER REFERENCES categories(id),
    unit TEXT NOT NULL DEFAULT 'kg',
    stock INTEGER NOT NULL DEFAULT 100,
    is_featured INTEGER DEFAULT 0,
    is_flash_sale INTEGER DEFAULT 0,
    is_best_seller INTEGER DEFAULT 0,
    rating REAL DEFAULT 4.5,
    review_count INTEGER DEFAULT 0,
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS addresses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'guest',
    label TEXT NOT NULL DEFAULT 'Home',
    street TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT,
    instructions TEXT,
    lat REAL DEFAULT -1.2921,
    lng REAL DEFAULT 36.8219,
    is_default INTEGER DEFAULT 0,
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS promo_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL DEFAULT 'percent',
    discount_value REAL NOT NULL,
    min_order REAL DEFAULT 0,
    max_uses INTEGER DEFAULT 100,
    used_count INTEGER DEFAULT 0,
    expires_at INTEGER,
    is_active INTEGER DEFAULT 1
  )`,
  `CREATE TABLE IF NOT EXISTS riders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'offline',
    vehicle_type TEXT DEFAULT 'bike',
    vehicle_plate TEXT,
    rating REAL DEFAULT 4.8,
    total_deliveries INTEGER DEFAULT 0,
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL DEFAULT 'guest',
    status TEXT NOT NULL DEFAULT 'pending',
    total REAL NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL DEFAULT 50,
    discount REAL DEFAULT 0,
    promo_code TEXT,
    address_id INTEGER REFERENCES addresses(id),
    address_snapshot TEXT,
    scheduled_for INTEGER,
    estimated_delivery INTEGER,
    notes TEXT,
    rider_id INTEGER REFERENCES riders(id),
    created_at INTEGER,
    updated_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    product_snapshot TEXT,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS rider_locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    rider_id INTEGER REFERENCES riders(id),
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    heading REAL DEFAULT 0,
    updated_at INTEGER
  )`,
];

export async function ensureTables() {
  for (const sql of TABLE_STATEMENTS) {
    await client.execute(sql);
  }
}

