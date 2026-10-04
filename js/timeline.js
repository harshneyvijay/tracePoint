export function renderTimeline(arr) {
  let out = "";
  for (let i = 0; i < arr.length; i += 2)
    out += `<div class="event"><time>${arr[i]}</time><div>${arr[i + 1] || ""}</div></div>`;
  return `<div class="timeline">${out}</div>`;
}
