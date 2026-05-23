import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../lib/api";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ArrowLeft, MapPin, Tag, Clock, CheckCircle } from "lucide-react-native";

const ADDRESSES = [
  "Westlands, Nairobi",
  "Kilimani, Nairobi",
  "Karen, Nairobi",
  "Lavington, Nairobi",
  "Parklands, Nairobi",
];

const TIME_SLOTS = [
  { label: "ASAP (~30 min)", value: "asap" },
  { label: "In 1 hour", value: "1h" },
  { label: "In 2 hours", value: "2h" },
  { label: "Tomorrow morning", value: "tomorrow" },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const sessionId = getSessionId();
  const queryClient = useQueryClient();

  const [address, setAddress] = useState(ADDRESSES[0]);
  const [customAddress, setCustomAddress] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<any>(null);
  const [promoError, setPromoError] = useState("");
  const [timeSlot, setTimeSlot] = useState("asap");

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

  const promoDiscount = appliedPromo
    ? appliedPromo.discountType === "percentage"
      ? Math.round(subtotal * appliedPromo.discountValue / 100)
      : Math.min(appliedPromo.discountValue, subtotal)
    : 0;

  const total = subtotal + deliveryFee - promoDiscount;

  const applyPromo = useMutation({
    mutationFn: async () => {
      const res = await api.promos.validate.$post({ json: { code: promoCode, orderTotal: subtotal } });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.valid) {
        setAppliedPromo(data.promo);
        setPromoError("");
      } else {
        setAppliedPromo(null);
        setPromoError(data.error ?? "Invalid promo code");
      }
    },
    onError: () => setPromoError("Could not validate promo"),
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      const deliveryAddress = showCustom && customAddress.trim() ? customAddress.trim() : address;
      const res = await (api.orders as any).$post({
        json: {
          sessionId,
          deliveryAddress,
          promoCode: appliedPromo ? promoCode : undefined,
        },
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["orders", sessionId] });
      const orderId = data.order?.id ?? data.id;
      router.replace(`/track/${orderId}` as any);
    },
    onError: () => Alert.alert("Error", "Could not place order. Please try again."),
  });

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#16a34a" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f8fafc" }}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ width: 36, height: 36, backgroundColor: "white", borderRadius: 18, alignItems: "center", justifyContent: "center" }}
        >
          <ArrowLeft size={18} color="#111827" />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827" }}>Checkout</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 200 }} showsVerticalScrollIndicator={false}>

        {/* Delivery address */}
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <MapPin size={18} color="#16a34a" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>Delivery Address</Text>
          </View>

          {ADDRESSES.map((addr) => (
            <TouchableOpacity
              key={addr}
              onPress={() => { setAddress(addr); setShowCustom(false); }}
              style={{
                flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10,
                borderBottomWidth: 1, borderBottomColor: "#f3f4f6",
              }}
            >
              <View style={{
                width: 18, height: 18, borderRadius: 9, borderWidth: 2,
                borderColor: address === addr && !showCustom ? "#16a34a" : "#d1d5db",
                backgroundColor: address === addr && !showCustom ? "#16a34a" : "white",
                alignItems: "center", justifyContent: "center",
              }}>
                {address === addr && !showCustom && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "white" }} />}
              </View>
              <Text style={{ fontSize: 14, color: "#374151", flex: 1 }}>{addr}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            onPress={() => setShowCustom(!showCustom)}
            style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 }}
          >
            <View style={{
              width: 18, height: 18, borderRadius: 9, borderWidth: 2,
              borderColor: showCustom ? "#16a34a" : "#d1d5db",
              backgroundColor: showCustom ? "#16a34a" : "white",
              alignItems: "center", justifyContent: "center",
            }}>
              {showCustom && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "white" }} />}
            </View>
            <Text style={{ fontSize: 14, color: "#374151" }}>Custom address...</Text>
          </TouchableOpacity>

          {showCustom && (
            <TextInput
              style={{
                borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
                paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#111827", marginTop: 6,
              }}
              placeholder="Enter full delivery address"
              placeholderTextColor="#9ca3af"
              value={customAddress}
              onChangeText={setCustomAddress}
              multiline
            />
          )}
        </View>

        {/* Delivery time */}
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Clock size={18} color="#16a34a" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>Delivery Time</Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {TIME_SLOTS.map((slot) => (
              <TouchableOpacity
                key={slot.value}
                onPress={() => setTimeSlot(slot.value)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                  backgroundColor: timeSlot === slot.value ? "#16a34a" : "#f3f4f6",
                  borderWidth: 1,
                  borderColor: timeSlot === slot.value ? "#16a34a" : "#e5e7eb",
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: "500",
                  color: timeSlot === slot.value ? "white" : "#374151",
                }}>{slot.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Promo code */}
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Tag size={18} color="#16a34a" />
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>Promo Code</Text>
          </View>
          {appliedPromo ? (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 10,
              backgroundColor: "#f0fdf4", borderRadius: 10, padding: 12,
            }}>
              <CheckCircle size={18} color="#16a34a" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "600", color: "#16a34a" }}>{promoCode} applied!</Text>
                <Text style={{ fontSize: 12, color: "#6b7280" }}>
                  Saving KES {promoDiscount}
                </Text>
              </View>
              <TouchableOpacity onPress={() => { setAppliedPromo(null); setPromoCode(""); }}>
                <Text style={{ fontSize: 13, color: "#dc2626" }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TextInput
                  style={{
                    flex: 1, borderWidth: 1, borderColor: promoError ? "#ef4444" : "#e5e7eb",
                    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
                    fontSize: 14, color: "#111827", fontFamily: "monospace",
                    textTransform: "uppercase",
                  }}
                  placeholder="Enter code"
                  placeholderTextColor="#9ca3af"
                  value={promoCode}
                  onChangeText={(t) => { setPromoCode(t.toUpperCase()); setPromoError(""); }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity
                  onPress={() => applyPromo.mutate()}
                  disabled={!promoCode.trim() || applyPromo.isPending}
                  style={{
                    backgroundColor: promoCode.trim() ? "#16a34a" : "#e5e7eb",
                    borderRadius: 10, paddingHorizontal: 16, alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Text style={{ color: promoCode.trim() ? "white" : "#9ca3af", fontWeight: "600" }}>
                    {applyPromo.isPending ? "..." : "Apply"}
                  </Text>
                </TouchableOpacity>
              </View>
              {promoError ? (
                <Text style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>{promoError}</Text>
              ) : null}
            </>
          )}
        </View>

        {/* Order summary */}
        <View style={{
          backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 16,
          shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
        }}>
          <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827", marginBottom: 14 }}>Order Summary</Text>
          {items.slice(0, 4).map((item: any) => (
            <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: "#374151", flex: 1 }} numberOfLines={1}>
                {item.quantity}x {item.product?.name}
              </Text>
              <Text style={{ fontSize: 13, color: "#374151" }}>KES {(item.product?.price * item.quantity).toFixed(0)}</Text>
            </View>
          ))}
          {items.length > 4 && (
            <Text style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8 }}>+{items.length - 4} more items</Text>
          )}
          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>Subtotal</Text>
            <Text style={{ fontSize: 13, color: "#374151" }}>KES {subtotal}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 13, color: "#6b7280" }}>Delivery</Text>
            <Text style={{ fontSize: 13, color: deliveryFee === 0 ? "#16a34a" : "#374151" }}>
              {deliveryFee === 0 ? "FREE" : `KES ${deliveryFee}`}
            </Text>
          </View>
          {promoDiscount > 0 && (
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: "#16a34a" }}>Promo discount</Text>
              <Text style={{ fontSize: 13, color: "#16a34a" }}>-KES {promoDiscount}</Text>
            </View>
          )}
          <View style={{ height: 1, backgroundColor: "#f3f4f6", marginVertical: 10 }} />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#111827" }}>Total</Text>
            <Text style={{ fontSize: 16, fontWeight: "bold", color: "#16a34a" }}>KES {total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Place order */}
      <View style={{
        position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "white",
        padding: 16, borderTopWidth: 1, borderTopColor: "#f3f4f6",
        shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
      }}>
        <TouchableOpacity
          onPress={() => {
            if (items.length === 0) {
              Alert.alert("Empty Cart", "Add items to your cart first.");
              return;
            }
            placeOrder.mutate();
          }}
          disabled={placeOrder.isPending || items.length === 0}
          style={{
            backgroundColor: items.length === 0 ? "#d1d5db" : "#16a34a",
            borderRadius: 14, paddingVertical: 16, alignItems: "center",
          }}
        >
          {placeOrder.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Place Order · KES {total}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
