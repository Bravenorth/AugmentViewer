import { augmentRequirements } from "../../../../../data/augmentRequirements";

export const buildRequirementTable = (item) => {
  const override = item?.augmentOverride;
  const hasFixedSuccess =
    override && typeof override.fixedSuccessCount === "number";
  const maxAugLevel = Number(item?.maxAugLevel);
  const cappedLevels = Number.isFinite(maxAugLevel)
    ? Math.max(Math.min(maxAugLevel, augmentRequirements.length), 0)
    : augmentRequirements.length;
  const levelCount =
    cappedLevels > 0 ? cappedLevels : augmentRequirements.length;

  const baseTable = augmentRequirements
    .slice(0, levelCount)
    .map(({ level, counter, copies }) => ({
      level,
      counter,
      copies,
    }));

  if (!hasFixedSuccess) {
    return baseTable;
  }

  const successCount = Math.max(Number(override.fixedSuccessCount) || 0, 0);
  const perLevelCounter = successCount > 0 ? successCount : 1;

  return baseTable.map(({ level }) => ({
    level,
    counter: perLevelCounter,
    copies: 0,
  }));
};
