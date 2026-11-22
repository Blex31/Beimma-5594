import { View, Text, TextInput, TouchableOpacity, FlatList, Image, ActivityIndicator, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { useRouter } from "expo-router";
import { useState, useCallback } from "react";
import { Search, Plus, X } from "lucide-react-native";

const CATEGORIES = [
  "All", "Fruits", "Vegetables", "Dairy", "Bakery",
  "Meat", "Beverages", "Snacks", "Frozen", "Pantry", "Personal Care"
];

const CAT_ICONS: Record<string, string> = {
  All: "🛒", Fruits: "🍎", Vegetables: "🥦", Dairy: "🥛", Bakery: "🍞",
  Meat: "🥩", Beverages: "🧃", Snacks: "🍿", Frozen: "🧊",
  Pantry: "🫙", "Personal Care": "🧴"
};

function ProductCard({ product }: { product: any }) {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const router = useRouter();

  const addToCart = useMutation({
    mutationFn: async () => {
      await (api.cart[":sessionId"] as any).$post({
        param: { sessionId },
        json: { productId: product.id, quantity: 1 },
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart", sessionId] }),
  });

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/product/${product.id}` as any)}
      style={{
        flex: 1, backgroundColor: "white", borderRadius: 14, overflow: "hidden", margin: 5,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
      }}
    >
      <View style={{ position: "relative" }}>
        <Image
          source={{ uri: product.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=140&fit=crop" }}
          style={{ width: "100%", height: 110 }} resizeMode="cover"
        />
        {discount > 0 && (
          <View style={{
            position: "absolute", top: 6, left: 6, backgroundColor: "#ef4444",
            borderRadius: 20, paddingHorizontal: 6, paddingVertical: 2,
          }}>
            <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>-{discount}%</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={{
            position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.4)",
            alignItems: "center", justifyContent: "center",
            top: 0, left: 0, right: 0, bottom: 0,
          }}>
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 11 }}>Out of Stock</Text>
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
              <Text style={{ fontSize: 10, color: "#9ca3af", textDecorationLine: "line-through" }}>
                KES {product.originalPrice}
              </Text>
            )}
          </View>
          {product.inStock && (
            <TouchableOpacity
              onPress={(e) => { e.stopPropagation?.(); addToCart.mutate(); }}
              style={{
                width: 28, height: 28, backgroundColor: "#16a34a", borderRadius: 14,
                alignItems: "center", justifyContent: "center",
              }}
              disabled={addToCart.isPending}
            >
              <Plus size={16} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function CategoriesScreen() {
  const [query, setQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
 
  const { data, isLoading } = useQuery({
    queryKey: ["products", selectedCat, query],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (selectedCat !== "All") params.category = selectedCat;
      if (query.trim()) params.search = query.trim();
      const res = await api.products.$get({ query: params });
      return res.json();
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (error) {
      console.error("Failed to refresh categories screen:", error);
    } finally {
      setRefreshing(false);
    }
  }, [queryClient]);
 
  const products = (data as any)?.products ?? [];
 
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 12 }}>Browse</Text>
 
        {/* Search */}
        <View style={{
          flexDirection: "row", alignItems: "center", backgroundColor: "white",
          borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
        }}>
          <Search size={16} color="#9ca3af" />
          <TextInput
            style={{ flex: 1, marginLeft: 8, fontSize: 14, color: "#111827" }}
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <X size={14} color="#9ca3af" />
            </TouchableOpacity>
          )}
        </View>
      </View>
 
      {/* Category pills */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12, gap: 8 }}
        style={{ flexGrow: 0 }}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setSelectedCat(cat)}
            style={{
              flexDirection: "row", alignItems: "center", gap: 4,
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
              backgroundColor: selectedCat === cat ? "#16a34a" : "white",
              borderWidth: 1, borderColor: selectedCat === cat ? "#16a34a" : "#e5e7eb",
            }}
          >
            <Text style={{ fontSize: 14 }}>{CAT_ICONS[cat]}</Text>
            <Text style={{
              fontSize: 13, fontWeight: "500",
              color: selectedCat === cat ? "white" : "#374151",
            }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
 
      {/* Results count */}
      {!isLoading && (
        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
          <Text style={{ fontSize: 13, color: "#6b7280" }}>
            {products.length} product{products.length !== 1 ? "s" : ""}
            {selectedCat !== "All" ? ` in ${selectedCat}` : ""}
            {query ? ` for "${query}"` : ""}
          </Text>
        </View>
      )}
 
      {/* Product grid */}
      <FlatList
        data={isLoading ? [] : products}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={{ paddingHorizontal: 11, paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          isLoading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 }}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32, paddingTop: 80 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: "600", color: "#374151", textAlign: "center" }}>
                No products found
              </Text>
              <Text style={{ fontSize: 14, color: "#9ca3af", marginTop: 4, textAlign: "center" }}>
                Try a different category or search term
              </Text>
            </View>
          )
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} tintColor="#16a34a" />
        }
      />
    </SafeAreaView>
  );
}
