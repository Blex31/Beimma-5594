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
import { seed } from './routes/seed';

const app = new Hono()
  .basePath('api')
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
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
