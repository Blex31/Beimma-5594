import { hc } from "hono/client";
import type { AppType } from "../../api";

const client = hc<AppType>("/");
export const api = client.api;

// Session management for cart
export function getSessionId(): string {
  let sid = localStorage.getItem("darco_session");
  if (!sid) {
    sid = "sess_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("darco_session", sid);
  }
  return sid;
}
