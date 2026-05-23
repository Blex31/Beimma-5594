import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { useRouter } from "expo-router";
import { Package, MapPin, RotateCcw, ChevronRight, Clock } from "lucide-react-native";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:    { label: "Pending",    color: "#d97706", bg: "#fef3c7" },
  confirmed:  { label: "Confirmed",  color: "#2563eb", bg: "#dbeafe" },
  picking:    { label: "Picking",    color: "#7c3aed", bg: "#ede9fe" },
  on_the_way: { label: "On the way", color: "#0891b2", bg: "#cffafe" },
  delivered:  { label: "Delivered",  color: "#16a34a", bg: "#dcfce7" },
  cancelled:  { label: "Cancelled",  color: "#dc2626", bg: "#fee2e2" },
};

function OrderCard({ order }: { order: any }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const sessionId = getSessionId();
  const cfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: "#6b7280", bg: "#f3f4f6" };
  const isActive = !["delivered", "cancelled"].includes(order.status);

  const reorder = useMutation({
    mutationFn: async () => {
      // Add each item back to cart
      for (const item of order.items ?? []) {
        await (api.cart[":sessionId"] as any).$post({
          param: { sessionId },
          json: { productId: item.productId, quantity: item.quantity },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      router.push("/(tabs)/cart" as any);
    },
  });

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <View style={{
      backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12,
      shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
    }}>
      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 15, fontWeight: "bold", color: "#111827" }}>
            Order #{order.id}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
            <Clock size={11} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: "#9ca3af" }}>{formatDate(order.createdAt)}</Text>
          </View>
        </View>
        <View style={{ backgroundColor: cfg.bg, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontSize: 12, fontWeight: "600", color: cfg.color }}>{cfg.label}</Text>
        </View>
      </View>

      {/* Items preview */}
      <View style={{ backgroundColor: "#f9fafb", borderRadius: 10, padding: 10, marginBottom: 12 }}>
        {(order.items ?? []).slice(0, 3).map((item: any, i: number) => (
          <Text key={i} style={{ fontSize: 13, color: "#374151", marginBottom: 2 }} numberOfLines={1}>
            {item.quantity}x {item.product?.name ?? `Product #${item.productId}`}
          </Text>
        ))}
        {(order.items?.length ?? 0) > 3 && (
          <Text style={{ fontSize: 12, color: "#9ca3af" }}>
            +{order.items.length - 3} more items
          </Text>
        )}
      </View>

      {/* Address */}
      {order.deliveryAddress && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 12 }}>
          <MapPin size={13} color="#9ca3af" />
          <Text style={{ fontSize: 12, color: "#6b7280", flex: 1 }} numberOfLines={1}>
            {order.deliveryAddress}
          </Text>
        </View>
      )}

      {/* Total */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 13, color: "#6b7280" }}>Total</Text>
        <Text style={{ fontSize: 15, fontWeight: "bold", color: "#16a34a" }}>
          KES {order.total}
        </Text>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        {isActive && (
          <TouchableOpacity
            onPress={() => router.push(`/track/${order.id}` as any)}
            style={{
              flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
              gap: 6, backgroundColor: "#16a34a", borderRadius: 10, paddingVertical: 10,
            }}
          >
            <MapPin size={14} color="white" />
            <Text style={{ color: "white", fontWeight: "600", fontSize: 13 }}>Track Order</Text>
            <ChevronRight size={14} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => reorder.mutate()}
          style={{
            flex: isActive ? 0 : 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
            gap: 6, backgroundColor: "#f3f4f6", borderRadius: 10, paddingVertical: 10,
            paddingHorizontal: isActive ? 14 : 0,
          }}
          disabled={reorder.isPending}
        >
          <RotateCcw size={14} color="#374151" />
          <Text style={{ color: "#374151", fontWeight: "600", fontSize: 13 }}>
            {reorder.isPending ? "Adding..." : "Reorder"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function OrdersScreen() {
  const sessionId = getSessionId();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["orders", sessionId],
    queryFn: async () => {
      const res = await api.orders.$get({ query: { sessionId } });
      return res.json();
    },
    refetchInterval: 15000, // Poll for status updates
  });

  const orders = (data as any) ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}>My Orders</Text>
        {orders.length > 0 && (
          <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </Text>
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      ) : orders.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{
            width: 80, height: 80, backgroundColor: "#dcfce7", borderRadius: 40,
            alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <Package size={36} color="#16a34a" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#374151", textAlign: "center" }}>
            No orders yet
          </Text>
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            Your order history will show up here
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)" as any)}
            style={{
              marginTop: 24, backgroundColor: "#16a34a", borderRadius: 12,
              paddingHorizontal: 24, paddingVertical: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
