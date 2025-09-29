import { useMemo } from "react";

export default function useLevelData({
  selectedLevels,
  startLevel,
  materials,
  materialColumns,
  safeStartProgress,
  materialMultiplier,
  countersPerTimedAction,
  safeCounterTime,
  isSimpleItem,
}) {
  const levelData = useMemo(() => {
    const breakdown = [];
    const materialSet = new Set(materialColumns);
    const totals = {
      totalCounters: 0,
      totalCopies: 0,
      maxMaterials: materialColumns.reduce((acc, name) => {
        acc[name] = 0;
        return acc;
      }, {}),
    };

    selectedLevels.forEach((lvl, idx) => {
      const countersNeeded =
        idx === 0
          ? Math.max((lvl.counter || 0) - safeStartProgress, 0)
          : lvl.counter || 0;
      const copiesRequired = idx === 0 && safeStartProgress > 0 ? 0 : lvl.copies || 0;
      totals.totalCounters += countersNeeded;
      totals.totalCopies += copiesRequired;

      const materialsForLevel = {};
      materials.forEach(({ name, qty }) => {
        const trimmedName = name?.trim();
        if (!trimmedName || !materialSet.has(trimmedName)) return;
        const perCounter = Number(qty);
        if (!Number.isFinite(perCounter) || perCounter < 0) return;
        const amount = countersNeeded * perCounter;
        totals.maxMaterials[trimmedName] += amount;
        if (amount) materialsForLevel[trimmedName] = amount;
      });

      breakdown.push({
        level: lvl.level ?? startLevel + idx + 1,
        countersRequired: countersNeeded,
        copiesRequired,
        materials: materialsForLevel,
      });
    });

    return { breakdown, totals };
  }, [
    materialColumns,
    materials,
    safeStartProgress,
    selectedLevels,
    startLevel,
  ]);

  const { breakdown: levelBreakdown, totals: levelTotals } = levelData;
  const maxMaterials = levelTotals.maxMaterials;
  const totalMaterials = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(maxMaterials).map(([name, amount]) => [
          name,
          amount * materialMultiplier,
        ])
      ),
    [materialMultiplier, maxMaterials]
  );

  const timedCounters = levelTotals.totalCounters * materialMultiplier;
  const effectiveActions =
    countersPerTimedAction > 0
      ? timedCounters / countersPerTimedAction
      : timedCounters;
  const totalTimeSeconds = isSimpleItem
    ? 0
    : Math.round(effectiveActions * safeCounterTime);

  return {
    levelBreakdown,
    levelTotals,
    maxMaterials,
    totalMaterials,
    totalTimeSeconds,
  };
}
