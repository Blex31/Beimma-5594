import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";

export async function runSeed() {
  // Categories
  const cats = await db.insert(schema.categories).values([
    { name: "Fruits", icon: "🍎", color: "#16a34a" },
    { name: "Vegetables", icon: "🥦", color: "#15803d" },
    { name: "Dairy", icon: "🥛", color: "#0284c7" },
    { name: "Bakery", icon: "🍞", color: "#d97706" },
    { name: "Meat", icon: "🥩", color: "#dc2626" },
    { name: "Beverages", icon: "🧃", color: "#7c3aed" },
    { name: "Snacks", icon: "🍿", color: "#f97316" },
    { name: "Frozen", icon: "🧊", color: "#0891b2" },
    { name: "Pantry", icon: "🫙", color: "#92400e" },
    { name: "Personal Care", icon: "🧴", color: "#ec4899" },
  ]).returning();

  // Products
  const productData = [
    // Fruits
    { name: "Red Apples", description: "Crisp and sweet Kenya highland apples", price: 120, originalPrice: 150, image: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=300&h=300&fit=crop", categoryId: cats[0].id, unit: "kg", isBestSeller: true, isFlashSale: false, isFeatured: true, rating: 4.8, reviewCount: 234 },
    { name: "Bananas", description: "Sweet ripe bananas, bunch of 6", price: 80, originalPrice: null, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop", categoryId: cats[0].id, unit: "bunch", isBestSeller: true, isFlashSale: true, isFeatured: false, rating: 4.7, reviewCount: 189 },
    { name: "Avocado", description: "Creamy Hass avocados from Murang'a", price: 60, originalPrice: 80, image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=300&h=300&fit=crop", categoryId: cats[0].id, unit: "piece", isBestSeller: true, isFlashSale: false, isFeatured: true, rating: 4.9, reviewCount: 312 },
    { name: "Mango", description: "Juicy Kent mangoes, ripe and ready", price: 70, originalPrice: null, image: "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=300&h=300&fit=crop", categoryId: cats[0].id, unit: "piece", isBestSeller: false, isFlashSale: true, isFeatured: true, rating: 4.6, reviewCount: 145 },
    { name: "Watermelon", description: "Fresh seedless watermelon", price: 350, originalPrice: 420, image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&h=300&fit=crop", categoryId: cats[0].id, unit: "whole", isBestSeller: false, isFlashSale: false, isFeatured: false, rating: 4.5, reviewCount: 98 },
    { name: "Strawberries", description: "Fresh strawberries from Limuru", price: 200, originalPrice: 250, image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&h=300&fit=crop", categoryId: cats[0].id, unit: "punnet", isBestSeller: false, isFlashSale: true, isFeatured: true, rating: 4.8, reviewCount: 167 },

    // Vegetables
    { name: "Tomatoes", description: "Fresh vine tomatoes, firm and ripe", price: 90, originalPrice: null, image: "https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=300&h=300&fit=crop", categoryId: cats[1].id, unit: "kg", isBestSeller: true, isFlashSale: false, isFeatured: false, rating: 4.7, reviewCount: 220 },
    { name: "Spinach", description: "Baby spinach leaves, washed and ready", price: 60, originalPrice: null, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=300&h=300&fit=crop", categoryId: cats[1].id, unit: "bunch", isBestSeller: true, isFlashSale: false, isFeatured: true, rating: 4.6, reviewCount: 134 },
    { name: "Onions", description: "Red onions, firm and pungent", price: 70, originalPrice: 90, image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=300&h=300&fit=crop", categoryId: cats[1].id, unit: "kg", isBestSeller: true, isFlashSale: true, isFeatured: false, rating: 4.5, reviewCount: 289 },
    { name: "Carrots", description: "Organic carrots, sweet and crunchy", price: 80, originalPrice: null, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=300&h=300&fit=crop", categoryId: cats[1].id, unit: "kg", isBestSeller: false, isFlashSale: false, isFeatured: true, rating: 4.7, reviewCount: 112 },
    { name: "Kale (Sukuma)", description: "Fresh kale from local farms", price: 40, originalPrice: null, image: "https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=300&h=300&fit=crop", categoryId: cats[1].id, unit: "bunch", isBestSeller: true, isFlashSale: false, isFeatured: false, rating: 4.8, reviewCount: 198 },

    // Dairy
    { name: "Fresh Milk", description: "Brookside whole milk, 1 litre", price: 65, originalPrice: null, image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&h=300&fit=crop", categoryId: cats[2].id, unit: "litre", isBestSeller: true, isFlashSale: false, isFeatured: true, rating: 4.9, reviewCount: 456 },
    { name: "Yoghurt", description: "Chilled creamy yoghurt, strawberry flavour", price: 120, originalPrice: 140, image: "https://images.unsplash.com/photo-1571212515416-fef01fc43637?w=300&h=300&fit=crop", categoryId: cats[2].id, unit: "500ml", isBestSeller: false, isFlashSale: true, isFeatured: true, rating: 4.7, reviewCount: 178 },
    { name: "Eggs", description: "Free-range eggs, tray of 30", price: 420, originalPrice: 480, image: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=300&h=300&fit=crop", categoryId: cats[2].id, unit: "tray", isBestSeller: true, isFlashSale: false, isFeatured: true, rating: 4.8, reviewCount: 390 },
    { name: "Butter", description: "KCC unsalted butter, 250g", price: 180, originalPrice: null, image: "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300&h=300&fit=crop", categoryId: cats[2].id, unit: "250g", isBestSeller: false, isFlashSale: false, isFeatured: false, rating: 4.6, reviewCount: 89 },

    // Bakery
    { name: "White Bread", description: "Freshly baked sliced bread loaf", price: 70, originalPrice: null, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop", categoryId: cats[3].id, unit: "loaf", isBestSeller: true, isFlashSale: false, isFeatured: false, rating: 4.7, reviewCount: 234 },
    { name: "Mandazi", description: "Freshly fried fluffy mandazi, pack of 10", price: 100, originalPrice: null, image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=300&fit=crop", categoryId: cats[3].id, unit: "pack", isBestSeller: true, isFlashSale: true, isFeatured: true, rating: 4.9, reviewCount: 445 },

    // Beverages
    { name: "Orange Juice", description: "Freshly squeezed 100% orange juice", price: 180, originalPrice: 220, image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&h=300&fit=crop", categoryId: cats[5].id, unit: "1L", isBestSeller: false, isFlashSale: true, isFeatured: true, rating: 4.8, reviewCount: 167 },
    { name: "Mineral Water", description: "Still mineral water, chilled", price: 50, originalPrice: null, image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=300&h=300&fit=crop", categoryId: cats[5].id, unit: "750ml", isBestSeller: true, isFlashSale: false, isFeatured: false, rating: 4.5, reviewCount: 312 },

    // Snacks
    { name: "Potato Crisps", description: "Crunchy salted potato chips", price: 60, originalPrice: null, image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&h=300&fit=crop", categoryId: cats[6].id, unit: "100g", isBestSeller: false, isFlashSale: true, isFeatured: false, rating: 4.4, reviewCount: 134 },
  ];

  await db.insert(schema.products).values(productData);

  // Promo codes
  await db.insert(schema.promoCodes).values([
    { code: "WELCOME20", discountType: "percent", discountValue: 20, minOrder: 500, maxUses: 1000 },
    { code: "DARCO50", discountType: "fixed", discountValue: 50, minOrder: 300, maxUses: 500 },
    { code: "FRESH10", discountType: "percent", discountValue: 10, minOrder: 200, maxUses: 2000 },
  ]);

  // Riders
  const riderData = await db.insert(schema.riders).values([
    { name: "James Mwangi", phone: "+254712345678", status: "available", vehicleType: "bike", vehiclePlate: "KBZ 123A", rating: 4.9, totalDeliveries: 1240 },
    { name: "Grace Wanjiku", phone: "+254723456789", status: "busy", vehicleType: "motorbike", vehiclePlate: "KDF 456B", rating: 4.8, totalDeliveries: 876 },
    { name: "Peter Omondi", phone: "+254734567890", status: "available", vehicleType: "bike", vehiclePlate: "KAA 789C", rating: 4.7, totalDeliveries: 654 },
  ]).returning();

  // Rider locations (Nairobi area)
  await db.insert(schema.riderLocations).values([
    { riderId: riderData[0].id, lat: -1.2864, lng: 36.8172, heading: 45 },
    { riderId: riderData[1].id, lat: -1.2921, lng: 36.8250, heading: 180 },
    { riderId: riderData[2].id, lat: -1.2980, lng: 36.8100, heading: 90 },
  ]);

  // Sample addresses
  await db.insert(schema.addresses).values([
    { userId: "guest", label: "Home", street: "45 Westlands Road", city: "Nairobi", area: "Westlands", lat: -1.2672, lng: 36.8094, isDefault: true },
    { userId: "guest", label: "Work", street: "Upper Hill, Nairobi", city: "Nairobi", area: "Upper Hill", lat: -1.2960, lng: 36.8145, isDefault: false },
  ]);
}

export const seed = new Hono()
  .post("/", async (c) => {
    await runSeed();
    return c.json({ message: "Seeded successfully" }, 200);
  });
