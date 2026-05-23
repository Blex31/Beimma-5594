import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { Layout } from "../components/Layout";
import { useParams, Link } from "wouter";
import { useEffect, useState } from "react";
import { Phone, Star, Package, Truck, CheckCircle, Clock, ChefHat } from "lucide-react";

const STATUS_STEPS = [
  { key: "confirmed", label: "Order Confirmed", icon: <CheckCircle size={16} />, color: "#16a34a" },
  { key: "preparing", label: "Preparing Order", icon: <ChefHat size={16} />, color: "#f97316" },
  { key: "out_for_delivery", label: "Out for Delivery", icon: <Truck size={16} />, color: "#0284c7" },
  { key: "delivered", label: "Delivered!", icon: <Package size={16} />, color: "#16a34a" },
];

function SimulatedMap({ rider, order }: { rider: any; order: any }) {
  const [riderPos, setRiderPos] = useState({ x: 20, y: 70 });
  const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!rider || order?.status === "delivered") return;
    const interval = setInterval(() => {
      setRiderPos(prev => {
        const target = { x: 75, y: 30 }; // destination
        const newX = prev.x + (target.x - prev.x) * 0.08 + (Math.random() - 0.5) * 3;
        const newY = prev.y + (target.y - prev.y) * 0.08 + (Math.random() - 0.5) * 3;
        const clamped = { x: Math.max(5, Math.min(90, newX)), y: Math.max(5, Math.min(90, newY)) };
        setTrail(t => [...t.slice(-8), clamped]);
        return clamped;
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [rider, order?.status]);

  return (
    <div className="map-container w-full" style={{ height: "280px" }}>
      <div className="map-grid" />
      {/* Roads */}
      <div className="map-road-h" style={{ top: "40%" }} />
      <div className="map-road-h" style={{ top: "70%" }} />
      <div className="map-road-v" style={{ left: "30%" }} />
      <div className="map-road-v" style={{ left: "65%" }} />

      {/* Trail */}
      {trail.map((p, i) => (
        <div key={i} className="absolute w-1.5 h-1.5 rounded-full"
          style={{ left: `${p.x}%`, top: `${p.y}%`, background: "rgba(22,163,74,0.4)", transform: "translate(-50%,-50%)" }} />
      ))}

      {/* Rider dot */}
      {rider && (
        <div className="absolute transition-all duration-1000 ease-out"
          style={{ left: `${riderPos.x}%`, top: `${riderPos.y}%`, transform: "translate(-50%,-100%)" }}>
          <div className="flex flex-col items-center">
            <div className="bg-white rounded-full px-2 py-0.5 text-xs font-semibold shadow-md mb-1 whitespace-nowrap" style={{ color: "#16a34a" }}>
              🏍️ {rider.name?.split(" ")[0]}
            </div>
            <div className="w-4 h-4 rounded-full shadow-lg animate-pulse-green" style={{ background: "#16a34a" }} />
          </div>
        </div>
      )}

      {/* Destination */}
      <div className="absolute" style={{ left: "75%", top: "30%", transform: "translate(-50%,-100%)" }}>
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold bg-white rounded-full px-2 py-0.5 shadow-md mb-1" style={{ color: "#f97316" }}>📍 Your Location</div>
          <div className="w-4 h-4 rounded-full" style={{ background: "#f97316" }} />
        </div>
      </div>

      {/* Store */}
      <div className="absolute" style={{ left: "20%", top: "70%", transform: "translate(-50%,-100%)" }}>
        <div className="flex flex-col items-center">
          <div className="text-xs font-semibold bg-white rounded-full px-2 py-0.5 shadow-md mb-1">🏪 Darco Store</div>
          <div className="w-3 h-3 rounded-full bg-gray-400" />
        </div>
      </div>

      {/* ETA badge */}
      <div className="absolute bottom-3 right-3 bg-white rounded-xl px-3 py-2 shadow-md flex items-center gap-2">
        <Clock size={14} style={{ color: "#16a34a" }} />
        <span className="text-xs font-bold text-gray-900">~{Math.max(2, Math.round(30 - (trail.length * 2)))} min</span>
      </div>
    </div>
  );
}

export default function TrackPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => (await api.orders[":id"].$get({ param: { id } })).json(),
    refetchInterval: 5000,
  });

  // Simulate order status progression
  const advanceStatus = useMutation({
    mutationFn: async (status: string) => {
      await api.orders[":id"].status.$patch({ param: { id }, json: { status } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["order", id] }),
  });

  const nextStatusMap: Record<string, string> = {
    confirmed: "preparing",
    preparing: "out_for_delivery",
    out_for_delivery: "delivered",
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!data?.order) {
    return (
      <Layout>
        <div className="text-center py-20">
          <div className="text-5xl mb-4">❓</div>
          <p className="text-gray-500">Order not found</p>
          <Link to="/orders"><button className="btn-primary mt-4">View Orders</button></Link>
        </div>
      </Layout>
    );
  }

  const { order, rider, items } = data;
  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === order.status);

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
            <p className="text-gray-500 text-sm">Placed {new Date(order.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
          </div>
          {order.status !== "delivered" && nextStatusMap[order.status] && (
            <button onClick={() => advanceStatus.mutate(nextStatusMap[order.status])}
              className="btn-outline text-xs px-3 py-2" style={{ borderColor: "#16a34a", color: "#16a34a" }}>
              Simulate Next
            </button>
          )}
        </div>

        {/* Map */}
        {(order.status === "out_for_delivery" || order.status === "preparing") && (
          <div className="mb-5 animate-fade-up">
            <SimulatedMap rider={rider} order={order} />
          </div>
        )}

        {/* Status Steps */}
        <div className="card p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
          <div className="space-y-4">
            {STATUS_STEPS.map((step, i) => {
              const isDone = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ background: isDone ? step.color : "#f3f4f6", color: isDone ? "white" : "#9ca3af" }}>
                    {step.icon}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-semibold ${isDone ? "text-gray-900" : "text-gray-400"}`}>{step.label}</p>
                    {isCurrent && <p className="text-xs text-green-600 font-medium">In progress...</p>}
                  </div>
                  {isDone && <CheckCircle size={16} style={{ color: step.color }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Rider info */}
        {rider && order.status !== "delivered" && (
          <div className="card p-5 mb-5 flex items-center gap-4 animate-fade-up">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl" style={{ background: "#dcfce7" }}>
              🏍️
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900">{rider.name}</p>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Star size={12} fill="#f59e0b" color="#f59e0b" />
                <span>{rider.rating}</span>
                <span className="mx-1">·</span>
                <span>{rider.vehicleType}</span>
                <span className="mx-1">·</span>
                <span>{rider.vehiclePlate}</span>
              </div>
            </div>
            <a href={`tel:${rider.phone}`}>
              <button className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#dcfce7" }}>
                <Phone size={18} style={{ color: "#16a34a" }} />
              </button>
            </a>
          </div>
        )}

        {/* Order items */}
        <div className="card p-5 mb-5">
          <h3 className="font-bold text-gray-900 mb-3">Items Ordered</h3>
          <div className="space-y-2">
            {items?.map((item: any) => {
              const snap = item.productSnapshot ? JSON.parse(item.productSnapshot) : {};
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#16a34a" }}>
                      {item.quantity}
                    </span>
                    <span className="text-gray-700">{snap.name || `Product #${item.productId}`}</span>
                  </div>
                  <span className="font-medium text-gray-900">KES {(item.price * item.quantity).toFixed(0)}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t mt-3 pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>KES {order.subtotal?.toFixed(0)}</span></div>
            <div className="flex justify-between text-gray-500"><span>Delivery</span><span>KES {order.deliveryFee?.toFixed(0)}</span></div>
            {order.discount > 0 && <div className="flex justify-between text-green-700"><span>Discount</span><span>-KES {order.discount?.toFixed(0)}</span></div>}
            <div className="flex justify-between font-bold text-base pt-1 border-t"><span>Total</span><span style={{ color: "#16a34a" }}>KES {order.total?.toFixed(0)}</span></div>
          </div>
        </div>

        <Link to="/orders">
          <button className="btn-outline w-full">View All Orders</button>
        </Link>
      </div>
    </Layout>
  );
}
