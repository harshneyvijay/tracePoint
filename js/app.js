import { scenarios } from "./data.js";
import { difficultyFilter } from "./scenarios.js";
import { Simulator } from "./simulator.js";
import { $, esc, modal } from "./ui.js";
const main = $("#main");
let sim = new Simulator(() => renderConsole());
let difficulty = localStorage.getItem("difficulty") || "ALL";
let paused = false;
function renderList() {
  main.innerHTML = `<div class="page"><div style="display:flex;justify-content:space-between;gap:15px;align-items:end;margin-bottom:22px"><div><div class="eyebrow">SRE / DEVOPS TRAINING</div><h1 class="title">Incident Command Center</h1><p class="muted">Investigate simulated failures across metrics, logs, network, database and deployment history.</p></div><select class="select" id="difficulty">${["ALL", "EASY", "MEDIUM", "HARD", "NIGHTMARE"].map((x) => `<option ${difficulty === x ? "selected" : ""}>${x}</option>`).join("")}</select></div><div class="grid incident-list">${difficultyFilter(
    difficulty,
  )
    .map(
      (s) =>
        `<article class="panel card incident-card"><div class="card-top"><span class="status sev">${s.severity}</span><span class="tag">${s.difficulty}</span></div><h2>${esc(s.id)} · ${esc(s.title)}</h2><p class="muted">Affected service: <b>${esc(s.service)}</b></p><div class="stat-row"><div class="stat"><b>${s.symptoms.p95}s</b><span>P95</span></div><div class="stat"><b>${s.symptoms.errorRate}%</b><span>ERRORS</span></div><div class="stat"><b>${s.symptoms.cpu}%</b><span>CPU</span></div></div><div class="action-row"><button class="btn primary" data-start="${s.id}">Start incident</button></div></article>`,
    )
    .join(
      "",
    )}</div><div class="notice" style="margin-top:18px"><b>SIMULATED INCIDENT</b> — Nothing here represents a real production system. Evidence is generated for training and investigation practice.</div></div>`;
  $("#difficulty").onchange = (e) => {
    difficulty = e.target.value;
    localStorage.setItem("difficulty", difficulty);
    renderList();
  };
  document.querySelectorAll("[data-start]").forEach(
    (b) =>
      (b.onclick = () => {
        sim.load(b.dataset.start);
        paused = false;
        renderConsole();
      }),
  );
}
function renderConsole() {
  if (!sim.scenario) return renderList();
  main.innerHTML = sim.view();
  wire();
}
function wire() {
  document.querySelectorAll("[data-tab]").forEach(
    (b) =>
      (b.onclick = () => {
        sim.state.tab = b.dataset.tab;
        sim.inspect();
      }),
  );
  document.querySelectorAll("[data-log]").forEach(
    (b) =>
      (b.onclick = () => {
        sim.state.logsFilter = b.dataset.log;
        sim.render();
      }),
  );
  document
    .querySelectorAll("[data-hyp]")
    .forEach((b) => (b.onclick = () => sim.diagnose(b.dataset.hyp)));
  document
    .querySelectorAll("[data-rem]")
    .forEach((b) => (b.onclick = () => sim.apply(b.dataset.rem)));
  $("#inspect").onclick = () => sim.inspect();
  $("#reset").onclick = () => {
    sim.load(sim.scenario.id);
  };
  $("#new").onclick = () => {
    sim.scenario = null;
    renderList();
  };
  $("#pause").onclick = () => {
    paused = !paused;
    sim.state.paused = paused;
    sim.render();
  };
  $("#learn").onchange = (e) => {
    sim.state.learn = e.target.checked;
    sim.render();
  };
  $("#post").onclick = () => showPostmortem();
  $("#confirm")?.addEventListener("click", () => {
    if (sim.state.rootCause === sim.scenario.rootCause) {
      sim.state.status = "ROOT CAUSE IDENTIFIED";
      sim.render();
    } else {
      modal(
        `<h2>Diagnosis not supported</h2><p class="muted">The selected hypothesis does not explain enough of the observed evidence. Inspect another source and compare supporting vs contradicting signals.</p><button class="btn primary" onclick="this.closest('.modal').classList.add('hidden')">Continue</button>`,
      );
    }
  });
}
function showPostmortem() {
  if (!sim.scenario) return;
  const score = sim.score();
  const text = sim.postmortem();
  modal(
    `<div class="eyebrow">Incident Handling Score</div><div class="score">${score.total}</div><div class="score-grid"><div class="score-cell"><span>Diagnosis</span><b>${score.diagnosis}</b></div><div class="score-cell"><span>Investigation</span><b>${score.investigation}</b></div><div class="score-cell"><span>Remediation</span><b>${score.remediation}</b></div><div class="score-cell"><span>Efficiency</span><b>${score.efficiency}</b></div></div><div class="postmortem" id="pm">${esc(text)}</div><div class="toolbar" style="margin-top:12px"><button class="btn primary" id="copy">Copy Postmortem</button><button class="btn" id="download">Download .md</button><button class="btn" onclick="this.closest('.modal').classList.add('hidden')">Close</button></div>`,
  );
  $("#copy").onclick = () => navigator.clipboard?.writeText(text);
  $("#download").onclick = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/markdown" }));
    a.download = `${sim.scenario.id}-postmortem.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  if (sim.state.status === "RESOLVED") {
    const history = JSON.parse(localStorage.getItem("incidentHistory") || "[]");
    history.unshift({
      id: sim.scenario.id,
      score: score.total,
      status: sim.state.status,
    });
    localStorage.setItem(
      "incidentHistory",
      JSON.stringify(history.slice(0, 20)),
    );
  }
}
$("#themeBtn").onclick = () => {
  document.body.classList.toggle("light");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("light") ? "light" : "dark",
  );
};
$("#shortcutsBtn").onclick = () =>
  modal(
    `<h2>Keyboard shortcuts</h2><p><b>R</b> reset · <b>P</b> pause/resume · <b>N</b> new incident · <b>L</b> logs · <b>M</b> metrics · <b>H</b> hypotheses · <b>?</b> shortcut help</p><button class="btn primary" onclick="this.closest('.modal').classList.add('hidden')">Close</button>`,
  );
document.addEventListener("keydown", (e) => {
  if (e.target.matches("input,select,textarea")) return;
  const k = e.key.toLowerCase();
  if (k === "?") $("#shortcutsBtn").click();
  else if (k === "r" && sim.scenario) sim.load(sim.scenario.id);
  else if (k === "n") {
    sim.scenario = null;
    renderList();
  } else if (k === "p" && sim.scenario) {
    paused = !paused;
    sim.state.paused = paused;
    sim.render();
  } else if (k === "l" && sim.scenario) {
    sim.state.tab = "logs";
    sim.render();
  } else if (k === "m" && sim.scenario) {
    sim.state.tab = "metrics";
    sim.render();
  } else if (k === "h" && sim.scenario) {
    document
      .querySelector("[data-hyp]")
      ?.scrollIntoView({ behavior: "smooth" });
  }
});
if (localStorage.getItem("theme") === "light")
  document.body.classList.add("light");
renderList();
