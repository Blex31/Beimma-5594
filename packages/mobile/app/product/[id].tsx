import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ArrowLeft, Plus, Minus, ShoppingCart, Star, Zap } from "lucide-react-native";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const [qty, setQty] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const res = await api.products[":id"].$get({ param: { id: id! } });
      return res.json();
    },
    enabled: !!id,
  });

  const product = (data as any)?.product ?? data;

  const addToCart = useMutation({
    mutationFn: async () => {
      await (api.cart[":sessionId"] as any).$post({
        param: { sessionId },
        json: { productId: Number(id), quantity: qty },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      Alert.alert("Added to cart!", `${qty}x ${product?.name} added.`, [
        { text: "Continue Shopping", style: "cancel" },
        { text: "View Cart", onPress: () => router.push("/(tabs)/cart" as any) },
      ]);
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 16 }}>
          <ArrowLeft size={24} color="#111827" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ fontSize: 16, color: "#6b7280" }}>Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Back button */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          position: "absolute", top: 48, left: 16, zIndex: 10,
          width: 40, height: 40, backgroundColor: "white", borderRadius: 20,
          alignItems: "center", justifyContent: "center",
          shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
        }}
      >
        <ArrowLeft size={20} color="#111827" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image */}
        <View style={{ position: "relative" }}>
          <Image
            source={{ uri: product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=320&fit=crop" }}
            style={{ width: "100%", height: 280 }} resizeMode="cover"
          />
          {product.isFlashSale && (
            <View style={{
              position: "absolute", top: 16, right: 16,
              backgroundColor: "#f97316", borderRadius: 20,
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingHorizontal: 10, paddingVertical: 5,
            }}>
              <Zap size={12} color="white" />
              <Text style={{ color: "white", fontSize: 11, fontWeight: "bold" }}>FLASH SALE</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={{ backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -20, padding: 20 }}>
          {/* Category badge */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <View style={{ backgroundColor: "#dcfce7", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
              <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "500" }}>{product.category}</Text>
            </View>
            {!product.inStock && (
              <View style={{ backgroundColor: "#fee2e2", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 }}>
                <Text style={{ fontSize: 12, color: "#dc2626", fontWeight: "500" }}>Out of Stock</Text>
              </View>
            )}
          </View>

          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 6 }}>{product.name}</Text>
          <Text style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>per {product.unit}</Text>

          {/* Price */}
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: "bold", color: "#16a34a" }}>KES {product.price}</Text>
            {product.originalPrice && (
              <>
                <Text style={{ fontSize: 18, color: "#9ca3af", textDecorationLine: "line-through" }}>
                  KES {product.originalPrice}
                </Text>
                <View style={{ backgroundColor: "#fee2e2", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 12, color: "#ef4444", fontWeight: "bold" }}>-{discount}%</Text>
                </View>
              </>
            )}
          </View>

          {/* Description */}
          {product.description && (
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 8 }}>About this product</Text>
              <Text style={{ fontSize: 14, color: "#6b7280", lineHeight: 22 }}>{product.description}</Text>
            </View>
          )}

          {/* Info tiles */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
            {[
              { icon: "⚡", title: "30 min", sub: "Delivery" },
              { icon: "✅", title: "Fresh", sub: "Guaranteed" },
              { icon: "🔄", title: "Easy", sub: "Returns" },
            ].map((tile) => (
              <View key={tile.title} style={{
                flex: 1, backgroundColor: "#f8fafc", borderRadius: 12, padding: 12, alignItems: "center",
              }}>
                <Text style={{ fontSize: 20 }}>{tile.icon}</Text>
                <Text style={{ fontSize: 13, fontWeight: "600", color: "#111827", marginTop: 4 }}>{tile.title}</Text>
                <Text style={{ fontSize: 11, color: "#9ca3af" }}>{tile.sub}</Text>
              </View>
            ))}
          </View>

          {/* Spacer for bottom bar */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom bar */}
      {product.inStock && (
        <View style={{
          position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white",
          padding: 16, flexDirection: "row", alignItems: "center", gap: 12,
          borderTopWidth: 1, borderTopColor: "#f3f4f6",
          shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
        }}>
          {/* Qty control */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#f3f4f6", borderRadius: 12, padding: 6 }}>
            <TouchableOpacity
              onPress={() => setQty(Math.max(1, qty - 1))}
              style={{ width: 32, height: 32, backgroundColor: "white", borderRadius: 10, alignItems: "center", justifyContent: "center" }}
            >
              <Minus size={16} color="#374151" />
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827", minWidth: 24, textAlign: "center" }}>{qty}</Text>
            <TouchableOpacity
              onPress={() => setQty(qty + 1)}
              style={{ width: 32, height: 32, backgroundColor: "white", borderRadius: 10, alignItems: "center", justifyContent: "center" }}
            >
              <Plus size={16} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Add to cart */}
          <TouchableOpacity
            onPress={() => addToCart.mutate()}
            disabled={addToCart.isPending}
            style={{
              flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
              backgroundColor: "#16a34a", borderRadius: 12, paddingVertical: 14,
            }}
          >
            <ShoppingCart size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
              {addToCart.isPending ? "Adding..." : `Add to Cart · KES ${product.price * qty}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
