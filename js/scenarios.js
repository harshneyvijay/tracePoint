import { scenarios } from "./data.js";
export function getScenario(id) {
  return scenarios.find((s) => s.id === id);
}
export function difficultyFilter(level) {
  return level === "ALL"
    ? scenarios
    : scenarios.filter((s) => s.difficulty === level);
}
export function validateScenario(s) {
  return !!(s && s.id && s.rootCause && s.evidence && s.remediation);
}
