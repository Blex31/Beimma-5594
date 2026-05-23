import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" backgroundColor="#16a34a" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="product/[id]" options={{ headerShown: true, title: "Product", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "white" }} />
          <Stack.Screen name="checkout" options={{ headerShown: true, title: "Checkout", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "white" }} />
          <Stack.Screen name="track/[id]" options={{ headerShown: true, title: "Track Order", headerStyle: { backgroundColor: "#16a34a" }, headerTintColor: "white" }} />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
