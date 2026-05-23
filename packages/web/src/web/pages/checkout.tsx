import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getSessionId } from "../lib/api";
import { Layout } from "../components/Layout";
import { useState } from "react";
import { useLocation } from "wouter";
import { MapPin, Tag, Clock, Plus, CheckCircle, X } from "lucide-react";

export default function CheckoutPage() {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();

  const [promoCode, setPromoCode] = useState("");
  const [promoResult, setPromoResult] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [scheduled, setScheduled] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");
  const [notes, setNotes] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "Nairobi", area: "" });

  const { data: cartData } = useQuery({
    queryKey: ["cart", sessionId],
    queryFn: async () => (await api.cart[":sessionId"].$get({ param: { sessionId } })).json(),
  });

  const { data: addrData, refetch: refetchAddresses } = useQuery({
    queryKey: ["addresses"],
    queryFn: async () => (await api.addresses.$get({ query: { userId: "guest" } })).json(),
    onSuccess: (data: any) => {
      if (!selectedAddress && data.addresses?.length > 0) {
        const def = data.addresses.find((a: any) => a.isDefault) || data.addresses[0];
        setSelectedAddress(def.id);
      }
    },
  } as any);

  const addAddress = useMutation({
    mutationFn: async () => {
      await api.addresses.$post({ json: { ...newAddress, userId: "guest", isDefault: !addrData?.addresses?.length } });
    },
    onSuccess: () => { refetchAddresses(); setShowAddAddress(false); setNewAddress({ label: "Home", street: "", city: "Nairobi", area: "" }); },
  });

  const placeOrder = useMutation({
    mutationFn: async () => {
      const res = await api.orders.$post({
        json: {
          sessionId,
          addressId: selectedAddress,
          promoCode: promoResult?.valid ? promoCode : null,
          scheduledFor: scheduled && scheduledTime ? new Date(scheduledTime).toISOString() : null,
          notes,
          userId: "guest",
        },
      });
      return res.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["cart", sessionId] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      navigate(`/track/${data.order.id}`);
    },
  });

  const validatePromo = async () => {
    if (!promoCode) return;
    setPromoLoading(true);
    try {
      const res = await api.promos.validate.$post({ json: { code: promoCode, subtotal: cartData?.subtotal || 0 } });
      const data = await res.json();
      setPromoResult(data);
    } finally {
      setPromoLoading(false);
    }
  };

  const items = cartData?.items || [];
  const subtotal = cartData?.subtotal || 0;
  const deliveryFee = 50;
  const discount = promoResult?.valid ? promoResult.discount : 0;
  const total = subtotal + deliveryFee - discount;
  const addresses = addrData?.addresses || [];

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <Layout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Delivery Address */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <MapPin size={18} style={{ color: "#16a34a" }} /> Delivery Address
              </h3>
              <button onClick={() => setShowAddAddress(!showAddAddress)}
                className="flex items-center gap-1 text-sm font-medium" style={{ color: "#16a34a" }}>
                <Plus size={14} /> Add New
              </button>
            </div>

            {showAddAddress && (
              <div className="mb-4 p-4 rounded-xl bg-gray-50 space-y-3 animate-fade-up">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Label</label>
                    <select value={newAddress.label} onChange={e => setNewAddress({ ...newAddress, label: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500">
                      <option>Home</option><option>Work</option><option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Area</label>
                    <input value={newAddress.area} onChange={e => setNewAddress({ ...newAddress, area: e.target.value })}
                      placeholder="e.g. Westlands" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 mb-1 block">Street Address</label>
                  <input value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })}
                    placeholder="e.g. 45 Westlands Road" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => addAddress.mutate()} disabled={!newAddress.street || addAddress.isPending}
                    className="btn-primary text-sm py-2 px-4 flex-1">
                    {addAddress.isPending ? "Saving..." : "Save Address"}
                  </button>
                  <button onClick={() => setShowAddAddress(false)} className="btn-outline text-sm py-2 px-4">Cancel</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {addresses.length === 0 ? (
                <p className="text-sm text-gray-400 py-4 text-center">No addresses saved. Add one above.</p>
              ) : (
                addresses.map((addr: any) => (
                  <label key={addr.id} className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                    style={{ borderColor: selectedAddress === addr.id ? "#16a34a" : "#e5e7eb", background: selectedAddress === addr.id ? "#f0fdf4" : "white" }}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1" style={{ accentColor: "#16a34a" }} />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{addr.label}</p>
                      <p className="text-sm text-gray-500">{addr.street}, {addr.area || addr.city}</p>
                      {addr.isDefault && <span className="badge badge-green mt-1">Default</span>}
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Scheduled Delivery */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock size={18} style={{ color: "#16a34a" }} /> Delivery Time
            </h3>
            <div className="flex gap-3 mb-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="delivery" checked={!scheduled} onChange={() => setScheduled(false)} style={{ accentColor: "#16a34a" }} />
                <span className="text-sm font-medium">ASAP (~30 min)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="delivery" checked={scheduled} onChange={() => setScheduled(true)} style={{ accentColor: "#16a34a" }} />
                <span className="text-sm font-medium">Schedule for later</span>
              </label>
            </div>
            {scheduled && (
              <input type="datetime-local" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)}
                min={new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-500 animate-fade-up" />
            )}
            <div className="mt-3">
              <label className="text-xs font-medium text-gray-600 mb-1 block">Delivery notes (optional)</label>
              <input value={notes} onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Leave at the gate, call on arrival..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-500" />
            </div>
          </div>

          {/* Promo Code */}
          <div className="card p-5">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Tag size={18} style={{ color: "#f97316" }} /> Promo Code
            </h3>
            <div className="flex gap-2">
              <input
                value={promoCode}
                onChange={e => { setPromoCode(e.target.value.toUpperCase()); setPromoResult(null); }}
                placeholder="Enter code (e.g. WELCOME20)"
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-mono focus:outline-none focus:border-green-500 uppercase"
              />
              <button onClick={validatePromo} disabled={!promoCode || promoLoading}
                className="btn-primary text-sm px-5">
                {promoLoading ? "..." : "Apply"}
              </button>
            </div>
            {promoResult && (
              <div className={`mt-3 p-3 rounded-xl flex items-center gap-2 text-sm animate-fade-up`}
                style={{ background: promoResult.valid ? "#f0fdf4" : "#fef2f2", color: promoResult.valid ? "#15803d" : "#dc2626" }}>
                {promoResult.valid ? <CheckCircle size={16} /> : <X size={16} />}
                {promoResult.valid ? `🎉 Code applied! You save KES ${promoResult.discount.toFixed(0)}` : promoResult.error}
              </div>
            )}
            <div className="mt-3 flex gap-2 flex-wrap">
              {["WELCOME20", "DARCO50", "FRESH10"].map(code => (
                <button key={code} onClick={() => { setPromoCode(code); setPromoResult(null); }}
                  className="px-3 py-1 rounded-full bg-gray-100 text-xs font-mono font-medium text-gray-600 hover:bg-green-50 hover:text-green-700 transition-colors">
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-20">
            <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-2 mb-4">
              {items.slice(0, 3).map((item: any) => (
                <div key={item.id} className="flex items-center gap-2">
                  <img src={item.product?.image} alt={item.product?.name}
                    className="w-8 h-8 rounded-lg object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=40&h=40&fit=crop"; }} />
                  <span className="text-xs text-gray-600 flex-1 truncate">{item.product?.name} x{item.quantity}</span>
                  <span className="text-xs font-medium">KES {(item.product?.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              {items.length > 3 && <p className="text-xs text-gray-400">+{items.length - 3} more items</p>}
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>KES {subtotal.toFixed(0)}</span></div>
              <div className="flex justify-between text-gray-600"><span>Delivery</span><span>KES {deliveryFee}</span></div>
              {discount > 0 && (
                <div className="flex justify-between" style={{ color: "#16a34a" }}>
                  <span>Discount</span><span>-KES {discount.toFixed(0)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span style={{ color: "#16a34a" }}>KES {total.toFixed(0)}</span>
              </div>
            </div>
            <button
              onClick={() => placeOrder.mutate()}
              disabled={placeOrder.isPending || !selectedAddress}
              className="btn-primary w-full mt-4 disabled:opacity-60"
            >
              {placeOrder.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Placing Order...
                </span>
              ) : "Place Order"}
            </button>
            {!selectedAddress && (
              <p className="text-xs text-center text-gray-400 mt-2">Please select a delivery address</p>
            )}
            <p className="text-xs text-center text-gray-400 mt-2">Cash on delivery / M-Pesa available</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
