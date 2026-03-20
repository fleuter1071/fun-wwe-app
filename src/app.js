import { loadSeasonEvents } from "./data/client.js";
import { renderEventDetail } from "./render/detail.js";
import { renderEventList } from "./render/list.js";
import { renderStats } from "./render/stats.js";
import { createStore } from "./state/store.js";
import { filterEvents, sortEvents } from "./shared/events.js";

const elements = {
  seasonSelect: document.getElementById("seasonSelect"),
  statusFilter: document.getElementById("statusFilter"),
  searchInput: document.getElementById("searchInput"),
  sortSelect: document.getElementById("sortSelect"),
  loadBtn: document.getElementById("loadBtn"),
  statusLine: document.getElementById("statusLine"),
  dataBadge: document.getElementById("dataBadge"),
  eventList: document.getElementById("eventList"),
  detailContent: document.getElementById("detailContent"),
  shell: document.getElementById("shell"),
  detailShell: document.querySelector(".detail-shell"),
  mobileBackBtn: document.getElementById("mobileBackBtn"),
  coverageNotice: document.getElementById("coverageNotice"),
  visibleCount: document.getElementById("visibleCount"),
  finishedCount: document.getElementById("finishedCount"),
  upcomingCount: document.getElementById("upcomingCount"),
  titleChangeCount: document.getElementById("titleChangeCount"),
  listCount: document.getElementById("listCount"),
  listSubtitle: document.getElementById("listSubtitle")
};

function getUrlState() {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));

  return {
    selectedEventId: params.get("event") || null,
    currentPane: params.get("pane") === "results" ? "results" : "card"
  };
}

const initialFilters = {
  query: "",
  status: elements.statusFilter.value,
  sort: elements.sortSelect.value
};

const initialUrlState = getUrlState();

const store = createStore({
  season: elements.seasonSelect.value,
  events: [],
  filters: initialFilters,
  selectedEventId: initialUrlState.selectedEventId,
  currentPane: initialUrlState.currentPane,
  isMobileDetailOpen: false,
  statusMessage: "Ready to load WWE events.",
  dataMeta: {
    source: "idle",
    degraded: false,
    cached: false
  }
});

function syncUrlState(state) {
  const params = new URLSearchParams();

  if (state.selectedEventId) {
    params.set("event", state.selectedEventId);
  }

  if (state.currentPane && state.currentPane !== "card") {
    params.set("pane", state.currentPane);
  }

  const nextHash = params.toString();
  const target = nextHash ? `#${nextHash}` : window.location.pathname + window.location.search;

  if (nextHash) {
    if (window.location.hash !== `#${nextHash}`) {
      history.replaceState(null, "", `#${nextHash}`);
    }
    return;
  }

  if (window.location.hash) {
    history.replaceState(null, "", target);
  }
}

function getVisibleEvents(state = store.getState()) {
  return sortEvents(filterEvents(state.events, state.filters), state.filters.sort);
}

function reconcileSelection(baseState, statePatch) {
  const mergedFilters = statePatch.filters
    ? { ...baseState.filters, ...statePatch.filters }
    : baseState.filters;

  const nextState = {
    ...baseState,
    ...statePatch,
    filters: mergedFilters
  };
  const visibleEvents = getVisibleEvents(nextState);
  const hasSelectedEvent = visibleEvents.some((event) => event.id === nextState.selectedEventId);

  return {
    ...statePatch,
    filters: mergedFilters,
    selectedEventId: hasSelectedEvent ? nextState.selectedEventId : visibleEvents[0]?.id || null
  };
}

function openMobileDetail() {
  if (window.innerWidth > 760) return;

  store.setState((state) => ({
    ...state,
    isMobileDetailOpen: true
  }));

  requestAnimationFrame(() => {
    elements.detailShell.scrollTop = 0;
    elements.detailContent.scrollTop = 0;
  });
}

function closeMobileDetail() {
  store.setState((state) => ({
    ...state,
    isMobileDetailOpen: false
  }));

  elements.shell.scrollIntoView({ block: "start", behavior: "smooth" });
}

