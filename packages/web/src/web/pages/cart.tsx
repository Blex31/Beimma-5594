import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../lib/api";
import { Layout } from "../components/Layout";
import { ProductCard } from "../components/ProductCard";
import { Link, useLocation } from "wouter";
import { Plus, Minus, Trash2, ShoppingBag, ChevronRight, Tag } from "lucide-react";

export default function CartPage() {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (await api.cart[":sessionId"].$get({ param: { sessionId } })).json(),
  });

  const updateItem = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      await api.cart[":sessionId"][":itemId"].$patch({
        param: { sessionId, itemId: String(itemId) },
        json: { quantity },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const removeItem = useMutation({
    mutationFn: async (itemId: number) => {
      await api.cart[":sessionId"][":itemId"].$delete({
        param: { sessionId, itemId: String(itemId) },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const items = data?.items || [];
  const suggestions = data?.suggestions || [];
  const subtotal = data?.subtotal || 0;
  const deliveryFee = 50;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Add some fresh groceries to get started</p>
          <Link to="/products">
            <button className="btn-primary">Browse Products</button>
          </Link>
        </div>
        {suggestions.length > 0 && (
          <section className="mt-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4">You might like</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {suggestions.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart ({items.length} items)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item: any) => (
            <div key={item.id} className="card p-4 flex items-center gap-4 animate-fade-up">
              <img
                src={item.product?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop"}
                alt={item.product?.name}
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop"; }}
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm truncate">{item.product?.name}</p>
                <p className="text-xs text-gray-400">per {item.product?.unit}</p>
                <p className="font-bold text-green-700 mt-0.5">KES {item.product?.price}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold text-sm">{item.quantity}</span>
                <button
                  onClick={() => updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors"
                  style={{ background: "#16a34a" }}
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => removeItem.mutate(item.id)}
                  className="w-8 h-8 rounded-full border border-red-100 flex items-center justify-center hover:bg-red-50 transition-colors ml-1"
                >
                  <Trash2 size={14} color="#ef4444" />
                </button>
              </div>
              <div className="text-right w-20 flex-shrink-0">
                <p className="font-bold text-gray-900 text-sm">KES {((item.product?.price || 0) * item.quantity).toFixed(0)}</p>
              </div>
            </div>
          ))}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={18} style={{ color: "#16a34a" }} /> You might also need
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {suggestions.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({items.length} items)</span>
                <span>KES {subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>KES {deliveryFee}</span>
              </div>
              <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900 text-base">
                <span>Total</span>
                <span style={{ color: "#16a34a" }}>KES {total.toFixed(0)}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ChevronRight size={16} />
            </button>
          </div>

          {/* Promo teaser */}
          <div className="card p-4 flex items-center gap-3">
            <Tag size={18} style={{ color: "#f97316" }} />
            <div>
              <p className="text-sm font-semibold text-gray-900">Have a promo code?</p>
              <p className="text-xs text-gray-400">Apply it at checkout</p>
            </div>
          </div>

          <Link to="/products">
            <button className="btn-outline w-full">Continue Shopping</button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
