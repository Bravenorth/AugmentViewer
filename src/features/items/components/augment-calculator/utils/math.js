export const clamp = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return typeof min === "number" ? min : 0;
  }
  const lowerBound = typeof min === "number" ? min : numeric;
  const upperBound = typeof max === "number" ? max : numeric;
  return Math.min(Math.max(numeric, lowerBound), upperBound);
};
