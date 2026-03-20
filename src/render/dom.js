import { DEFAULT_EVENT_IMAGE } from "../shared/events.js";

export function bindImageFallbacks(root) {
  root.querySelectorAll("img[data-event-image]").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied === "true") return;
      img.dataset.fallbackApplied = "true";
      img.src = DEFAULT_EVENT_IMAGE;
    });
  });
}
