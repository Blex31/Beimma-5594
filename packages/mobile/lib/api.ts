import { hc } from "hono/client";
import Constants from "expo-constants";
import type { AppType } from "@template/web";

const baseUrl =
  Constants.expoConfig?.extra?.apiUrl ??
  process.env.EXPO_PUBLIC_API_URL;

const client = hc<AppType>(baseUrl!);

export const api = client.api;

// Simple session ID for mobile — one device = one session
// TODO: persist with AsyncStorage in future
let _sessionId: string | null = null;

export function getSessionId(): string {
  if (!_sessionId) {
    _sessionId = "mobile_sess_001";
  }
  return _sessionId;
}
