import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, MapPin, Phone, Package, CheckCircle, Clock, Bike } from "lucide-react-native";

const { width: SCREEN_W } = Dimensions.get("window");
const MAP_H = 220;

const STATUS_STEPS = [
  { key: "pending",    icon: "🛒", label: "Order Placed" },
  { key: "confirmed", icon: "✅", label: "Confirmed" },
  { key: "picking",   icon: "📦", label: "Picking Items" },
  { key: "on_the_way",icon: "🚴", label: "On the Way" },
  { key: "delivered", icon: "🎉", label: "Delivered!" },
];

const STATUS_ORDER = ["pending", "confirmed", "picking", "on_the_way", "delivered"];

interface RiderPos { x: number; y: number }

function SimulatedMap({ status }: { status: string }) {
  const mapW = SCREEN_W - 32;
  // Rider moves from top-left corner toward the delivery pin in center-right
  const destination: RiderPos = { x: mapW * 0.68, y: MAP_H * 0.48 };
  const origin: RiderPos = { x: mapW * 0.12, y: MAP_H * 0.18 };

  const progress = STATUS_ORDER.indexOf(status) / (STATUS_ORDER.length - 1);
  const riderPos: RiderPos = {
    x: origin.x + (destination.x - origin.x) * Math.min(progress * 1.3, 0.95),
    y: origin.y + (destination.y - origin.y) * Math.min(progress * 1.3, 0.95),
  };

  const isDelivered = status === "delivered";

  return (
    <View style={{
      width: mapW, height: MAP_H, backgroundColor: "#e8f5e9", borderRadius: 16, overflow: "hidden",
      borderWidth: 1, borderColor: "#c8e6c9",
    }}>
      {/* Grid lines */}
      {[0.25, 0.5, 0.75].map((p) => (
        <View key={`h${p}`} style={{
          position: "absolute", left: 0, right: 0, top: MAP_H * p, height: 1, backgroundColor: "#c8e6c9",
        }} />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((p) => (
        <View key={`v${p}`} style={{
          position: "absolute", top: 0, bottom: 0, left: mapW * p, width: 1, backgroundColor: "#c8e6c9",
        }} />
      ))}

      {/* Streets */}
      <View style={{ position: "absolute", top: MAP_H * 0.48 - 5, left: 0, right: 0, height: 10, backgroundColor: "#a5d6a7", opacity: 0.7 }} />
      <View style={{ position: "absolute", left: mapW * 0.45 - 5, top: 0, bottom: 0, width: 10, backgroundColor: "#a5d6a7", opacity: 0.7 }} />

      {/* Origin — warehouse */}
      <View style={{ position: "absolute", left: origin.x - 14, top: origin.y - 14 }}>
        <View style={{
          width: 28, height: 28, backgroundColor: "#1565c0", borderRadius: 6,
          alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "white",
        }}>
          <Text style={{ fontSize: 14 }}>🏪</Text>
        </View>
      </View>

      {/* Route line */}
      <View style={{
        position: "absolute",
        left: origin.x, top: origin.y,
        width: Math.sqrt(Math.pow(riderPos.x - origin.x, 2) + Math.pow(riderPos.y - origin.y, 2)),
        height: 3,
        backgroundColor: "#16a34a",
        transform: [{
          rotate: `${Math.atan2(riderPos.y - origin.y, riderPos.x - origin.x) * (180 / Math.PI)}deg`,
        }],
        transformOrigin: "left center",
        opacity: 0.7,
      }} />

      {/* Rider */}
      {!isDelivered && (
        <View style={{ position: "absolute", left: riderPos.x - 16, top: riderPos.y - 16 }}>
          <View style={{
            width: 32, height: 32, backgroundColor: "#f97316", borderRadius: 16,
            alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "white",
            shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
          }}>
            <Text style={{ fontSize: 16 }}>🚴</Text>
          </View>
        </View>
      )}

      {/* Destination pin */}
      <View style={{ position: "absolute", left: destination.x - 12, top: destination.y - 28 }}>
        <View style={{
          backgroundColor: "#dc2626", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2,
          borderWidth: 2, borderColor: "white",
        }}>
          <Text style={{ fontSize: 10, color: "white", fontWeight: "bold" }}>YOU</Text>
        </View>
        <View style={{ width: 2, height: 8, backgroundColor: "#dc2626", alignSelf: "center" }} />
      </View>

      {isDelivered && (
        <View style={{
          position: "absolute", inset: 0, top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(22,163,74,0.15)", alignItems: "center", justifyContent: "center",
        }}>
          <Text style={{ fontSize: 40 }}>🎉</Text>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#16a34a" }}>Delivered!</Text>
        </View>
      )}

      {/* ETA chip */}
      {!isDelivered && (
        <View style={{
          position: "absolute", bottom: 10, right: 10,
          backgroundColor: "white", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5,
          flexDirection: "row", alignItems: "center", gap: 4,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
        }}>
          <Clock size={12} color="#16a34a" />
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#374151" }}>
            {status === "pending" ? "~35 min" : status === "confirmed" ? "~28 min" : status === "picking" ? "~20 min" : "~10 min"}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TrackScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const res = await api.orders[":id"].$get({ param: { id: id! } });
      return res.json();
    },
    enabled: !!id,
    refetchInterval: (query) => {
      const order = (query.state.data as any)?.order ?? query.state.data;
      if (order?.status === "delivered" || order?.status === "cancelled") return false;
      return 8000;
    },
  });

  const order = (data as any)?.order ?? data;
  const status = order?.status ?? "pending";
  const currentIdx = STATUS_ORDER.indexOf(status);

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  if (!order) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 16, color: "#6b7280" }}>Order not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/orders" as any)}
          style={{ width: 36, height: 36, backgroundColor: "white", borderRadius: 18, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={18} color="#111827" />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#111827" }}>Track Order</Text>
          <Text style={{ fontSize: 12, color: "#6b7280" }}>Order #{order.id}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Map */}
        <View style={{ marginBottom: 20 }}>
          <SimulatedMap status={status} />
        </View>

        {/* Status steps */}
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 16 }}>Order Status</Text>
          {STATUS_STEPS.map((step, i) => {
            const done = i <= currentIdx;
            const active = i === currentIdx;
            return (
              <View key={step.key} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: i < STATUS_STEPS.length - 1 ? 4 : 0 }}>
                <View style={{ alignItems: "center", marginRight: 12 }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: done ? "#16a34a" : "#f3f4f6",
                    alignItems: "center", justifyContent: "center",
                    borderWidth: active ? 2 : 0, borderColor: "#16a34a",
                  }}>
                    <Text style={{ fontSize: 16 }}>{step.icon}</Text>
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View style={{ width: 2, height: 24, backgroundColor: done ? "#16a34a" : "#e5e7eb", marginVertical: 2 }} />
                  )}
                </View>
                <View style={{ paddingTop: 6 }}>
                  <Text style={{
                    fontSize: 14, fontWeight: active ? "700" : "500",
                    color: done ? "#111827" : "#9ca3af",
                  }}>{step.label}</Text>
                  {active && status !== "delivered" && (
                    <Text style={{ fontSize: 12, color: "#16a34a", marginTop: 2 }}>In progress...</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Rider card */}
        {["on_the_way", "picking"].includes(status) && (
          <View style={{
            backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
          }}>
            <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 12 }}>Your Rider</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={{
                width: 50, height: 50, backgroundColor: "#dcfce7", borderRadius: 25,
                alignItems: "center", justifyContent: "center",
              }}>
                <Text style={{ fontSize: 24 }}>🏍️</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>James Kamau</Text>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>⭐ 4.9 · KBZ 234R</Text>
              </View>
              <TouchableOpacity style={{
                width: 40, height: 40, backgroundColor: "#16a34a", borderRadius: 20,
                alignItems: "center", justifyContent: "center",
              }}>
                <Phone size={18} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order summary */}
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827", marginBottom: 12 }}>Order Details</Text>
          {(order.items ?? []).map((item: any, i: number) => (
            <View key={i} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: "#374151" }}>
                {item.quantity}x {item.product?.name ?? `Item #${item.productId}`}
              </Text>
              <Text style={{ fontSize: 13, color: "#374151" }}>
                KES {((item.product?.price ?? 0) * item.quantity).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: "#111827" }}>Total</Text>
            <Text style={{ fontSize: 14, fontWeight: "bold", color: "#16a34a" }}>KES {order.total}</Text>
          </View>
          {order.deliveryAddress && (
            <View style={{ flexDirection: "row", gap: 6, marginTop: 10, alignItems: "center" }}>
              <MapPin size={13} color="#9ca3af" />
              <Text style={{ fontSize: 13, color: "#6b7280", flex: 1 }}>{order.deliveryAddress}</Text>
            </View>
          )}
        </View>

        {status === "delivered" && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)" as any)}
            style={{
              backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16,
              alignItems: "center", marginBottom: 16,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>Shop Again</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
