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
  eventList: document.getElementById("eventList"),
  detailContent: document.getElementById("detailContent"),
  shell: document.getElementById("shell"),
  detailShell: document.querySelector(".detail-shell"),
  mobileBackBtn: document.getElementById("mobileBackBtn"),
  visibleCount: document.getElementById("visibleCount"),
  finishedCount: document.getElementById("finishedCount"),
  upcomingCount: document.getElementById("upcomingCount"),
  titleChangeCount: document.getElementById("titleChangeCount"),
  listCount: document.getElementById("listCount"),
  listSubtitle: document.getElementById("listSubtitle")
};

const initialFilters = {
  query: "",
  status: elements.statusFilter.value,
  sort: elements.sortSelect.value
};

const store = createStore({
  season: elements.seasonSelect.value,
  events: [],
  filters: initialFilters,
  selectedEventId: null,
  currentPane: "card",
  isMobileDetailOpen: false,
  statusMessage: "Ready to load WWE events.",
  dataMeta: {
    source: "idle",
    degraded: false,
    cached: false
  }
});

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

function renderApp(state) {
  const visibleEvents = getVisibleEvents(state);
  const selectedEvent = visibleEvents.find((event) => event.id === state.selectedEventId) || null;

  elements.statusLine.textContent = state.statusMessage;
  elements.shell.classList.toggle("mobile-detail-active", state.isMobileDetailOpen);
  document.body.classList.toggle("mobile-detail-open", state.isMobileDetailOpen);

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

  store.setState((state) => ({
    ...state,
    season,
    statusMessage: `Loading WWE ${season} events...`
  }));

  const payload = await loadSeasonEvents(season);
  const message = payload.meta?.message || `Loaded ${payload.events.length} WWE events for season ${season}.`;

  store.setState((state) => ({
    ...state,
    ...reconcileSelection(state, {
      season,
      events: payload.events,
      currentPane: "card",
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

store.subscribe(renderApp);
renderApp(store.getState());
loadEvents();
