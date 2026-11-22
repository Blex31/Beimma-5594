import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { Link, useLocation } from "wouter";
import { Clock, Shield, Truck, ChevronRight, Zap, Star, Package } from "lucide-react";
import { Skeleton, ProductGridSkeleton } from "../components/ui/Skeleton";

export default function HomePage() {
  const [, navigate] = useLocation();

  const { data: catData, isLoading: catsLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const { data: bestSellers, isLoading: bsLoading } = useQuery({
    queryKey: ["products", "bestSeller"],
    queryFn: async () => (await api.products.$get({ query: { bestSeller: "true" } })).json(),
  });

  const { data: flashSales } = useQuery({
    queryKey: ["products", "flashSale"],
    queryFn: async () => (await api.products.$get({ query: { flashSale: "true" } })).json(),
  });

  const { data: featured } = useQuery({
    queryKey: ["products", "featured"],
    queryFn: async () => (await api.products.$get({ query: { featured: "true" } })).json(),
  });

  const categories = catData?.categories || [];
  const catIcons: Record<string, string> = {
    Fruits: "🍎", Vegetables: "🥦", Dairy: "🥛", Bakery: "🍞",
    Meat: "🥩", Beverages: "🧃", Snacks: "🍿", Frozen: "🧊",
    Pantry: "🫙", "Personal Care": "🧴"
  };

  return (
    <Layout>
      {/* Hero Banner */}
      <div className="relative rounded-2xl overflow-hidden mb-8 animate-fade-up"
        style={{ background: "linear-gradient(135deg, #14532d 0%, #16a34a 60%, #4ade80 100%)", minHeight: "220px" }}>
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: `${80 + i * 40}px`, height: `${80 + i * 40}px`,
                background: "white", opacity: 0.15,
                top: `${Math.random() * 80}%`, left: `${Math.random() * 80}%`,
                transform: "translate(-50%,-50%)"
              }} />
          ))}
        </div>
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-medium mb-3">
              <Zap size={12} /> Flash delivery in Nairobi
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
              Fresh Groceries<br />
              <span style={{ color: "#86efac" }}>Delivered Fast</span>
            </h1>
            <p className="text-green-100 text-sm mb-6 max-w-xs">
              Order fresh produce, dairy, bakery & more. Delivered to your door in under 30 minutes.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link to="/products">
                <button className="bg-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all hover:bg-green-50 hover:scale-105"
                  style={{ color: "#16a34a" }}>
                  Shop Now
                </button>
              </Link>
              <Link to="/orders">
                <button className="border-2 border-white/50 text-white font-semibold px-6 py-2.5 rounded-full text-sm hover:bg-white/10 transition-all">
                  Track Order
                </button>
              </Link>
            </div>
          </div>
          <div className="hidden md:block text-8xl select-none">🛒</div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
        {[
          { icon: <Clock size={20} color="#16a34a" />, label: "30 min delivery", sub: "Average time" },
          { icon: <Shield size={20} color="#16a34a" />, label: "100% Fresh", sub: "Quality guaranteed" },
          { icon: <Truck size={20} color="#16a34a" />, label: "Free delivery", sub: "Orders over KES 1000" },
        ].map((stat, i) => (
          <div key={i} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#dcfce7" }}>
              {stat.icon}
            </div>
            <div className="hidden sm:block">
              <p className="font-semibold text-sm text-gray-900">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.sub}</p>
            </div>
            <div className="sm:hidden">
              <p className="font-semibold text-xs text-gray-900">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Promo Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}>
          <div>
            <span className="badge bg-white/30 text-white mb-2">Limited Time</span>
            <p className="text-white font-bold text-lg">Use code <span className="bg-white/20 px-2 py-0.5 rounded-lg">WELCOME20</span></p>
            <p className="text-orange-100 text-sm mt-1">20% off your first order</p>
          </div>
          <div className="text-5xl">🎉</div>
        </div>
        <div className="rounded-2xl p-5 flex items-center justify-between overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #0284c7, #0ea5e9)" }}>
          <div>
            <span className="badge bg-white/30 text-white mb-2">Daily Deal</span>
            <p className="text-white font-bold text-lg">Fresh produce sale</p>
            <p className="text-blue-100 text-sm mt-1">Up to 30% off vegetables & fruits</p>
          </div>
          <div className="text-5xl">🥬</div>
        </div>
      </div>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <Link to="/products">
            <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "#16a34a" }}>
              View all <ChevronRight size={16} />
            </button>
          </Link>
        </div>
        {catsLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <Skeleton variant="circle" className="w-16 h-16 bg-gray-100" />
                <Skeleton variant="text" className="w-12 h-3 bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat: any, i: number) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/products?categoryId=${cat.id}`)}
                className="flex flex-col items-center gap-2 flex-shrink-0 group"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all group-hover:scale-110 shadow-sm"
                  style={{ background: "#dcfce7", border: "2px solid #bbf7d0" }}>
                  {catIcons[cat.name] || cat.icon || "🛒"}
                </div>
                <span className="text-xs font-medium text-gray-700 group-hover:text-green-700 transition-colors whitespace-nowrap">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Flash Sales */}
      {flashSales?.products?.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Zap size={20} style={{ color: "#f97316" }} />
              <h2 className="text-xl font-bold text-gray-900">Flash Sales</h2>
              <span className="badge badge-orange">Ends Soon</span>
            </div>
            <Link to="/products?flashSale=true">
              <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "#16a34a" }}>
                See all <ChevronRight size={16} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {flashSales.products.slice(0, 5).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Star size={20} fill="#f59e0b" color="#f59e0b" />
            <h2 className="text-xl font-bold text-gray-900">Best Sellers</h2>
          </div>
          <Link to="/products?bestSeller=true">
            <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "#16a34a" }}>
              See all <ChevronRight size={16} />
            </button>
          </Link>
        </div>
        {bsLoading ? (
          <ProductGridSkeleton count={5} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(bestSellers?.products || []).slice(0, 10).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Featured */}
      {featured?.products?.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={20} style={{ color: "#16a34a" }} />
              <h2 className="text-xl font-bold text-gray-900">Just In</h2>
            </div>
            <Link to="/products?featured=true">
              <button className="flex items-center gap-1 text-sm font-medium" style={{ color: "#16a34a" }}>
                See all <ChevronRight size={16} />
              </button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featured.products.slice(0, 5).map((p: any) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Layout>
  );
}
