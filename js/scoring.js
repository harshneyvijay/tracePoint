export function calculateScore(state, scenario) {
  const diag =
    state.rootCause === scenario.rootCause
      ? 100
      : Math.max(0, 25 - state.wrongDiagnoses * 10);
  const inv = Math.max(
    35,
    100 - state.inspections * 7 - state.wrongDiagnoses * 5,
  );
  const rem = state.remediationCorrect
    ? 100
    : Math.max(20, 55 - state.wrongRemediations * 15);
  const eff = Math.max(
    30,
    100 - Math.max(0, state.inspections - 3) * 9 - state.wrongRemediations * 5,
  );
  const total = Math.round(diag * 0.4 + inv * 0.2 + rem * 0.3 + eff * 0.1);
  return {
    diagnosis: diag,
    investigation: inv,
    remediation: rem,
    efficiency: eff,
    total,
  };
}
