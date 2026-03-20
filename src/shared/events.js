export const DEFAULT_EVENT_IMAGE = "WWE_logo.jpg";

export const sampleRawEvents = [
  {
    idEvent: "2403782",
    strEvent: "SmackDown #1376",
    strSeason: "2026",
    strDescriptionEN: "Eight Man Tag Team Match\nAlexa Bliss, Charlotte Flair, IYO SKY & Rhea Ripley vs. Lash Legend, Nia Jax & The Kabuki Warriors (Asuka & Kairi Sane)\n\nSingles Match\nMatt Cardona vs. Kit Wilson\n\nWWE United States Title Match\nCarmelo Hayes (c) vs. Johnny Gargano\n\nWWE Women's United States Title Match\nChelsea Green (c) vs. Giulia\n\nAmbulance Match\nAleister Black vs. Damian Priest",
    strResult: "Eight Man Tag Team Match\nAlexa Bliss, Charlotte Flair, IYO SKY & Rhea Ripley defeat Lash Legend, Nia Jax & The Kabuki Warriors (Asuka & Kairi Sane) (14:32)\n\nSingles Match\nMatt Cardona defeats Kit Wilson (4:19)\n\nWWE United States Title Match\nCarmelo Hayes (c) defeats Johnny Gargano (16:46)\n\nWWE Women's United States Title Match\nGiulia defeats Chelsea Green (c) (7:35) - TITLE CHANGE !!!\n\nAmbulance Match\nDamian Priest defeats Aleister Black (23:59)",
    dateEvent: "2026-01-03",
    dateEventLocal: "2026-01-02",
    strTimeLocal: "20:00:00",
    strVenue: "Keybank Center",
    strCountry: "United States",
    strCity: "Buffalo, New York",
    strFanart: "https://r2.thesportsdb.com/images/media/event/fanart/vumu8a1767432229.jpg",
    strThumb: "https://r2.thesportsdb.com/images/media/event/thumb/72qxa31767432222.jpg",
    strVideo: "https://www.youtube.com/watch?v=zyMRVXpyk64",
    strStatus: "Match Finished"
  },
  {
    idEvent: "2403787",
    strEvent: "RAW #1702 Raw Is Stranger Things",
    strSeason: "2026",
    strDescriptionEN: "WWE Women's Tag Team Title Match\nThe Kabuki Warriors (Asuka & Kairi Sane) (c) vs. IYO SKY & Rhea Ripley\n\nWWE Women's Intercontinental Title Match\nMaxxine Dupri (c) vs. Becky Lynch\n\nSingles Match\nLiv Morgan vs. Lyra Valkyria\n\nWWE World Heavyweight Title Match\nCM Punk (c) vs. Bron Breakker",
    strResult: "WWE Women's Tag Team Title Match\nIYO SKY & Rhea Ripley defeat The Kabuki Warriors (Asuka & Kairi Sane) (c) (16:27) - TITLE CHANGE !!!\n\nWWE Women's Intercontinental Title Match\nBecky Lynch defeats Maxxine Dupri (c) (11:37) - TITLE CHANGE !!!\n\nSingles Match\nLiv Morgan defeats Lyra Valkyria (8:56)\n\nWWE World Heavyweight Title Match\nCM Punk (c) defeats Bron Breakker (26:34)",
    dateEvent: "2026-01-06",
    dateEventLocal: "2026-01-05",
    strTimeLocal: "20:00:00",
    strVenue: "Barclays Center",
    strCountry: "United States",
    strCity: "New York City, New York",
    strFanart: "https://r2.thesportsdb.com/images/media/event/fanart/3sm08d1767710545.jpg",
    strThumb: "https://r2.thesportsdb.com/images/media/event/thumb/du3nfu1767769212.jpg",
    strVideo: "https://www.youtube.com/watch?v=QHx4tLRlc5Q",
    strStatus: "Match Finished"
  },
  {
    idEvent: "2412448",
    strEvent: "EVOLVE #43",
    strSeason: "2026",
    strDescriptionEN: "Singles Match\nTimothy Thatcher vs. Charlie Dempsey\n\nWWE EVOLVE Women's Title Triple Threat Match\nKendal Grey (c) vs. Kali Armstrong vs. PJ Vasa",
    strResult: "Singles Match\nTimothy Thatcher vs. Charlie Dempsey\n\nWWE EVOLVE Women's Title Triple Threat Match\nKendal Grey (c) vs. Kali Armstrong vs. PJ Vasa",
    dateEvent: "2026-01-15",
    dateEventLocal: "2026-01-14",
    strTimeLocal: "20:00:00",
    strVenue: "WWE Performance Center",
    strCountry: "United States",
    strCity: "Orlando, Florida",
    strFanart: "",
    strThumb: "",
    strVideo: "",
    strStatus: "Not Started"
  }
];

