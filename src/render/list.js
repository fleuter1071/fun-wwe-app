import { bindImageFallbacks } from "./dom.js";
import { formatDate, formatTime } from "./format.js";

export function renderEventList(element, events, selectedEventId, onSelect) {
  if (!events.length) {
    element.innerHTML = '<div class="empty-state">No events match your current filters.</div>';
    return;
  }

  element.innerHTML = events.map((event) => {
    const active = event.id === selectedEventId;
    const statusClass = event.isFinished ? "status-finished" : "status-upcoming";

    return `
      <article class="event-card ${active ? "active" : ""}" data-id="${event.id}">
        <div class="thumb-wrap">
          ${active ? '<span class="viewing-chip">Now viewing</span>' : ""}
          <img class="thumb" data-event-image src="${event.imageUrl}" alt="${event.name}" />
        </div>
        <div class="event-body">
          <h3 class="event-title">${event.name}</h3>
          <div class="meta">${formatDate(event.localDate || event.eventDate)} &bull; ${formatTime(event.localTime)}</div>
          <div class="meta">${event.venue} &bull; ${event.city}</div>
          <div class="chips">
            <span class="chip ${statusClass}">${event.statusLabel}</span>
            <span class="chip">Card ${event.matchCount}</span>
            <span class="chip">Titles ${event.titleMatchCount}</span>
            ${event.titleChangeCount ? `<span class="chip title-change">Changes ${event.titleChangeCount}</span>` : ""}
          </div>
        </div>
      </article>
    `;
  }).join("");

  bindImageFallbacks(element);

  element.querySelectorAll(".event-card").forEach((card) => {
    card.addEventListener("click", () => onSelect(card.dataset.id));
  });
}
