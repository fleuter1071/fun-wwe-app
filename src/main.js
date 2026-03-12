const API_KEY = "123";
const LEAGUE_ID = "4444";

const seasonSelectEl = document.getElementById("seasonSelect");
const statusFilterEl = document.getElementById("statusFilter");
const searchInputEl = document.getElementById("searchInput");
const sortSelectEl = document.getElementById("sortSelect");
const loadBtnEl = document.getElementById("loadBtn");
const statusLineEl = document.getElementById("statusLine");
const eventListEl = document.getElementById("eventList");
const detailContentEl = document.getElementById("detailContent");
const shellEl = document.getElementById("shell");
const detailShellEl = document.querySelector(".detail-shell");
const mobileBackBtnEl = document.getElementById("mobileBackBtn");

const visibleCountEl = document.getElementById("visibleCount");
const finishedCountEl = document.getElementById("finishedCount");
const upcomingCountEl = document.getElementById("upcomingCount");
const titleChangeCountEl = document.getElementById("titleChangeCount");
const listCountEl = document.getElementById("listCount");
const listSubtitleEl = document.getElementById("listSubtitle");

let allEvents = [];
let filteredEvents = [];
let selectedEventId = null;
let currentPane = "card";

const DEFAULT_EVENT_IMAGE = "WWE_logo.jpg";

const sampleData = {
  events: [
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
  ]
};

function setStatus(message) {
  statusLineEl.textContent = message;
}

function safe(value, fallback = "--") {
  return value && String(value).trim() ? value : fallback;
}

function getImage(event) {
  return event.strThumb || event.strFanart || DEFAULT_EVENT_IMAGE;
}

function handleEventImageError(img) {
  if (!img || img.dataset.fallbackApplied === "true") return;
  img.dataset.fallbackApplied = "true";
  img.src = DEFAULT_EVENT_IMAGE;
}

function formatDate(dateStr) {
  if (!dateStr) return "--";
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function formatTime(timeStr) {
  if (!timeStr || !timeStr.includes(":")) return safe(timeStr);
  const [hourRaw, minute] = timeStr.split(":");
  const hourNum = Number(hourRaw);
  if (Number.isNaN(hourNum)) return timeStr;
  const suffix = hourNum >= 12 ? "PM" : "AM";
  const hour12 = hourNum % 12 || 12;
  return `${hour12}:${minute} ${suffix}`;
}

function parseStatus(status) {
  return status === "Match Finished" ? "Finished" : safe(status, "Unknown");
}

function isFinished(event) {
  return /finished/i.test(event.strStatus || "");
}

function isUpcoming(event) {
  return !isFinished(event);
}

function countBlocks(text) {
  if (!text) return 0;
  return text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).length;
}

function countTitleMatches(text) {
  if (!text) return 0;
  return text
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((block) => /title/i.test(block))
    .length;
}

function countTitleChanges(text) {
  if (!text) return 0;
  const matches = text.match(/title change/gi);
  return matches ? matches.length : 0;
}

function sortEvents(events) {
  const sorted = [...events];
  const mode = sortSelectEl.value;

  if (mode === "name") {
    sorted.sort((a, b) => (a.strEvent || "").localeCompare(b.strEvent || ""));
  } else if (mode === "oldest") {
    sorted.sort((a, b) => (a.dateEvent || "").localeCompare(b.dateEvent || ""));
  } else {
    sorted.sort((a, b) => (b.dateEvent || "").localeCompare(a.dateEvent || ""));
  }

  return sorted;
}

function updateStats(events) {
  const finished = events.filter(isFinished).length;
  const upcoming = events.filter(isUpcoming).length;
  const titleChanges = events.reduce((sum, event) => sum + countTitleChanges(event.strResult), 0);

  visibleCountEl.textContent = events.length;
  finishedCountEl.textContent = finished;
  upcomingCountEl.textContent = upcoming;
  titleChangeCountEl.textContent = titleChanges;
  listCountEl.textContent = `${events.length} visible`;
  listSubtitleEl.textContent = events.length ? "Browse the season and open a show" : "No events match your current filters";
}

