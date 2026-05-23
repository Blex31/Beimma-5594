import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { useSearch } from "wouter";
import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function ProductsPage() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const [searchInput, setSearchInput] = useState(params.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState<string>(params.get("categoryId") || "");
  const [filter, setFilter] = useState({
    flashSale: params.get("flashSale") === "true",
    bestSeller: params.get("bestSeller") === "true",
    featured: params.get("featured") === "true",
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const queryParams: Record<string, string> = {};
  if (searchInput) queryParams.search = searchInput;
  if (selectedCategory) queryParams.categoryId = selectedCategory;
  if (filter.flashSale) queryParams.flashSale = "true";
  if (filter.bestSeller) queryParams.bestSeller = "true";
  if (filter.featured) queryParams.featured = "true";

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: async () => (await api.products.$get({ query: queryParams })).json(),
  });

  const categories = catData?.categories || [];
  const products = productsData?.products || [];

  const catIcons: Record<string, string> = {
    Fruits: "🍎", Vegetables: "🥦", Dairy: "🥛", Bakery: "🍞",
    Meat: "🥩", Beverages: "🧃", Snacks: "🍿", Frozen: "🧊",
    Pantry: "🫙", "Personal Care": "🧴"
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">All Products</h1>
        <p className="text-gray-500 text-sm">{products.length} items available</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-green-500 text-sm bg-white"
          />
          {searchInput && (
            <button onClick={() => setSearchInput("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-colors"
          style={{
            background: showFilters ? "#16a34a" : "white",
            color: showFilters ? "white" : "#374151",
            borderColor: showFilters ? "#16a34a" : "#e5e7eb"
          }}
        >
          <SlidersHorizontal size={16} /> Filters
        </button>
      </div>

      {/* Filter chips */}
      {showFilters && (
        <div className="flex gap-2 mb-6 flex-wrap animate-fade-up">
          {[
            { key: "flashSale", label: "🔥 Flash Sale" },
            { key: "bestSeller", label: "⭐ Best Sellers" },
            { key: "featured", label: "✨ Featured" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(prev => ({ ...prev, [f.key]: !prev[f.key as keyof typeof filter] }))}
              className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
              style={{
                background: filter[f.key as keyof typeof filter] ? "#16a34a" : "white",
                color: filter[f.key as keyof typeof filter] ? "white" : "#374151",
                borderColor: filter[f.key as keyof typeof filter] ? "#16a34a" : "#e5e7eb"
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        <button
          onClick={() => setSelectedCategory("")}
          className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-all"
          style={{
            background: !selectedCategory ? "#16a34a" : "white",
            color: !selectedCategory ? "white" : "#374151",
            borderColor: !selectedCategory ? "#16a34a" : "#e5e7eb"
          }}
        >
          All
        </button>
        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(selectedCategory === String(cat.id) ? "" : String(cat.id))}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all"
            style={{
              background: selectedCategory === String(cat.id) ? "#16a34a" : "white",
              color: selectedCategory === String(cat.id) ? "white" : "#374151",
              borderColor: selectedCategory === String(cat.id) ? "#16a34a" : "#e5e7eb"
            }}
          >
            <span>{catIcons[cat.name] || cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="h-40 bg-gray-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded animate-pulse" />
                <div className="h-3 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">No products found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          <button onClick={() => { setSearchInput(""); setSelectedCategory(""); setFilter({ flashSale: false, bestSeller: false, featured: false }); }}
            className="mt-4 btn-primary text-sm">
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Layout>
  );
}
