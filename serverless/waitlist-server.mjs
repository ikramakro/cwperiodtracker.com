// Minimal waitlist endpoint for CycleWise. Node 18+, zero dependencies.
// Accepts multipart/form-data or urlencoded POSTs from the landing page and appends JSON lines to DATA_FILE.
import http from "node:http";
import { appendFile } from "node:fs/promises";

const PORT = Number(process.env.PORT || 8787);
const DATA_FILE = process.env.DATA_FILE || "./signups.jsonl";
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://srv1813447.hstgr.cloud";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const hits = new Map(); // ip -> [timestamps]

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Accept, Content-Type");
}
function send(res, code, obj) { cors(res); res.writeHead(code, { "Content-Type": "application/json" }); res.end(JSON.stringify(obj)); }

http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") { cors(res); res.writeHead(204); return res.end(); }
  if (req.method !== "POST") return send(res, 405, { errors: [{ message: "POST only" }] });

  const ip = (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString().split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < 10 * 60_000);
  if (recent.length >= 5) return send(res, 429, { errors: [{ message: "Too many requests" }] });
  hits.set(ip, [...recent, now]);

  try {
    const request = new Request("http://local" + req.url, {
      method: "POST", headers: req.headers, body: req, duplex: "half"
    });
    const form = await request.formData();
    const get = k => (form.get(k) || "").toString().trim();
    if (get("_gotcha")) return send(res, 200, { ok: true }); // bot
    const first_name = get("first_name").slice(0, 60);
    const email = get("email").slice(0, 254).toLowerCase();
    if (!first_name || !EMAIL_RE.test(email)) return send(res, 422, { errors: [{ message: "Name and a valid email are required." }] });
    if (get("consent") !== "yes" || get("age_13_plus") !== "yes") return send(res, 422, { errors: [{ message: "Consent and 13+ confirmation are required." }] });
    const row = {
      first_name, email,
      platform: get("platform").slice(0, 10),
      notes: get("notes").slice(0, 500),
      consent: true, age_13_plus: true,
      created_at: new Date().toISOString()
    };
    await appendFile(DATA_FILE, JSON.stringify(row) + "\n", { mode: 0o600 });
    return send(res, 200, { ok: true });
  } catch (e) {
    console.error(e);
    return send(res, 400, { errors: [{ message: "Bad request" }] });
  }
}).listen(PORT, "127.0.0.1", () => console.log(`CycleWise waitlist API on 127.0.0.1:${PORT} → ${DATA_FILE}`));