function getDataBadgeState(dataMeta) {
  if (dataMeta.degraded) {
    return {
      label: "Sample fallback",
      tone: "warning"
    };
  }

  if (dataMeta.source === "live") {
    return {
      label: "Live data · free API window",
      tone: "live"
    };
  }

  return {
    label: "Waiting to load data",
    tone: "idle"
  };
}

function getCoverageNoticeState(state, visibleEvents) {
  if (state.dataMeta.degraded) {
    return {
      visible: true,
      tone: "warning",
      message: "Showing sample fallback data because live loading was unavailable."
    };
  }

  if (state.dataMeta.source === "live" && visibleEvents.length === 15) {
    return {
      visible: true,
      tone: "info",
      message: "Showing the first 15 live events available from the current API plan."
    };
  }

  return {
    visible: false,
    tone: "info",
    message: ""
  };
}

function renderApp(state) {
  const visibleEvents = getVisibleEvents(state);
  const selectedEvent = visibleEvents.find((event) => event.id === state.selectedEventId) || null;
  const badgeState = getDataBadgeState(state.dataMeta);
  const coverageState = getCoverageNoticeState(state, visibleEvents);

  elements.statusLine.textContent = state.statusMessage;
  elements.dataBadge.textContent = badgeState.label;
  elements.dataBadge.dataset.tone = badgeState.tone;
  elements.coverageNotice.hidden = !coverageState.visible;
  elements.coverageNotice.textContent = coverageState.message;
  elements.coverageNotice.dataset.tone = coverageState.tone;
  elements.shell.classList.toggle("mobile-detail-active", state.isMobileDetailOpen);
  document.body.classList.toggle("mobile-detail-open", state.isMobileDetailOpen);
  syncUrlState(state);

  renderStats(elements, visibleEvents);

  renderEventList(elements.eventList, visibleEvents, state.selectedEventId, (eventId) => {
    store.setState((currentState) => ({
      ...currentState,
      selectedEventId: eventId
    }));
    openMobileDetail();
  });

  renderEventDetail(elements.detailContent, selectedEvent, state.currentPane, (pane) => {
    store.setState((currentState) => ({
      ...currentState,
      currentPane: pane
    }));
  });
}

async function loadEvents() {
  const season = elements.seasonSelect.value;
  const urlState = getUrlState();

  store.setState((state) => ({
    ...state,
    season,
    selectedEventId: urlState.selectedEventId,
    currentPane: urlState.currentPane,
    statusMessage: `Loading WWE ${season} events...`
  }));

  const payload = await loadSeasonEvents(season);
  const message = payload.meta?.message || `Loaded ${payload.events.length} WWE events for season ${season}.`;

  store.setState((state) => ({
    ...state,
    ...reconcileSelection(state, {
      season,
      events: payload.events,
      selectedEventId: urlState.selectedEventId,
      currentPane: urlState.currentPane,
      isMobileDetailOpen: false
    }),
    statusMessage: message,
    dataMeta: payload.meta || { source: "unknown", degraded: false, cached: false }
  }));
}

elements.loadBtn.addEventListener("click", loadEvents);
elements.searchInput.addEventListener("input", (event) => {
  store.setState((state) => ({
    ...state,
    ...reconcileSelection(state, {
      filters: {
        query: event.target.value
      }
    })
  }));
});
elements.statusFilter.addEventListener("change", (event) => {
  store.setState((state) => ({
    ...state,
    ...reconcileSelection(state, {
      filters: {
        status: event.target.value
      }
    })
  }));
});
elements.sortSelect.addEventListener("change", (event) => {
  store.setState((state) => ({
    ...state,
    ...reconcileSelection(state, {
      filters: {
        sort: event.target.value
      }
    })
  }));
});
elements.mobileBackBtn.addEventListener("click", closeMobileDetail);

window.addEventListener("resize", () => {
  if (window.innerWidth > 760 && store.getState().isMobileDetailOpen) {
    store.setState((state) => ({
      ...state,
      isMobileDetailOpen: false
    }));
  }
});

window.addEventListener("hashchange", () => {
  const urlState = getUrlState();

  store.setState((state) => ({
    ...state,
    ...reconcileSelection(state, {
      selectedEventId: urlState.selectedEventId,
      currentPane: urlState.currentPane
    })
  }));
});

store.subscribe(renderApp);
renderApp(store.getState());
loadEvents();
