# Darco App Build Progress

## Status: IN PROGRESS

## Done
- [x] app_init
- [x] design.md
- [x] DB schema (categories, products, addresses, promos, orders, order_items, cart_items, riders, rider_locations)
- [x] db:push
- [x] API routes: categories, products, cart, orders, addresses, riders, promos, admin, seed
- [x] api/index.ts updated

## Next
- [ ] Web pages: index (home), products, cart, checkout, orders, track/:id, admin, rider
- [ ] Web lib/api.ts + session util
- [ ] Web app.tsx routing
- [ ] Global styles + font import (Poppins)
- [ ] Shared components: Navbar, Layout, ProductCard, CategoryCircle, CartBadge
- [ ] Mobile: _layout, tabs, home, categories, cart, orders, track, profile
- [ ] app.json update (Darco)
- [ ] Seed data (call after start)
- [ ] bun run build check
- [ ] deliver

## Design
- Primary: #16a34a, Accent: #f97316, BG: #f9fafb
- Font: Poppins
- Fresh, clean, organic

## Notes
- Use simulated rider location (CSS map with lat/lng dot positioning)
- Session ID stored in localStorage for cart
- Admin at /admin, rider at /rider