function renderList(events) {
  if (!events.length) {
    eventListEl.innerHTML = '<div class="empty-state">No events match your current filters.</div>';
    return;
  }

  eventListEl.innerHTML = events.map((event) => {
    const matchCount = countBlocks(event.strDescriptionEN);
    const titleMatchCount = countTitleMatches(event.strDescriptionEN);
    const titleChanges = countTitleChanges(event.strResult);
    const statusClass = isFinished(event) ? "status-finished" : "status-upcoming";
    const active = event.idEvent === selectedEventId;

    return `
      <article class="event-card ${active ? "active" : ""}" data-id="${event.idEvent}">
        <div class="thumb-wrap">
          ${active ? '<span class="viewing-chip">Now viewing</span>' : ""}
          <img class="thumb" src="${getImage(event)}" alt="${safe(event.strEvent)}" onerror="handleEventImageError(this)" />
        </div>
        <div class="event-body">
          <h3 class="event-title">${safe(event.strEvent)}</h3>
          <div class="meta">${formatDate(event.dateEventLocal || event.dateEvent)} &bull; ${formatTime(event.strTimeLocal || event.strTime)}</div>
          <div class="meta">${safe(event.strVenue)} &bull; ${safe(event.strCity)}</div>
          <div class="chips">
            <span class="chip ${statusClass}">${parseStatus(event.strStatus)}</span>
            <span class="chip">Card ${matchCount}</span>
            <span class="chip">Titles ${titleMatchCount}</span>
            ${titleChanges ? `<span class="chip title-change">Changes ${titleChanges}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("click", () => {
      const { id } = card.dataset;
      const event = filteredEvents.find((item) => item.idEvent === id);
      if (!event) return;
      selectedEventId = id;
      renderList(filteredEvents);
      renderDetail(event);
      openMobileDetail();
    });
  });
}

function renderDetail(event) {
  const titleChanges = countTitleChanges(event.strResult);
  const matchCount = countBlocks(event.strDescriptionEN);
  const titleMatchCount = countTitleMatches(event.strDescriptionEN);
  const dateTimeLine = `${formatDate(event.dateEventLocal || event.dateEvent)} &bull; ${formatTime(event.strTimeLocal || event.strTime)}`;
  const locationLine = [event.strCity, event.strCountry].filter((value) => value && String(value).trim()).join(", ") || "--";
  const videoLink = event.strVideo
    ? `<a class="video-link" href="${event.strVideo}" target="_blank" rel="noopener noreferrer">Watch related video</a>`
    : "";

  detailContentEl.innerHTML = `
    <div class="detail-body">
      <section class="event-detail-header">
        <div class="event-detail-identity">
          <div class="event-detail-overline">Now Viewing</div>
          <h1 class="event-detail-title">${safe(event.strEvent)}</h1>
          <p class="event-detail-datetime">${dateTimeLine}</p>
        </div>

        <section class="event-detail-hero">
          <img src="${getImage(event)}" alt="${safe(event.strEvent)}" onerror="handleEventImageError(this)" />
          <span class="event-status-badge">${parseStatus(event.strStatus)}</span>
        </section>

        <div class="event-detail-location">
          <div class="event-detail-venue">${safe(event.strVenue)}</div>
          <div class="event-detail-place">${locationLine}</div>
        </div>

        <div class="event-detail-stats" aria-label="Event quick stats">
          <span class="stat-chip">${matchCount} match${matchCount === 1 ? "" : "es"}</span>
          <span class="stat-chip">${titleMatchCount} title match${titleMatchCount === 1 ? "" : "es"}</span>
          <span class="stat-chip">${titleChanges} title change${titleChanges === 1 ? "" : "s"}</span>
        </div>
      </section>

      <section class="block block-primary">
        <div class="block-header">
          <div class="block-title-wrap">
            <h3>Match Information</h3>
            <p>Switch between the announced card and the finished results without leaving this event page.</p>
          </div>

          <div class="segmented" role="tablist" aria-label="Match information views">
            <button class="segment-btn ${currentPane === "card" ? "active" : ""}" data-pane="card" aria-selected="${currentPane === "card"}">Announced Card</button>
            <button class="segment-btn ${currentPane === "results" ? "active" : ""}" data-pane="results" aria-selected="${currentPane === "results"}">Results</button>
          </div>
        </div>

        <div class="block-body">
          <div class="match-pane ${currentPane === "card" ? "active" : ""}" data-pane-body="card">
            <div class="text-block">${safe(event.strDescriptionEN, "No announced card available.")}</div>
          </div>

          <div class="match-pane ${currentPane === "results" ? "active" : ""}" data-pane-body="results">
            <div class="text-block">${safe(event.strResult, "No results available.")}</div>
          </div>
        </div>
      </section>

      <section class="block">
        <div class="block-header">
          <div class="block-title-wrap">
            <h3>Media & Notes</h3>
            <p>Related video when available, plus context on how the quick event signals are inferred.</p>
          </div>
        </div>
        <div class="block-body">
          ${videoLink || '<div class="note">No related video link was available for this event.</div>'}
          <div class="note" style="margin-top: 14px;">
            Match count, title matches, and title changes are inferred from the event text fields, so they are useful
            for browsing and summarizing but not perfect as official structured stats.
          </div>
        </div>
      </section>
    </div>
  `;

  detailContentEl.querySelectorAll(".segment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentPane = btn.dataset.pane;
      renderDetail(event);
    });
  });
}

