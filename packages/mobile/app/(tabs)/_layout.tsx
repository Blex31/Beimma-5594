import { Tabs } from "expo-router";
import { Home, Grid3x3, ShoppingCart, Package, User } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { View, Text } from "react-native";

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const sessionId = getSessionId();
  const { data } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (await api.cart[":sessionId"].$get({ param: { sessionId } })).json(),
    refetchInterval: 5000,
  });
  const count = data?.items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0;
  return (
    <View style={{ position: "relative" }}>
      <ShoppingCart color={color} size={size} />
      {count > 0 && (
        <View style={{ position: "absolute", top: -6, right: -8, backgroundColor: "#f97316", borderRadius: 10, minWidth: 16, height: 16, alignItems: "center", justifyContent: "center", paddingHorizontal: 3 }}>
          <Text style={{ color: "white", fontSize: 9, fontWeight: "bold" }}>{count > 9 ? "9+" : count}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#f3f4f6",
          paddingTop: 4,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="categories" options={{ title: "Categories", tabBarIcon: ({ color, size }) => <Grid3x3 color={color} size={size} /> }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: (props) => <CartTabIcon {...props} /> }} />
      <Tabs.Screen name="orders" options={{ title: "Orders", tabBarIcon: ({ color, size }) => <Package color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
    </Tabs>
  );
}
