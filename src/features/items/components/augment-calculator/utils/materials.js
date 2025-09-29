export const formatMaterialName = (rawName = "") => {
  if (typeof rawName !== "string") {
    return "";
  }
  const normalized = rawName
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) {
    return "";
  }
  return normalized
    .toLowerCase()
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
};

export const mapMaterials = (entries) =>
  entries.map(([name, qty]) => ({
    id: crypto.randomUUID(),
    name,
    qty,
  }));

export const deriveDefaultMaterials = ({
  item,
  normalizedTotalCounters,
  hasAugmentOverride,
}) => {
  const craftData = item?.craft || {};
  const hasScrapping =
    craftData.scrapping && Object.keys(craftData.scrapping).length > 0;
  const hasAugmenting =
    craftData.augmenting && Object.keys(craftData.augmenting).length > 0;
  const treatAugmentingAsPerCounter =
    hasScrapping || (hasAugmenting && hasAugmentOverride);
  const source = hasScrapping
    ? craftData.scrapping
    : craftData.augmenting || {};

  if (Object.keys(source).length === 0) {
    return { "Example Material": 0 };
  }

  const safeTotalCounters =
    normalizedTotalCounters > 0 ? normalizedTotalCounters : 1;

  return Object.entries(source).reduce((acc, [name, totalQty]) => {
    const displayName = formatMaterialName(name);
    if (!displayName) {
      return acc;
    }

    const numericTotal = Number(totalQty);
    if (!Number.isFinite(numericTotal)) {
      acc[displayName] =
        typeof acc[displayName] === "number" ? acc[displayName] : 0;
      return acc;
    }

    const baseAmount = treatAugmentingAsPerCounter
      ? Math.max(numericTotal, 0)
      : numericTotal / safeTotalCounters;
    const previousAmount =
      typeof acc[displayName] === "number" ? acc[displayName] : 0;

    acc[displayName] = previousAmount + baseAmount;
    return acc;
  }, {});
};
