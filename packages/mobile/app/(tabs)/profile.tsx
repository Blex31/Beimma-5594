import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { api, getSessionId } from "../../lib/api";
import { useRouter } from "expo-router";
import { MapPin, Tag, Package, ChevronRight, Phone, Mail, Info, Star } from "lucide-react-native";

const PROMO_COLORS = ["#dcfce7", "#dbeafe", "#fef3c7", "#fce7f3", "#ede9fe"];
const PROMO_TEXT_COLORS = ["#16a34a", "#2563eb", "#d97706", "#be185d", "#7c3aed"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
        {title}
      </Text>
      <View style={{
        backgroundColor: "white", borderRadius: 14,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        overflow: "hidden",
      }}>
        {children}
      </View>
    </View>
  );
}

function NavItem({ icon, label, onPress, last = false }: { icon: React.ReactNode; label: string; onPress: () => void; last?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: "#f3f4f6",
      }}
    >
      <View style={{ marginRight: 12 }}>{icon}</View>
      <Text style={{ flex: 1, fontSize: 15, color: "#111827" }}>{label}</Text>
      <ChevronRight size={16} color="#9ca3af" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const sessionId = getSessionId();
  const router = useRouter();

  const { data: ordersData } = useQuery({
    queryKey: ["orders", sessionId],
    queryFn: async () => {
      const res = await api.orders.$get({ query: { sessionId } });
      return res.json();
    },
  });

  const { data: promosData } = useQuery({
    queryKey: ["promos"],
    queryFn: async () => {
      const res = await api.promos.$get();
      return res.json();
    },
  });

  const orders = (ordersData as any) ?? [];
  const promos = (promosData as any) ?? [];
  const delivered = orders.filter((o: any) => o.status === "delivered").length;
  const active = orders.filter((o: any) => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        <Text style={{ fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 20 }}>Profile</Text>

        {/* Stats */}
        <View style={{
          flexDirection: "row", gap: 12, marginBottom: 24,
        }}>
          {[
            { label: "Total Orders", value: orders.length, icon: "📦" },
            { label: "Delivered", value: delivered, icon: "✅" },
            { label: "Active", value: active, icon: "🚴" },
          ].map((stat) => (
            <View key={stat.label} style={{
              flex: 1, backgroundColor: "white", borderRadius: 14, padding: 14, alignItems: "center",
              shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
            }}>
              <Text style={{ fontSize: 22 }}>{stat.icon}</Text>
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", marginTop: 4 }}>{stat.value}</Text>
              <Text style={{ fontSize: 11, color: "#6b7280", textAlign: "center", marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Promo Codes */}
        {promos.length > 0 && (
          <Section title="Available Promos">
            {promos.map((promo: any, i: number) => (
              <View key={promo.id} style={{
                flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
                borderBottomWidth: i < promos.length - 1 ? 1 : 0, borderBottomColor: "#f3f4f6",
              }}>
                <View style={{
                  backgroundColor: PROMO_COLORS[i % PROMO_COLORS.length], borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 6, marginRight: 12,
                }}>
                  <Text style={{
                    fontSize: 13, fontWeight: "bold",
                    color: PROMO_TEXT_COLORS[i % PROMO_TEXT_COLORS.length],
                    fontFamily: "monospace",
                  }}>{promo.code}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#111827" }}>
                    {promo.discountType === "percentage"
                      ? `${promo.discountValue}% off`
                      : `KES ${promo.discountValue} off`}
                  </Text>
                  {promo.minOrder > 0 && (
                    <Text style={{ fontSize: 12, color: "#9ca3af" }}>Min. order KES {promo.minOrder}</Text>
                  )}
                </View>
                <Tag size={16} color="#9ca3af" />
              </View>
            ))}
          </Section>
        )}

        {/* Quick links */}
        <Section title="My Account">
          <NavItem
            icon={<Package size={18} color="#16a34a" />}
            label="My Orders"
            onPress={() => router.push("/(tabs)/orders" as any)}
          />
          <NavItem
            icon={<MapPin size={18} color="#16a34a" />}
            label="Saved Addresses"
            onPress={() => Alert.alert("Addresses", "Manage your delivery addresses")}
          />
          <NavItem
            icon={<Star size={18} color="#16a34a" />}
            label="Flash Deals"
            onPress={() => router.push("/(tabs)" as any)}
            last
          />
        </Section>

        <Section title="Support">
          <NavItem
            icon={<Phone size={18} color="#6b7280" />}
            label="Call Us: +254 700 123 456"
            onPress={() => Alert.alert("Call", "Dial +254 700 123 456")}
          />
          <NavItem
            icon={<Mail size={18} color="#6b7280" />}
            label="Email: hello@darco.co.ke"
            onPress={() => Alert.alert("Email", "hello@darco.co.ke")}
          />
          <NavItem
            icon={<Info size={18} color="#6b7280" />}
            label="About Darco"
            onPress={() => Alert.alert("About", "Darco — Groceries in 30 minutes.\nFresh. Fast. Reliable.")}
            last
          />
        </Section>

        {/* App version */}
        <View style={{ alignItems: "center", paddingVertical: 8 }}>
          <Text style={{ fontSize: 12, color: "#d1d5db" }}>Darco v1.0.0 · Made in Kenya 🇰🇪</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
