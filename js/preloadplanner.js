export function collectUniqueUrls(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (let i = 0; i < list.length; i += 1) {
    const raw = typeof list[i] === "string" ? list[i].trim() : "";
    if (!raw || seen.has(raw)) continue;
    seen.add(raw);
    out.push(raw);
  }
  return out;
}

export function getAdjacentIndices(index, total) {
  if (!Number.isInteger(total) || total <= 0) return [];
  const safeIndex = ((index % total) + total) % total;
  if (total === 1) return [safeIndex];
  const nextIndex = (safeIndex + 1) % total;
  const prevIndex = (safeIndex - 1 + total) % total;
  const result = [safeIndex];
  if (nextIndex !== safeIndex) result.push(nextIndex);
  if (prevIndex !== safeIndex && prevIndex !== nextIndex) result.push(prevIndex);
  return result;
}

export function buildPreloadPlan(priorityUrls, gridUrls) {
  const combined = [];
  if (Array.isArray(priorityUrls)) combined.push(...priorityUrls);
  if (Array.isArray(gridUrls)) combined.push(...gridUrls);
  return collectUniqueUrls(combined);
}
