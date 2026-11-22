import { Plus, Star, Zap } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../lib/api";
import { Link } from "wouter";
import { ScrollReveal } from "./ScrollReveal";

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number | null;
  image: string;
  unit: string;
  rating?: number | null;
  reviewCount?: number | null;
  isBestSeller?: boolean | null;
  isFlashSale?: boolean | null;
  isFeatured?: boolean | null;
  stock?: number | null;
}

export function ProductCard({ product }: { product: Product }) {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();

  const addToCart = useMutation({
    mutationFn: async () => {
      await api.cart[":sessionId"].$post({
        param: { sessionId },
        json: { productId: product.id, quantity: 1 },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
    },
  });

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <ScrollReveal className="h-full">
      <div className="card bg-white flex flex-col h-full overflow-hidden group">
        {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "160px" }}>
        <img
          src={product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop"; }}
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.isFlashSale && (
            <span className="badge" style={{ background: "#f97316", color: "white", fontSize: "0.65rem" }}>
              <Zap size={10} className="mr-0.5" /> SALE
            </span>
          )}
          {product.isBestSeller && !product.isFlashSale && (
            <span className="badge badge-green" style={{ fontSize: "0.65rem" }}>TOP</span>
          )}
          {discount > 0 && (
            <span className="badge badge-red" style={{ fontSize: "0.65rem" }}>-{discount}%</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/products/${product.id}`}>
          <p className="font-semibold text-gray-900 text-sm line-clamp-2 hover:text-green-700 cursor-pointer leading-tight mb-1">
            {product.name}
          </p>
        </Link>
        <p className="text-xs text-gray-400 mb-2">per {product.unit}</p>

        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={11} fill="#f59e0b" color="#f59e0b" />
            <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount || 0})</span>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="font-bold text-green-700 text-base">KES {product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 line-through ml-1">KES {product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => addToCart.mutate()}
            disabled={addToCart.isPending}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
            style={{ background: addToCart.isPending ? "#86efac" : "#16a34a" }}
          >
            <Plus size={18} color="white" strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  </ScrollReveal>
);
}
