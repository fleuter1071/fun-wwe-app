const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:4173";

async function fetchJson(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`${pathname} failed with HTTP ${response.status}`);
  }

  return response.json();
}

async function fetchText(pathname) {
  const response = await fetch(`${baseUrl}${pathname}`);
  if (!response.ok) {
    throw new Error(`${pathname} failed with HTTP ${response.status}`);
  }

  return response.text();
}

async function main() {
  const [indexHtml, configScript, eventPayload] = await Promise.all([
    fetchText("/"),
    fetchText("/app-config.js"),
    fetchJson("/api/events?season=2026")
  ]);

  if (!indexHtml.includes('type="module" src="src/app.js"')) {
    throw new Error("Index page is not serving the module app entry.");
  }

  if (!configScript.includes("window.__APP_CONFIG__")) {
    throw new Error("Runtime config script is missing.");
  }

  if (!Array.isArray(eventPayload.events) || eventPayload.events.length === 0) {
    throw new Error("API payload did not include normalized events.");
  }

  const event = eventPayload.events[0];
  const requiredFields = ["id", "name", "imageUrl", "statusLabel", "matchCount"];
  const missingField = requiredFields.find((field) => !(field in event));

  if (missingField) {
    throw new Error(`Normalized event missing field: ${missingField}`);
  }

  console.log("Smoke test passed.");
  console.log(JSON.stringify({
    source: eventPayload.meta?.source,
    degraded: eventPayload.meta?.degraded,
    eventCount: eventPayload.events.length,
    firstEvent: {
      id: event.id,
      name: event.name
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});
