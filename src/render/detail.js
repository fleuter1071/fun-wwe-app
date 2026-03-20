import { bindImageFallbacks } from "./dom.js";
import { formatDate, formatTime } from "./format.js";

export function renderEventDetail(element, event, currentPane, onPaneChange) {
  if (!event) {
    element.innerHTML = `
      <div class="detail-empty">
        <div class="detail-empty-mark">WWE</div>
        <h2>No event selected</h2>
        <p>No event is currently selected because nothing matches your filters.</p>
      </div>
    `;
    return;
  }

  const dateTimeLine = `${formatDate(event.localDate || event.eventDate)} &bull; ${formatTime(event.localTime)}`;
  const videoLink = event.videoUrl
    ? `<a class="video-link" href="${event.videoUrl}" target="_blank" rel="noopener noreferrer">Watch related video</a>`
    : '<div class="note">No related video link was available for this event.</div>';

  element.innerHTML = `
    <div class="detail-body">
      <section class="event-detail-header">
        <div class="event-detail-copy">
          <div class="event-detail-identity">
            <div class="event-detail-overline">Now Viewing</div>
            <h1 class="event-detail-title">${event.name}</h1>
            <p class="event-detail-datetime">${dateTimeLine}</p>
          </div>

          <div class="event-detail-location">
            <div class="event-detail-venue">${event.venue}</div>
            <div class="event-detail-place">${event.locationLine}</div>
          </div>

          <div class="event-detail-stats" aria-label="Event quick stats">
            <span class="stat-chip">${event.matchCount} match${event.matchCount === 1 ? "" : "es"}</span>
            <span class="stat-chip">${event.titleMatchCount} title match${event.titleMatchCount === 1 ? "" : "es"}</span>
            <span class="stat-chip">${event.titleChangeCount} title change${event.titleChangeCount === 1 ? "" : "s"}</span>
          </div>
        </div>

        <section class="event-detail-hero">
          <img data-event-image src="${event.imageUrl}" alt="${event.name}" />
          <span class="event-status-badge">${event.statusLabel}</span>
        </section>
      </section>

      <section class="block block-primary">
        <div class="block-header">
          <div class="block-title-wrap">
            <h3>Match Information</h3>
            <p>Read the announced card or move straight into the finished results without leaving this event page.</p>
          </div>

          <div class="segmented" role="tablist" aria-label="Match information views">
            <button class="segment-btn ${currentPane === "card" ? "active" : ""}" data-pane="card" aria-selected="${currentPane === "card"}">Announced Card</button>
            <button class="segment-btn ${currentPane === "results" ? "active" : ""}" data-pane="results" aria-selected="${currentPane === "results"}">Results</button>
          </div>
        </div>

        <div class="block-body">
          <div class="match-pane ${currentPane === "card" ? "active" : ""}" data-pane-body="card">
            <div class="text-block">${event.description || "No announced card available."}</div>
          </div>

          <div class="match-pane ${currentPane === "results" ? "active" : ""}" data-pane-body="results">
            <div class="text-block">${event.results || "No results available."}</div>
          </div>
        </div>
      </section>

      <section class="block">
        <div class="block-header">
          <div class="block-title-wrap">
            <h3>Media & Context</h3>
            <p>Related video when available, plus a short note on how the quick event signals are derived.</p>
          </div>
        </div>
        <div class="block-body">
          ${videoLink}
          <div class="note context-note">
            Match count, title matches, and title changes are inferred from the event text fields, so they are useful
            for browsing and summarizing but not perfect as official structured stats.
          </div>
        </div>
      </section>
    </div>
  `;

  bindImageFallbacks(element);

  element.querySelectorAll(".segment-btn").forEach((button) => {
    button.addEventListener("click", () => onPaneChange(button.dataset.pane));
  });
}
