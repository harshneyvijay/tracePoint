import { getScenario } from "./scenarios.js";
import { calculateScore } from "./scoring.js";
import { evidenceForHypothesis } from "./evidence.js";
import { renderTimeline } from "./timeline.js";
import { esc, $, lineChart, modal } from "./ui.js";
export class Simulator {
  constructor(render) {
    this.render = render;
    this.resetState();
  }
  load(id) {
    this.scenario = getScenario(id);
    this.resetState();
    this.state.status = "INVESTIGATING";
    this.started = Date.now();
    this.render();
  }
  resetState() {
    this.state = {
      tab: "metrics",
      inspections: 0,
      budget: 10,
      rootCause: null,
      wrongDiagnoses: 0,
      wrongRemediations: 0,
      remediationCorrect: false,
      actions: [],
      status: "READY",
      logsFilter: "ALL",
      learn: false,
      recovery: 0,
    };
    this.started = null;
    this.scenario = this.scenario || null;
  }
  inspect() {
    if (this.state.budget > 0) this.state.budget--;
    this.state.inspections++;
    this.render();
  }
  diagnose(h) {
    this.state.rootCause = h;
    if (h === this.scenario.rootCause) {
      this.state.status = "ROOT CAUSE IDENTIFIED";
    } else {
      this.state.wrongDiagnoses++;
      this.state.status = "INVESTIGATING";
    }
    this.render();
  }
  apply(key) {
    const item = this.scenario.remediation.find((x) => x.key === key);
    this.state.actions.push(key);
    if (item?.correct) {
      this.state.remediationCorrect = true;
      this.state.status = "REMEDIATING";
      this.recover();
    } else {
      this.state.wrongRemediations++;
      this.render();
      setTimeout(() => this.render(), 800);
    }
  }
  recover() {
    let n = 0;
    const tick = () => {
      n++;
      this.state.recovery = n;
      this.render();
      if (n < 4) setTimeout(tick, 550);
      else this.state.status = "RESOLVED";
    };
    tick();
  }
  score() {
    return calculateScore(this.state, this.scenario);
  }
  postmortem() {
    const s = this.scenario;
    return `INCIDENT POSTMORTEM\n\n${s.id} — ${s.title}\nSEVERITY: ${s.severity}\nSERVICE: ${s.service}\n\nIMPACT\n${s.title} caused elevated latency and request failures during the simulated incident window.\n\nROOT CAUSE\n${s.rootCause.replaceAll("_", " ")}\n\nDETECTION\nAutomated latency/error signals triggered the incident.\n\nRESOLUTION\n${this.state.actions.length ? this.state.actions.join(", ") : "Investigation completed without a remediation action."}\n\nPREVENTION\n• Add targeted health and saturation alerts\n• Add regression coverage around the failing component\n• Correlate deployment and dependency signals\n• Document the remediation runbook\n\nSIMULATION NOTE\nAll infrastructure, logs and metrics in this report are generated training data.`;
  }
  view() {
    const s = this.scenario,
      st = this.state,
      e = s.evidence;
    let content = "";
    if (st.tab === "metrics")
      content = `<div class="panel-body">${lineChart(e.metrics.points)}<div class="kv"><span>p50 latency</span><b>${s.symptoms.p50}s</b></div><div class="kv"><span>p95 latency</span><b>${s.symptoms.p95}s</b></div><div class="kv"><span>p99 latency</span><b>${s.symptoms.p99}s</b></div><div class="kv"><span>Error rate</span><b>${s.symptoms.errorRate}%</b></div><div class="kv"><span>Requests/sec</span><b>${s.symptoms.rps}</b></div><div class="kv"><span>CPU / Memory</span><b>${s.symptoms.cpu}% / ${s.symptoms.memory}%</b></div><div class="notice">${esc(e.metrics.note)}</div></div>`;
    else if (st.tab === "logs") {
      const logs = e.logs.filter(
        (x) => st.logsFilter === "ALL" || x[1] === st.logsFilter,
      );
      content = `<div class="panel-body"><div class="filters">${["ALL", "INFO", "WARN", "ERROR"].map((x) => `<button class="btn small ${st.logsFilter === x ? "primary" : ""}" data-log="${x}">${x}</button>`).join("")}</div>${logs.map((x) => `<div class="log-row"><span class="log-time">${esc(x[0])}</span><b class="${x[1]}">${x[1]}</b> <span class="muted">${esc(x[2])}</span> ${esc(x[3])}</div>`).join("")}</div>`;
    } else if (st.tab === "network")
      content = `<div class="panel-body"><div class="trace">${e.network.path.map((x, i) => `${i ? '<span class="arrow">→</span>' : ""}<div class="trace-node"><b>${esc(x)}</b><small class="muted">${e.network.latency[i] || ""}</small></div>`).join("")}</div><div class="kv"><span>Failures / timeouts</span><b>${esc(e.network.failures)}</b></div></div>`;
    else if (st.tab === "database")
      content = `<div class="panel-body"><div class="kv"><span>Active connections</span><b>${e.database.active} / ${e.database.max}</b></div><div class="kv"><span>Idle</span><b>${e.database.idle}</b></div><div class="kv"><span>Waiting requests</span><b>${e.database.waiting}</b></div><div class="kv"><span>Average query latency</span><b>${e.database.avg}</b></div><div class="kv"><span>P95 query latency</span><b>${e.database.p95}</b></div><div class="kv"><span>Locks</span><b>${e.database.locks}</b></div><div class="notice">${esc(e.database.note)}</div></div>`;
    else if (st.tab === "deployment")
      content = `<div class="panel-body">${e.deployment.map((d) => `<div class="diag-box"><div style="display:flex;justify-content:space-between"><b>${esc(d.version)}</b><span class="status ${d.status === "HEALTHY" ? "ok" : "warn"}">${esc(d.status)}</span></div><small class="muted">${esc(d.time)}</small><div class="small" style="margin-top:7px">${d.changes.map(esc).join(" · ")}</div></div>`).join("")}</div>`;
    const tabs = ["metrics", "logs", "network", "database", "deployment"];
    return `<div class="console"><aside class="sidebar"><div class="eyebrow">Incident</div><h2 style="margin:7px 0">${esc(s.id)}</h2><span class="status sev">${esc(s.severity)}</span><p><b>${esc(s.title)}</b></p><div class="side-section"><h3>Status</h3><span class="status ${st.status === "RESOLVED" ? "ok" : st.status === "ROOT CAUSE IDENTIFIED" ? "warn" : ""}">${esc(st.status)}</span></div><div class="side-section"><h3>Evidence</h3>${tabs.map((t) => `<button class="side-link ${st.tab === t ? "active" : ""}" data-tab="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div><div class="side-section"><h3>Budget</h3><b>${Math.max(0, st.budget)} / 10</b><div class="progress"><i style="width:${st.budget * 10}%"></i></div></div><div class="side-section"><label><input id="learn" type="checkbox" ${st.learn ? "checked" : ""}> Learn Mode</label></div><button class="btn" id="reset">↻ Reset</button> <button class="btn" id="new">New</button></aside><section class="workspace"><div style="display:flex;justify-content:space-between;gap:10px;align-items:start"><div><div class="eyebrow">${esc(s.service)} · ${esc(s.difficulty)}</div><h1 class="title">${esc(s.title)}</h1><span class="muted">Started 14:32 UTC · simulated training environment</span></div><div class="toolbar"><button class="btn" id="pause">${st.paused ? "Resume" : "Pause"}</button><button class="btn" id="post">Postmortem</button></div></div><div class="metrics">${[
      ["P95 LATENCY", s.symptoms.p95 + "s", "↑ elevated"],
      ["ERROR RATE", s.symptoms.errorRate + "%", "↑ elevated"],
      ["CPU", s.symptoms.cpu + "%", "system"],
      ["MEMORY", s.symptoms.memory + "%", "system"],
    ]
      .map(
        (x) =>
          `<div class="metric"><span class="eyebrow">${x[0]}</span><div class="value">${x[1]}</div><div class="delta">${x[2]}</div></div>`,
      )
      .join(
        "",
      )}</div><div class="panel"><div class="panel-head"><div><b>${st.tab.toUpperCase()}</b><span class="muted small"> · evidence inspection</span></div><button class="btn small" id="inspect">Inspect evidence −1</button></div>${content}</div><div class="evidence-grid" style="margin-top:14px"><div class="panel"><div class="panel-head"><b>HYPOTHESIS BOARD</b></div><div class="panel-body">${["network_degradation", "db_connection_pool", "db_overload", "cpu_saturation", "memory_leak", "bad_deployment", "dns_failure", "external_dependency"].map((h) => `<button class="hypothesis ${st.rootCause === h ? "selected" : ""}" data-hyp="${h}">○ ${h.replaceAll("_", " ")}</button>`).join("")} ${st.rootCause ? this.diagnosisBox() : ""}</div></div><div class="panel"><div class="panel-head"><b>INCIDENT TIMELINE</b></div><div class="panel-body">${renderTimeline(s.timeline)}${st.status === "ROOT CAUSE IDENTIFIED" || st.status === "REMEDIATING" || st.status === "RESOLVED" ? this.remediationBox() : ""}</div></div></div><div class="panel terminal" style="margin-top:14px"><div class="line">[14:32:01] ALERT latency threshold exceeded</div><div class="line">[14:32:04] ${esc(s.service)} p95 = ${s.symptoms.p95}s</div><div class="line">[14:32:07] error rate = ${s.symptoms.errorRate}%</div><div class="line">[14:32:11] incident ${esc(s.id)} created</div><div class="line">[14:32:15] investigation started</div>${st.recovery ? `<div class="line">[14:38:0${st.recovery}] remediation signal ${st.recovery}/4 · recovery progressing</div>` : ""}</div></section></div>`;
  }
  diagnosisBox() {
    const s = this.scenario,
      st = this.state,
      e = evidenceForHypothesis(s, st.rootCause);
    return `<div class="diag-box"><div class="eyebrow">Hypothesis</div><b>${esc(st.rootCause.replaceAll("_", " "))}</b><p class="small"><b>Supporting</b><br>✓ ${e.support.join("<br>✓ ") || "Evidence pending inspection"}</p><p class="small"><b>Contradicting</b><br>✗ ${e.against.join("<br>✗ ") || "None identified"}</p><button class="btn primary" id="confirm">${st.rootCause === s.rootCause ? "Diagnosis confirmed" : "Submit diagnosis"}</button></div>`;
  }
  remediationBox() {
    const s = this.scenario,
      st = this.state;
    return `<div class="diag-box"><div class="eyebrow">${st.status}</div><b>Select remediation</b><div style="display:grid;gap:6px;margin-top:8px">${s.remediation.map((r) => `<button class="btn" data-rem="${r.key}">${esc(r.label)}</button>`).join("")}</div>${st.status === "RESOLVED" ? '<p class="status ok" style="display:inline-block;margin-top:10px">SYSTEM RECOVERED</p>' : ""}</div>`;
  }
}
