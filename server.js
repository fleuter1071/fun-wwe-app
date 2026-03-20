import http from "node:http";
import { readFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { normalizeEvents, sampleRawEvents } from "./src/shared/events.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = __dirname;

loadEnvFile(path.join(rootDir, ".env"));

const PORT = Number(process.env.PORT || 4173);
const API_KEY = process.env.UPSTREAM_API_KEY || "";
const LEAGUE_ID = process.env.UPSTREAM_LEAGUE_ID || "";
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 5 * 60 * 1000);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8"
};

const cache = new Map();

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function sendText(response, statusCode, body, contentType) {
  response.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store"
  });
  response.end(body);
}

async function fetchJson(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return await response.json();
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadSeasonPayload(season) {
  const cacheKey = `season:${season}`;
  const cached = cache.get(cacheKey);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return {
      ...cached.payload,
      meta: {
        ...cached.payload.meta,
        cached: true
      }
    };
  }

  const fallbackPayload = {
    events: normalizeEvents(sampleRawEvents),
    meta: {
      season,
      source: "sample",
      degraded: true,
      cached: false,
      fetchedAt: new Date().toISOString(),
      message: "Live event loading is not configured yet, so sample WWE data is being shown."
    }
  };

  if (!API_KEY || !LEAGUE_ID) {
    cache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      payload: fallbackPayload
    });
    return fallbackPayload;
  }

  const upstreamUrl = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${encodeURIComponent(season)}`;

  try {
    const data = await fetchJson(upstreamUrl);
    const events = normalizeEvents(data?.events || []);

    if (!events.length) {
      throw new Error("Missing events array");
    }

    const payload = {
      events,
      meta: {
        season,
        source: "live",
        degraded: false,
        cached: false,
        fetchedAt: new Date().toISOString(),
        message: `Loaded ${events.length} WWE events for season ${season}.`
      }
    };

    cache.set(cacheKey, {
      expiresAt: now + CACHE_TTL_MS,
      payload
    });

    return payload;
  } catch {
    const degradedPayload = {
      ...fallbackPayload,
      meta: {
        ...fallbackPayload.meta,
        message: "Live event loading failed, so sample WWE data is being shown."
      }
    };

    cache.set(cacheKey, {
      expiresAt: now + 30 * 1000,
      payload: degradedPayload
    });

    return degradedPayload;
  }
}

async function serveStatic(requestPath, response) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const safePath = path.normalize(normalizedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(rootDir, safePath);

  if (!filePath.startsWith(rootDir)) {
    sendText(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  try {
    const file = await readFile(filePath);
    const extension = path.extname(filePath).toLowerCase();
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension] || "application/octet-stream",
      "Cache-Control": extension === ".jpg" || extension === ".png" ? "public, max-age=3600" : "no-cache"
    });
    response.end(file);
  } catch {
    sendText(response, 404, "Not found", "text/plain; charset=utf-8");
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  if (request.method !== "GET") {
    sendText(response, 405, "Method not allowed", "text/plain; charset=utf-8");
    return;
  }

  if (url.pathname === "/app-config.js") {
    const configScript = `window.__APP_CONFIG__ = ${JSON.stringify({ apiBase: "/api" })};`;
    sendText(response, 200, configScript, "text/javascript; charset=utf-8");
    return;
  }

  if (url.pathname === "/api/events") {
    const season = url.searchParams.get("season") || "2026";
    const payload = await loadSeasonPayload(season);
    sendJson(response, 200, payload);
    return;
  }

  await serveStatic(url.pathname, response);
});

server.listen(PORT, () => {
  console.log(`WWE Event Explorer server running at http://localhost:${PORT}`);
});