function openMobileDetail() {
  if (window.innerWidth > 760) return;

  shellEl.classList.add("mobile-detail-active");
  document.body.classList.add("mobile-detail-open");

  requestAnimationFrame(() => {
    if (detailShellEl) detailShellEl.scrollTop = 0;
    if (detailContentEl) detailContentEl.scrollTop = 0;
  });
}

function closeMobileDetail() {
  shellEl.classList.remove("mobile-detail-active");
  document.body.classList.remove("mobile-detail-open");
  shellEl.scrollIntoView({ block: "start", behavior: "smooth" });
}

function applyFilters() {
  const query = searchInputEl.value.trim().toLowerCase();
  const statusMode = statusFilterEl.value;

  let events = [...allEvents];

  if (query) {
    events = events.filter((event) => {
      const haystack = [
        event.strEvent,
        event.strCity,
        event.strVenue,
        event.strDescriptionEN,
        event.strResult
      ].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }

  if (statusMode === "finished") {
    events = events.filter(isFinished);
  } else if (statusMode === "upcoming") {
    events = events.filter(isUpcoming);
  }

  filteredEvents = sortEvents(events);
  updateStats(filteredEvents);
  renderList(filteredEvents);

  if (!filteredEvents.some((event) => event.idEvent === selectedEventId)) {
    selectedEventId = filteredEvents[0]?.idEvent || null;
  }

  const selectedEvent = filteredEvents.find((event) => event.idEvent === selectedEventId);
  if (selectedEvent) {
    renderDetail(selectedEvent);
  } else {
    detailContentEl.innerHTML = `
      <div class="detail-empty">
        <div class="detail-empty-mark">WWE</div>
        <h2>No event selected</h2>
        <p>No event is currently selected because nothing matches your filters.</p>
      </div>
    `;
  }
}

async function fetchWithFallbacks(urls) {
  let lastError = null;

  for (const url of urls) {
    try {
      const response = await fetch(url, { mode: "cors" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data && Array.isArray(data.events)) return data;
      throw new Error("Missing events array");
    } catch (error) {
      lastError = error;
      console.warn("Fetch attempt failed:", url, error);
    }
  }

  throw lastError || new Error("All fetch attempts failed");
}

async function loadEvents() {
  const season = seasonSelectEl.value;
  setStatus(`Loading WWE ${season} events...`);

  const directUrl = `https://www.thesportsdb.com/api/v1/json/${API_KEY}/eventsseason.php?id=${LEAGUE_ID}&s=${season}`;
  const urls = [
    directUrl,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`,
    `https://cors.isomorphic-git.org/${directUrl}`
  ];

  try {
    const data = await fetchWithFallbacks(urls);
    allEvents = data.events;
    selectedEventId = allEvents[0]?.idEvent || null;
    currentPane = "card";
    applyFilters();
    setStatus(`Loaded ${allEvents.length} WWE events for season ${season}.`);
  } catch (error) {
    console.warn("Using sample data after fetch failure.", error);
    allEvents = sampleData.events;
    selectedEventId = allEvents[0]?.idEvent || null;
    currentPane = "card";
    applyFilters();
    setStatus("Live loading failed in this browser context, so sample WWE data is being shown.");
  }
}

loadBtnEl.addEventListener("click", loadEvents);
searchInputEl.addEventListener("input", applyFilters);
statusFilterEl.addEventListener("change", applyFilters);
sortSelectEl.addEventListener("change", applyFilters);
mobileBackBtnEl.addEventListener("click", closeMobileDetail);

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    shellEl.classList.remove("mobile-detail-active");
    document.body.classList.remove("mobile-detail-open");
  }
});

loadEvents();


