import { getRuntimeConfig } from "../config.js";
import { normalizeEvents, sampleRawEvents } from "../shared/events.js";

export async function loadSeasonEvents(season) {
  const { apiBase } = getRuntimeConfig();
  const url = `${apiBase}/events?season=${encodeURIComponent(season)}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (!payload || !Array.isArray(payload.events)) {
      throw new Error("Invalid events payload");
    }

    return payload;
  } catch (error) {
    return {
      events: normalizeEvents(sampleRawEvents),
      meta: {
        season,
        source: "sample",
        degraded: true,
        cached: false,
        fetchedAt: new Date().toISOString(),
        message: "Backend unavailable, so local sample WWE data is being shown."
      },
      error
    };
  }
}
