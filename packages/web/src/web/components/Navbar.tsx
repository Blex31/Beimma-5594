import { Link, useLocation } from "wouter";
import { ShoppingCart, MapPin, Search, Menu, X, Leaf } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getSessionId } from "../lib/api";

export function Navbar() {
  const [location, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const sessionId = typeof window !== "undefined" ? getSessionId() : "default";

  const cart = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (await api.cart[":sessionId"].$get({ param: { sessionId } })).json(),
    refetchInterval: 3000,
  });

  const cartCount = cart.data?.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#16a34a" }}>
                <Leaf size={18} color="white" />
              </div>
              <span className="text-xl font-bold" style={{ color: "#14532d" }}>Darco</span>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groceries..."
                className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:border-green-500 text-sm bg-gray-50 focus:bg-white transition-all"
              />
            </div>
          </form>

          {/* Right */}
          <div className="flex items-center gap-3">
            <Link to="/orders">
              <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-green-600 transition-colors font-medium">
                <MapPin size={16} />
                Orders
              </button>
            </Link>
            <Link to="/cart">
              <button className="relative p-2 rounded-full hover:bg-green-50 transition-colors">
                <ShoppingCart size={22} style={{ color: "#16a34a" }} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white animate-scale-in" style={{ background: "#f97316" }}>
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            </Link>
            <button className="sm:hidden p-1" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile search + menu */}
        {menuOpen && (
          <div className="sm:hidden pb-4 space-y-3 animate-fade-up">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search groceries..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:border-green-500 text-sm"
                />
              </div>
            </form>
            <div className="flex gap-4 px-1">
              <Link to="/products"><span className="text-sm font-medium text-gray-700">Products</span></Link>
              <Link to="/orders"><span className="text-sm font-medium text-gray-700">Orders</span></Link>
              <Link to="/admin"><span className="text-sm font-medium text-gray-700">Admin</span></Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
