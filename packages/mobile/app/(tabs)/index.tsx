import { useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { useRouter } from "expo-router";
import { Search, Zap, Star, Plus, ChevronRight } from "lucide-react-native";

const CAT_ICONS: Record<string, string> = {
  Fruits: "🍎", Vegetables: "🥦", Dairy: "🥛", Bakery: "🍞",
  Meat: "🥩", Beverages: "🧃", Snacks: "🍿", Frozen: "🧊",
  Pantry: "🫙", "Personal Care": "🧴"
};

function ProductCard({ product }: { product: any }) {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const router = useRouter();

  const addToCart = useMutation({
    mutationFn: async () => {
      await (api.cart[":sessionId"] as any).$post({ param: { sessionId }, json: { productId: product.id, quantity: 1 } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <TouchableOpacity onPress={() => router.push(`/product/${product.id}` as any)}
      style={{ width: 160, backgroundColor: "white", borderRadius: 16, overflow: "hidden", marginRight: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 }}>
      <View style={{ position: "relative" }}>
        <Image source={{ uri: product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=160&fit=crop" }}
          style={{ width: "100%", height: 120 }} resizeMode="cover" />
        {product.isFlashSale && (
          <View style={{ position: "absolute", top: 6, left: 6, backgroundColor: "#f97316", borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>SALE</Text>
          </View>
        )}
        {discount > 0 && !product.isFlashSale && (
          <View style={{ position: "absolute", top: 6, left: 6, backgroundColor: "#ef4444", borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2 }}>
            <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>-{discount}%</Text>
          </View>
        )}
      </View>
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 12, fontWeight: "600", color: "#111827" }} numberOfLines={2}>{product.name}</Text>
        <Text style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>per {product.unit}</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <View>
            <Text style={{ fontSize: 13, fontWeight: "bold", color: "#16a34a" }}>KES {product.price}</Text>
            {product.originalPrice && (
              <Text style={{ fontSize: 10, color: "#9ca3af", textDecorationLine: "line-through" }}>KES {product.originalPrice}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => addToCart.mutate()}
            style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: addToCart.isPending ? "#86efac" : "#16a34a", alignItems: "center", justifyContent: "center" }}>
            <Plus color="white" size={16} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await api.categories.$get()).json(),
  });

  const { data: bestSellers, isLoading } = useQuery({
    queryKey: ["products", "bestSeller"],
    queryFn: async () => (await api.products.$get({ query: { bestSeller: "true" } })).json(),
  });

  const { data: flashSales } = useQuery({
    queryKey: ["products", "flashSale"],
    queryFn: async () => (await api.products.$get({ query: { flashSale: "true" } })).json(),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["categories"] }),
        queryClient.invalidateQueries({ queryKey: ["products", "bestSeller"] }),
        queryClient.invalidateQueries({ queryKey: ["products", "flashSale"] }),
      ]);
    } catch (error) {
      console.error("Failed to refresh home screen:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);

  const categories = catData?.categories || [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }} edges={["top", "left", "right"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} tintColor="#16a34a" />
        }
      >
        {/* Header */}
        <View style={{ backgroundColor: "#16a34a", paddingHorizontal: 16, paddingBottom: 20, paddingTop: 8 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View>
              <Text style={{ color: "#bbf7d0", fontSize: 12 }}>Deliver to</Text>
              <Text style={{ color: "white", fontSize: 15, fontWeight: "bold" }}>Nairobi, Kenya 📍</Text>
            </View>
            <View style={{ backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
              <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>⚡ 30 min</Text>
            </View>
          </View>
          {/* Search */}
          <TouchableOpacity onPress={() => router.push("/categories" as any)}
            style={{ backgroundColor: "white", borderRadius: 50, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10 }}>
            <Search color="#9ca3af" size={16} />
            <Text style={{ color: "#9ca3af", fontSize: 13, marginLeft: 8 }}>Search groceries...</Text>
          </TouchableOpacity>
        </View>

        <View style={{ padding: 16 }}>
          {/* Promo Banner */}
          <View style={{ backgroundColor: "#f97316", borderRadius: 16, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View>
              <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginBottom: 3 }}>LIMITED TIME</Text>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>20% OFF with</Text>
              <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>WELCOME20</Text>
            </View>
            <Text style={{ fontSize: 48 }}>🎉</Text>
          </View>

          {/* Categories */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ fontSize: 17, fontWeight: "bold", color: "#111827" }}>Categories</Text>
            <TouchableOpacity onPress={() => router.push("/categories" as any)}>
              <Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>See all →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
            {categories.slice(0, 8).map((cat: any) => (
              <TouchableOpacity key={cat.id} onPress={() => router.push(`/categories?categoryId=${cat.id}` as any)}
                style={{ alignItems: "center", marginRight: 16 }}>
                <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#dcfce7", alignItems: "center", justifyContent: "center", marginBottom: 4, borderWidth: 1.5, borderColor: "#bbf7d0" }}>
                  <Text style={{ fontSize: 24 }}>{CAT_ICONS[cat.name] || "🛒"}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: "600", color: "#374151", textAlign: "center" }}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Flash Sales */}
          {(flashSales as any)?.products?.length > 0 && (
            <View style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Zap color="#f97316" size={18} />
                  <Text style={{ fontSize: 17, fontWeight: "bold", color: "#111827" }}>Flash Sales</Text>
                </View>
                <TouchableOpacity><Text style={{ fontSize: 12, color: "#16a34a", fontWeight: "600" }}>See all →</Text></TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(flashSales as any)?.products?.slice(0, 5).map((p: any) => <ProductCard key={p.id} product={p} />)}
              </ScrollView>
            </View>
          )}

          {/* Best Sellers */}
          <View style={{ marginBottom: 20 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Star color="#f59e0b" fill="#f59e0b" size={18} />
                <Text style={{ fontSize: 17, fontWeight: "bold", color: "#111827" }}>Best Sellers</Text>
              </View>
            </View>
            {isLoading ? <ActivityIndicator color="#16a34a" /> : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(bestSellers?.products || []).slice(0, 8).map((p: any) => <ProductCard key={p.id} product={p} />)}
              </ScrollView>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
