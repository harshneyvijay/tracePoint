export const $ = (s) => document.querySelector(s);
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
export function lineChart(points) {
  const w = 700,
    h = 180,
    p = 18,
    max = Math.max(...points) * 1.12,
    min = Math.min(...points) * 0.9;
  const xy = points
    .map(
      (v, i) =>
        `${p + (i * (w - 2 * p)) / (points.length - 1)},${h - p - ((v - min) / (max - min)) * (h - 2 * p)}`,
    )
    .join(" ");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="Simulated metric chart"><line x1="18" y1="162" x2="682" y2="162" stroke="var(--border)"/><polyline points="${xy}" fill="none" stroke="var(--accent)" stroke-width="3"/></svg>`;
}
export function modal(html) {
  const m = $("#modal");
  m.innerHTML = `<div class="modal-card">${html}</div>`;
  m.classList.remove("hidden");
  m.onclick = (e) => {
    if (e.target === m) m.classList.add("hidden");
  };
}
