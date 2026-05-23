import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../lib/api";
import { Layout } from "../components/Layout";
import { Link } from "wouter";
import { Package, ChevronRight, RotateCcw, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  preparing: "#f97316",
  out_for_delivery: "#8b5cf6",
  delivered: "#16a34a",
  cancelled: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrdersPage() {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => (await api.orders.$get({ query: { userId: "guest" } })).json(),
  });

  const reorder = useMutation({
    mutationFn: async (items: any[]) => {
      for (const item of items) {
        const snap = item.productSnapshot ? JSON.parse(item.productSnapshot) : null;
        if (snap) {
          await api.cart[":sessionId"].$post({
            param: { sessionId },
            json: { productId: item.productId, quantity: item.quantity },
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      alert("Items added to cart! Head to cart to checkout.");
    },
  });

  const orders = data?.orders || [];

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">Start shopping to see your orders here</p>
          <Link to="/products">
            <button className="btn-primary">Shop Now</button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order: any) => (
            <div key={order.id} className="card p-5 animate-fade-up">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900">Order #{order.id}</p>
                    <span className="badge text-white text-xs px-2 py-0.5 rounded-full"
                      style={{ background: STATUS_COLORS[order.status] || "#6b7280" }}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock size={12} />
                    {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                <p className="font-bold text-lg" style={{ color: "#16a34a" }}>KES {order.total?.toFixed(0)}</p>
              </div>

              {order.items?.length > 0 && (
                <div className="flex gap-1 mb-3">
                  {order.items.slice(0, 4).map((item: any) => {
                    const snap = item.productSnapshot ? JSON.parse(item.productSnapshot) : null;
                    return snap ? (
                      <img key={item.id} src={snap.image} alt={snap.name}
                        className="w-10 h-10 rounded-lg object-cover border border-gray-100"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=40&h=40&fit=crop"; }} />
                    ) : null;
                  })}
                  {order.items.length > 4 && (
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-gray-50">
                {["confirmed", "preparing", "out_for_delivery"].includes(order.status) && (
                  <Link to={`/track/${order.id}`}>
                    <button className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all"
                      style={{ background: "#dcfce7", color: "#16a34a" }}>
                      <Package size={14} /> Track Order
                    </button>
                  </Link>
                )}
                {order.status === "delivered" && (
                  <button
                    onClick={() => reorder.mutate(order.items)}
                    disabled={reorder.isPending}
                    className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all"
                    style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <RotateCcw size={14} /> {reorder.isPending ? "Adding..." : "Reorder"}
                  </button>
                )}
                <Link to={`/track/${order.id}`}>
                  <button className="flex items-center gap-1 text-sm text-gray-500 px-3 py-2 hover:text-gray-700 transition-colors">
                    Details <ChevronRight size={14} />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
