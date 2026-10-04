export function evidenceForHypothesis(scenario, h) {
  const e = scenario.evidence;
  const map = {
    db_connection_pool: {
      support: [
        "connections_at_limit",
        "waiting_requests",
        "connection_timeout",
      ],
      against: ["CPU not saturated"],
    },
    memory_leak: {
      support: ["heap continuously increasing", "GC pressure increasing"],
      against: ["database healthy"],
    },
    bad_deployment: {
      support: ["recent deployment", "new exception after release"],
      against: ["no release correlation"],
    },
    dns_failure: {
      support: ["DNS resolution failures", "hostname lookup timeout"],
      against: ["application CPU healthy"],
    },
    external_dependency: {
      support: ["dependency latency high", "provider timeouts"],
      against: ["internal DB healthy"],
    },
    cpu_saturation: {
      support: ["CPU near 100%", "request queue growing"],
      against: ["memory stable", "database healthy"],
    },
  };
  return map[h] || { support: [], against: [] };
}
export function inspectCost() {
  return 1;
}
