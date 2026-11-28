// Cloudflare Worker: relays Telegram Bot API calls for hosts that cannot reach
// api.telegram.org directly (e.g. PythonAnywhere free, which allows *.workers.dev).
//
// Required secret/variable:  RELAY_KEY  (long random string; same value as
// TELEGRAM_RELAY_KEY on the backend). Without the key nobody can use your relay.

function safeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    if (!env.RELAY_KEY || !safeEqual(request.headers.get("X-Relay-Key") || "", env.RELAY_KEY)) {
      return new Response("forbidden", { status: 403 });
    }
    const url = new URL(request.url);
    if (!url.pathname.startsWith("/bot")) {
      return new Response("not found", { status: 404 });
    }
    const target = "https://api.telegram.org" + url.pathname + url.search;
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    return fetch(target, {
      method: request.method,
      headers: { "content-type": request.headers.get("content-type") || "application/json" },
      body: hasBody ? request.body : undefined,
    });
  },
};
