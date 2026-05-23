import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Link } from "wouter";
import { useState } from "react";
import {
  Package, ShoppingBag, Users, TrendingUp, Truck, AlertCircle,
  CheckCircle, Clock, Edit2, Trash2, Plus, Leaf, X
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b", confirmed: "#3b82f6", preparing: "#f97316",
  out_for_delivery: "#8b5cf6", delivered: "#16a34a", cancelled: "#ef4444",
};

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "products" | "riders">("overview");
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", originalPrice: "", unit: "kg", image: "", categoryId: "", description: "", isFeatured: false, isBestSeller: false, isFlashSale: false });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.admin.stats.$get()).json(),
    refetchInterval: 10000,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await api.admin.orders.$get()).json(),
    enabled: activeTab === "orders",
  });

  const { data: productsData } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await api.admin.products.$get()).json(),
    enabled: activeTab === "products",
  });

  const { data: ridersData } = useQuery({
    queryKey: ["riders"],
    queryFn: async () => (await api.riders.$get()).json(),
    enabled: activeTab === "riders",
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.orders[":id"].status.$patch({ param: { id: String(id) }, json: { status } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: number) => {
      await api.admin.products[":id"].$delete({ param: { id: String(id) } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-products"] }),
  });

  const addProduct = useMutation({
    mutationFn: async () => {
      await api.admin.products.$post({
        json: {
          ...newProduct,
          price: parseFloat(newProduct.price),
          originalPrice: newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : null,
          categoryId: newProduct.categoryId ? parseInt(newProduct.categoryId) : null,
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowAddProduct(false);
      setNewProduct({ name: "", price: "", originalPrice: "", unit: "kg", image: "", categoryId: "", description: "", isFeatured: false, isBestSeller: false, isFlashSale: false });
    },
  });

  const updateRiderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.riders[":id"].status.$patch({ param: { id: String(id) }, json: { status } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["riders"] }),
  });

  const TABS = [
    { key: "overview", label: "Overview", icon: <TrendingUp size={16} /> },
    { key: "orders", label: "Orders", icon: <ShoppingBag size={16} /> },
    { key: "products", label: "Products", icon: <Package size={16} /> },
    { key: "riders", label: "Riders", icon: <Truck size={16} /> },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>
      {/* Sidebar nav */}
      <div className="flex">
        <aside className="w-56 min-h-screen bg-white border-r border-gray-100 fixed top-0 left-0 bottom-0 hidden md:flex flex-col z-10">
          <div className="p-5 border-b border-gray-100">
            <Link to="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#16a34a" }}>
                  <Leaf size={18} color="white" />
                </div>
                <span className="font-bold text-lg" style={{ color: "#14532d" }}>Darco</span>
              </div>
            </Link>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
          </div>
          <nav className="flex-1 p-3">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-1 transition-all"
                style={{ background: activeTab === t.key ? "#f0fdf4" : "transparent", color: activeTab === t.key ? "#16a34a" : "#6b7280" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="p-3 border-t border-gray-100">
            <Link to="/rider">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">
                <Truck size={16} /> Rider View
              </button>
            </Link>
            <Link to="/">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all">
                <ShoppingBag size={16} /> Customer View
              </button>
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 md:ml-56 p-5 md:p-8">
          {/* Mobile tabs */}
          <div className="flex gap-2 mb-6 md:hidden overflow-x-auto">
            {TABS.map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key as any)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium flex-shrink-0 transition-all"
                style={{ background: activeTab === t.key ? "#16a34a" : "#f3f4f6", color: activeTab === t.key ? "white" : "#374151" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          {activeTab === "overview" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Total Orders", value: stats?.totalOrders || 0, icon: <ShoppingBag size={20} />, color: "#3b82f6", bg: "#dbeafe" },
                  { label: "Revenue", value: `KES ${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp size={20} />, color: "#16a34a", bg: "#dcfce7" },
                  { label: "Pending", value: stats?.pendingOrders || 0, icon: <Clock size={20} />, color: "#f59e0b", bg: "#fef3c7" },
                  { label: "Active Riders", value: `${stats?.activeRiders || 0}/${stats?.totalRiders || 0}`, icon: <Truck size={20} />, color: "#8b5cf6", bg: "#ede9fe" },
                ].map((stat, i) => (
                  <div key={i} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stat.bg, color: stat.color }}>
                        {stat.icon}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{stats?.totalProducts || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Products</p>
                </div>
                <div className="card p-4 text-center">
                  <p className="text-3xl font-bold" style={{ color: "#16a34a" }}>{stats?.deliveredOrders || 0}</p>
                  <p className="text-sm text-gray-500 mt-1">Delivered</p>
                </div>
              </div>
            </div>
          )}

          {/* Orders */}
          {activeTab === "orders" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Orders</h1>
              <div className="space-y-3">
                {(ordersData?.orders || []).map((order: any) => (
                  <div key={order.id} className="card p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Order #{order.id}</p>
                      <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString("en-KE")}</p>
                    </div>
                    <span className="badge text-white text-xs" style={{ background: STATUS_COLORS[order.status] || "#6b7280" }}>
                      {order.status}
                    </span>
                    <p className="font-bold text-sm" style={{ color: "#16a34a" }}>KES {order.total?.toFixed(0)}</p>
                    <select
                      value={order.status}
                      onChange={e => updateOrderStatus.mutate({ id: order.id, status: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-green-500"
                    >
                      {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map(s => (
                        <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                      ))}
                    </select>
                    <Link to={`/track/${order.id}`}>
                      <button className="text-xs text-blue-600 hover:underline">View</button>
                    </Link>
                  </div>
                ))}
                {ordersData?.orders?.length === 0 && (
                  <div className="text-center py-10 text-gray-400">No orders yet</div>
                )}
              </div>
            </div>
          )}

          {/* Products */}
          {activeTab === "products" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <button onClick={() => setShowAddProduct(true)}
                  className="btn-primary text-sm flex items-center gap-2">
                  <Plus size={16} /> Add Product
                </button>
              </div>

              {showAddProduct && (
                <div className="card p-5 mb-5 animate-fade-up">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">New Product</h3>
                    <button onClick={() => setShowAddProduct(false)}><X size={18} className="text-gray-400" /></button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input placeholder="Name" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                    <input type="number" placeholder="Price (KES)" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                    <input type="number" placeholder="Original Price" value={newProduct.originalPrice} onChange={e => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                    <input placeholder="Unit (kg/piece/etc)" value={newProduct.unit} onChange={e => setNewProduct({ ...newProduct, unit: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                    <input placeholder="Image URL" value={newProduct.image} onChange={e => setNewProduct({ ...newProduct, image: e.target.value })}
                      className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                    <textarea placeholder="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })}
                      className="col-span-2 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500 resize-none" rows={2} />
                    <div className="col-span-2 flex gap-4">
                      {["isFeatured", "isBestSeller", "isFlashSale"].map(key => (
                        <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={newProduct[key as keyof typeof newProduct] as boolean}
                            onChange={e => setNewProduct({ ...newProduct, [key]: e.target.checked })}
                            style={{ accentColor: "#16a34a" }} />
                          {key.replace("is", "")}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => addProduct.mutate()} disabled={!newProduct.name || !newProduct.price || addProduct.isPending}
                      className="btn-primary text-sm">
                      {addProduct.isPending ? "Adding..." : "Add Product"}
                    </button>
                    <button onClick={() => setShowAddProduct(false)} className="btn-outline text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {(productsData?.products || []).map((p: any) => (
                  <div key={p.id} className="card p-3 flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=50&h=50&fit=crop"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400">KES {p.price} / {p.unit} · Stock: {p.stock}</p>
                    </div>
                    <div className="flex gap-1">
                      {p.isBestSeller && <span className="badge badge-green text-xs">Top</span>}
                      {p.isFlashSale && <span className="badge badge-orange text-xs">Sale</span>}
                    </div>
                    <button onClick={() => deleteProduct.mutate(p.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Trash2 size={14} color="#ef4444" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Riders */}
          {activeTab === "riders" && (
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Riders</h1>
              <div className="space-y-4">
                {(ridersData?.riders || []).map((rider: any) => (
                  <div key={rider.id} className="card p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ background: "#dcfce7" }}>🏍️</div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{rider.name}</p>
                        <p className="text-sm text-gray-500">{rider.phone} · {rider.vehiclePlate}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">⭐ {rider.rating} · {rider.totalDeliveries} deliveries</span>
                        </div>
                      </div>
                      <div>
                        <span className="badge text-white text-xs px-2 py-1 rounded-full mb-2 block text-center"
                          style={{ background: rider.status === "available" ? "#16a34a" : rider.status === "busy" ? "#f97316" : "#6b7280" }}>
                          {rider.status}
                        </span>
                        <select value={rider.status}
                          onChange={e => updateRiderStatus.mutate({ id: rider.id, status: e.target.value })}
                          className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-green-500">
                          <option value="offline">Offline</option>
                          <option value="available">Available</option>
                          <option value="busy">Busy</option>
                        </select>
                      </div>
                    </div>
                    {rider.location && (
                      <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                        <span>📍</span>
                        <span>Lat: {rider.location.lat?.toFixed(4)}, Lng: {rider.location.lng?.toFixed(4)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
