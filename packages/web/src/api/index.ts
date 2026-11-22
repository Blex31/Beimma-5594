import { Hono } from 'hono';
import { cors } from "hono/cors";
import { categories } from './routes/categories';
import { products } from './routes/products';
import { cart } from './routes/cart';
import { orders } from './routes/orders';
import { addresses } from './routes/addresses';
import { riders } from './routes/riders';
import { promos } from './routes/promos';
import { admin } from './routes/admin';
import { seed, runSeed } from './routes/seed';
import { db, ensureTables } from './database';
import * as schema from './database/schema';

let initPromise: Promise<void> | null = null;

async function initializeDatabase() {
  await ensureTables();
  const cats = await db.select().from(schema.categories).limit(1);
  if (cats.length === 0) {
    console.log("[Auto-Seed] No categories found. Seeding database...");
    await runSeed();
    console.log("[Auto-Seed] Seeding completed successfully.");
  }
}

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .use('*', async (c, next) => {
    if (!initPromise) {
      initPromise = initializeDatabase().catch((err) => {
        initPromise = null;
        console.error("[Auto-Seed] Failed to initialize/seed database:", err);
        throw err;
      });
    }
    await initPromise;
    await next();
  })
  .get('/ping', (c) => c.json({ message: `Pong! ${Date.now()}` }, 200))
  .get('/health', (c) => c.json({ status: 'ok' }, 200))
  .route('/categories', categories)
  .route('/products', products)
  .route('/cart', cart)
  .route('/orders', orders)
  .route('/addresses', addresses)
  .route('/riders', riders)
  .route('/promos', promos)
  .route('/admin', admin)
  .route('/seed', seed);

export type AppType = typeof app;
export default app;
