export function clampPercent(val) {
  const num = Number(val);
  if (Number.isNaN(num)) return 50;
  if (num < 0) return 0;
  if (num > 100) return 100;
  return num;
}

export function calcPercentFromX(clientX, rectLeft, rectWidth) {
  if (!rectWidth || rectWidth <= 0) return 50;
  const raw = ((clientX - rectLeft) / rectWidth) * 100;
  return clampPercent(raw);
}

export function formatSplitStyle(percent) {
  const clamped = clampPercent(percent);
  return clamped.toFixed(1) + "%";
}

export function getAriaStatus(percent) {
  const p = Math.round(clampPercent(percent));
  if (p === 100) return "Showing 100% before work";
  if (p === 0) return "Showing 100% after work";
  return p + "% before work and " + (100 - p) + "% after work";
}
