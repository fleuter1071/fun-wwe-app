export function renderStats(elements, events) {
  const finishedCount = events.filter((event) => event.isFinished).length;
  const upcomingCount = events.length - finishedCount;
  const titleChangeCount = events.reduce((sum, event) => sum + event.titleChangeCount, 0);

  elements.visibleCount.textContent = events.length;
  elements.finishedCount.textContent = finishedCount;
  elements.upcomingCount.textContent = upcomingCount;
  elements.titleChangeCount.textContent = titleChangeCount;
  elements.listCount.textContent = `${events.length} visible`;
  elements.listSubtitle.textContent = events.length
    ? "Browse the season and open a show"
    : "No events match your current filters";
}
