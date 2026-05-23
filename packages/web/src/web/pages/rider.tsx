import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Phone, Package, CheckCircle, Navigation, Leaf, MapPin, Clock } from "lucide-react";

export default function RiderPage() {
  const queryClient = useQueryClient();
  const [riderId, setRiderId] = useState<number>(1);
  const [riderPos, setRiderPos] = useState({ x: 30, y: 60 });

  const { data: ridersData } = useQuery({
    queryKey: ["riders"],
    queryFn: async () => (await api.riders.$get()).json(),
  });

  const { data: ordersData } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await api.admin.orders.$get()).json(),
    refetchInterval: 8000,
  });

  const updateLocation = useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      await api.riders[":id"].location.$patch({
        param: { id: String(riderId) },
        json: { lat, lng, heading: 90 },
      });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      await api.riders[":id"].status.$patch({ param: { id: String(riderId) }, json: { status } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["riders"] }),
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await api.orders[":id"].status.$patch({ param: { id: String(id) }, json: { status } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] }),
  });

  // Simulate rider GPS movement
  useEffect(() => {
    const interval = setInterval(() => {
      setRiderPos(prev => ({
        x: Math.max(5, Math.min(90, prev.x + (Math.random() - 0.5) * 5)),
        y: Math.max(5, Math.min(90, prev.y + (Math.random() - 0.5) * 5)),
      }));
      // Update backend location
      updateLocation.mutate({ lat: -1.29 + (Math.random() - 0.5) * 0.02, lng: 36.82 + (Math.random() - 0.5) * 0.02 });
    }, 5000);
    return () => clearInterval(interval);
  }, [riderId]);

  const riders = ridersData?.riders || [];
  const currentRider = riders.find((r: any) => r.id === riderId) || riders[0];
  const activeOrders = (ordersData?.orders || []).filter((o: any) => ["confirmed", "preparing", "out_for_delivery"].includes(o.status));

  return (
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "#16a34a" }}>
                <Leaf size={14} color="white" />
              </div>
              <span className="font-bold" style={{ color: "#14532d" }}>Darco Rider</span>
            </div>
          </Link>
          {currentRider && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{currentRider.name?.split(" ")[0]}</span>
              <span className="badge text-white text-xs px-2 py-0.5 rounded-full"
                style={{ background: currentRider.status === "available" ? "#16a34a" : currentRider.status === "busy" ? "#f97316" : "#6b7280" }}>
                {currentRider.status}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Rider selector */}
        <div className="card p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Switch Rider View</p>
          <div className="flex gap-2 flex-wrap">
            {riders.map((r: any) => (
              <button key={r.id} onClick={() => setRiderId(r.id)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all"
                style={{ background: riderId === r.id ? "#16a34a" : "#f3f4f6", color: riderId === r.id ? "white" : "#374151" }}>
                {r.name?.split(" ")[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Status toggle */}
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">Go Online</p>
            <p className="text-xs text-gray-400">Set yourself as available for deliveries</p>
          </div>
          <div className="flex gap-2">
            {["available", "busy", "offline"].map(s => (
              <button key={s} onClick={() => updateStatus.mutate(s)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all capitalize"
                style={{ background: currentRider?.status === s ? (s === "available" ? "#16a34a" : s === "busy" ? "#f97316" : "#6b7280") : "#f3f4f6", color: currentRider?.status === s ? "white" : "#374151" }}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Live map */}
        <div className="card overflow-hidden">
          <div className="map-container" style={{ height: "200px" }}>
            <div className="map-grid" />
            <div className="map-road-h" style={{ top: "50%" }} />
            <div className="map-road-h" style={{ top: "75%" }} />
            <div className="map-road-v" style={{ left: "33%" }} />
            <div className="map-road-v" style={{ left: "66%" }} />

            <div className="absolute transition-all duration-3000 ease-linear"
              style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%`, transform: "translate(-50%,-50%)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-lg animate-pulse-green"
                style={{ background: "white", border: "3px solid #16a34a" }}>
                🏍️
              </div>
            </div>

            <div className="absolute bottom-2 left-2 bg-white/90 rounded-lg px-2 py-1 text-xs font-medium shadow-sm flex items-center gap-1">
              <Navigation size={10} style={{ color: "#16a34a" }} />
              Live tracking active
            </div>
          </div>
          {currentRider?.location && (
            <div className="px-3 py-2 flex items-center gap-1.5 text-xs text-gray-400 border-t border-gray-50">
              <MapPin size={12} />
              {currentRider.location.lat?.toFixed(4)}, {currentRider.location.lng?.toFixed(4)}
            </div>
          )}
        </div>

        {/* Active orders */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Package size={18} style={{ color: "#16a34a" }} /> Active Deliveries ({activeOrders.length})
          </h2>
          {activeOrders.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="text-gray-500 text-sm">No active deliveries. Stand by!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeOrders.map((order: any) => {
                const addr = order.addressSnapshot ? JSON.parse(order.addressSnapshot) : null;
                return (
                  <div key={order.id} className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-gray-900">Order #{order.id}</p>
                      <span className="badge badge-orange text-xs">{order.status.replace(/_/g, " ")}</span>
                    </div>
                    {addr && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
                        <MapPin size={13} style={{ color: "#16a34a" }} />
                        {addr.street}, {addr.area || addr.city}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-3">
                      <Clock size={13} />
                      Placed: {new Date(order.createdAt).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div className="flex gap-2">
                      {order.status === "confirmed" && (
                        <button onClick={() => updateOrderStatus.mutate({ id: order.id, status: "preparing" })}
                          className="flex-1 text-sm font-medium py-2 rounded-xl transition-all"
                          style={{ background: "#f97316", color: "white" }}>
                          Start Preparing
                        </button>
                      )}
                      {order.status === "preparing" && (
                        <button onClick={() => updateOrderStatus.mutate({ id: order.id, status: "out_for_delivery" })}
                          className="flex-1 text-sm font-medium py-2 rounded-xl transition-all"
                          style={{ background: "#8b5cf6", color: "white" }}>
                          🚀 Start Delivery
                        </button>
                      )}
                      {order.status === "out_for_delivery" && (
                        <button onClick={() => updateOrderStatus.mutate({ id: order.id, status: "delivered" })}
                          className="flex-1 text-sm font-medium py-2 rounded-xl transition-all"
                          style={{ background: "#16a34a", color: "white" }}>
                          <CheckCircle size={14} className="inline mr-1" /> Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
