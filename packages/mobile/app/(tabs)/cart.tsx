import { View, Text, TouchableOpacity, FlatList, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { useRouter } from "expo-router";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react-native";

function CartItem({ item, sessionId }: { item: any; sessionId: string }) {
  const queryClient = useQueryClient();

  const updateQty = useMutation({
    mutationFn: async (quantity: number) => {
      const res = await (api.cart[":sessionId"][":itemId"] as any).$patch({
        param: { sessionId, itemId: item.id.toString() },
        json: { quantity },
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const remove = useMutation({
    mutationFn: async () => {
      await api.cart[":sessionId"][":itemId"].$delete({
        param: { sessionId, itemId: item.id.toString() },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  return (
    <View style={{
      flexDirection: "row", backgroundColor: "white", borderRadius: 14, padding: 12,
      marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
    }}>
      <Image
        source={{ uri: item.product?.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=100&h=100&fit=crop" }}
        style={{ width: 70, height: 70, borderRadius: 10 }} resizeMode="cover"
      />
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }} numberOfLines={2}>
          {item.product?.name}
        </Text>
        <Text style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          per {item.product?.unit}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: "bold", color: "#16a34a" }}>
            KES {(item.product?.price * item.quantity).toFixed(0)}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <TouchableOpacity
              onPress={() => item.quantity > 1 ? updateQty.mutate(item.quantity - 1) : remove.mutate()}
              style={{
                width: 28, height: 28, backgroundColor: "#f3f4f6", borderRadius: 14,
                alignItems: "center", justifyContent: "center",
              }}
              disabled={updateQty.isPending || remove.isPending}
            >
              <Minus size={14} color="#374151" />
            </TouchableOpacity>
            <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827", minWidth: 20, textAlign: "center" }}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => updateQty.mutate(item.quantity + 1)}
              style={{
                width: 28, height: 28, backgroundColor: "#16a34a", borderRadius: 14,
                alignItems: "center", justifyContent: "center",
              }}
              disabled={updateQty.isPending}
            >
              <Plus size={14} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => remove.mutate()}
              style={{
                width: 28, height: 28, backgroundColor: "#fee2e2", borderRadius: 14,
                alignItems: "center", justifyContent: "center", marginLeft: 4,
              }}
              disabled={remove.isPending}
            >
              <Trash2 size={14} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const sessionId = getSessionId();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => {
      const res = await api.cart[":sessionId"].$get({ param: { sessionId } });
      return res.json();
    },
  });

  const items = (data as any)?.items ?? [];
  const subtotal = items.reduce((sum: number, item: any) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const deliveryFee = subtotal >= 1000 ? 0 : 50;
  const total = subtotal + deliveryFee;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}>Cart</Text>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <View style={{
            width: 80, height: 80, backgroundColor: "#dcfce7", borderRadius: 40,
            alignItems: "center", justifyContent: "center", marginBottom: 16,
          }}>
            <ShoppingCart size={36} color="#16a34a" />
          </View>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#374151", textAlign: "center" }}>
            Your cart is empty
          </Text>
          <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 8, textAlign: "center" }}>
            Add products to get started with your grocery order
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/categories" as any)}
            style={{
              marginTop: 24, backgroundColor: "#16a34a", borderRadius: 12,
              paddingHorizontal: 24, paddingVertical: 14,
            }}
          >
            <Text style={{ color: "white", fontWeight: "600", fontSize: 15 }}>Browse Products</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827" }}>Cart</Text>
        <Text style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
          {items.length} item{items.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <CartItem item={item} sessionId={sessionId} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 240 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Summary + checkout */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white",
        borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20,
        shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 10,
      }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: "#6b7280" }}>Subtotal</Text>
          <Text style={{ fontSize: 14, color: "#111827", fontWeight: "500" }}>KES {subtotal}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
          <Text style={{ fontSize: 14, color: "#6b7280" }}>Delivery fee</Text>
          <Text style={{ fontSize: 14, color: deliveryFee === 0 ? "#16a34a" : "#111827", fontWeight: "500" }}>
            {deliveryFee === 0 ? "FREE" : `KES ${deliveryFee}`}
          </Text>
        </View>
        {subtotal < 1000 && (
          <View style={{
            backgroundColor: "#f0fdf4", borderRadius: 8, padding: 8, marginBottom: 8,
            flexDirection: "row", alignItems: "center",
          }}>
            <Text style={{ fontSize: 12, color: "#16a34a" }}>
              Add KES {1000 - subtotal} more for free delivery
            </Text>
          </View>
        )}
        <View style={{
          flexDirection: "row", justifyContent: "space-between",
          borderTopWidth: 1, borderTopColor: "#f3f4f6", paddingTop: 12, marginBottom: 16,
        }}>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}>Total</Text>
          <Text style={{ fontSize: 16, fontWeight: "bold", color: "#16a34a" }}>KES {total}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/checkout" as any)}
          style={{
            backgroundColor: "#16a34a", borderRadius: 14, paddingVertical: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
            Proceed to Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