export function safe(value, fallback = "--") {
  return value && String(value).trim() ? value : fallback;
}

export function countBlocks(text) {
  if (!text) return 0;
  return text.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean).length;
}

export function countTitleMatches(text) {
  if (!text) return 0;
  return text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .filter((block) => /title/i.test(block))
    .length;
}

export function countTitleChanges(text) {
  if (!text) return 0;
  const matches = text.match(/title change/gi);
  return matches ? matches.length : 0;
}

export function isFinishedStatus(status) {
  return /finished/i.test(status || "");
}

export function parseStatusLabel(status) {
  return status === "Match Finished" ? "Finished" : safe(status, "Unknown");
}

export function getImageUrl(rawEvent) {
  return rawEvent?.strThumb || rawEvent?.strFanart || DEFAULT_EVENT_IMAGE;
}

export function normalizeEvent(rawEvent = {}) {
  const description = rawEvent.strDescriptionEN || "";
  const results = rawEvent.strResult || "";
  const status = rawEvent.strStatus || "";
  const city = safe(rawEvent.strCity);
  const country = safe(rawEvent.strCountry);

  return {
    id: safe(rawEvent.idEvent, ""),
    name: safe(rawEvent.strEvent, "Untitled Event"),
    season: safe(rawEvent.strSeason, "--"),
    description,
    results,
    eventDate: rawEvent.dateEvent || "",
    localDate: rawEvent.dateEventLocal || rawEvent.dateEvent || "",
    localTime: rawEvent.strTimeLocal || rawEvent.strTime || "",
    venue: safe(rawEvent.strVenue),
    city,
    country,
    locationLine: [city, country].filter((value) => value !== "--").join(", ") || "--",
    imageUrl: getImageUrl(rawEvent),
    videoUrl: rawEvent.strVideo || "",
    status,
    statusLabel: parseStatusLabel(status),
    isFinished: isFinishedStatus(status),
    matchCount: countBlocks(description),
    titleMatchCount: countTitleMatches(description),
    titleChangeCount: countTitleChanges(results)
  };
}

export function normalizeEvents(rawEvents = []) {
  return rawEvents.map(normalizeEvent).filter((event) => event.id);
}

export function filterEvents(events, filters) {
  const query = filters.query.trim().toLowerCase();
  const status = filters.status;

  return events.filter((event) => {
    if (query) {
      const haystack = [event.name, event.city, event.venue, event.description, event.results].join(" ").toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (status === "finished" && !event.isFinished) return false;
    if (status === "upcoming" && event.isFinished) return false;
    return true;
  });
}

export function sortEvents(events, mode) {
  const sorted = [...events];

  if (mode === "name") {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
    return sorted;
  }

  if (mode === "oldest") {
    sorted.sort((a, b) => (a.eventDate || "").localeCompare(b.eventDate || ""));
    return sorted;
  }

  sorted.sort((a, b) => (b.eventDate || "").localeCompare(a.eventDate || ""));
  return sorted;
}
