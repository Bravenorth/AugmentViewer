import { useEffect, useMemo, useRef, useState } from "react";
import getItemKey from "../../../utils/getItemKey";
import { clamp } from "../utils/math";
import { deriveDefaultMaterials } from "../utils/materials";
import { buildRequirementTable } from "../utils/requirements";
import {
  GLOBAL_PREFERENCES_KEY,
  readConfigStore,
  resolveLegacyConfig,
  sanitizeGlobalPreferences,
  writeConfigStore,
} from "../utils/storage";

export const DEFAULT_CONFIG = Object.freeze({
  startLevel: 0,
  startProgress: 0,
  targetLevel: 7,
  counterTime: 3,
  criticalChance: 10,
  quickStudyLevel: 0,
});

const DEFAULT_GLOBAL_PREFERENCES = Object.freeze({
  criticalChance: DEFAULT_CONFIG.criticalChance,
  quickStudyLevel: DEFAULT_CONFIG.quickStudyLevel,
});

const sanitizeGlobalPrefs = (prefs) =>
  sanitizeGlobalPreferences(prefs, DEFAULT_GLOBAL_PREFERENCES, clamp);

export default function useAugmentConfig(item) {
  const itemClass = (item?.class || "").toLowerCase();
  const isKeyItem = itemClass === "key";
  const isScrollItem = itemClass.includes("scroll");
  const isSimpleItem = isKeyItem || isScrollItem;

  const requirementTable = useMemo(() => buildRequirementTable(item), [item]);
  const maxLevelIndex = Math.max(requirementTable.length - 1, 0);
  const targetLevelMaxOption = Math.max(requirementTable.length, 0);

  const totalCountersAllLevels = useMemo(
    () =>
      requirementTable.reduce(
        (sum, lvl) => sum + Math.max(lvl.counter || 0, 0),
        0
      ),
    [requirementTable]
  );

  const sanitizeConfig = useMemo(() => {
    return (config = {}) => {
      const merged = { ...DEFAULT_CONFIG, ...config };
      const safeMaxLevelIndex = Math.max(maxLevelIndex, 0);
      const safeTargetMax = Math.max(targetLevelMaxOption, 0);

      const startLevelValue = clamp(
        Math.round(merged.startLevel),
        0,
        safeMaxLevelIndex
      );
      const targetLevelValue = clamp(
        Math.round(merged.targetLevel),
        0,
        safeTargetMax
      );
      const normalizedTarget = Math.max(targetLevelValue, startLevelValue);
      const maxCountersForStart =
        requirementTable[startLevelValue]?.counter ?? 0;

      return {
        startLevel: startLevelValue,
        startProgress: isSimpleItem
          ? 0
          : clamp(merged.startProgress, 0, maxCountersForStart),
        targetLevel: normalizedTarget,
        counterTime: isSimpleItem ? 0 : clamp(merged.counterTime, 0, undefined),
        criticalChance: isSimpleItem
          ? 0
          : clamp(merged.criticalChance, 0, 100),
        quickStudyLevel: isSimpleItem
          ? 0
          : clamp(merged.quickStudyLevel, 0, 20),
      };
    };
  }, [isSimpleItem, maxLevelIndex, requirementTable, targetLevelMaxOption]);

  const areConfigsEqual = useMemo(() => {
    return (left, right) => {
      const a = sanitizeConfig(left);
      const b = sanitizeConfig(right);
      return Object.keys(DEFAULT_CONFIG).every((key) => a[key] === b[key]);
    };
  }, [sanitizeConfig]);

  const defaultSanitizedConfig = useMemo(
    () => sanitizeConfig(DEFAULT_CONFIG),
    [sanitizeConfig]
  );

  const [startLevel, setStartLevel] = useState(
    defaultSanitizedConfig.startLevel
  );
  const [startProgress, setProgress] = useState(
    defaultSanitizedConfig.startProgress
  );
  const [targetLevel, setTargetLevel] = useState(
    defaultSanitizedConfig.targetLevel
  );
  const [counterTime, setCounterTime] = useState(
    defaultSanitizedConfig.counterTime
  );
  const [criticalChance, setCriticalChance] = useState(
    DEFAULT_GLOBAL_PREFERENCES.criticalChance
  );
  const [quickStudyLevel, setQuickStudyLevel] = useState(
    DEFAULT_GLOBAL_PREFERENCES.quickStudyLevel
  );

  const configHydratedRef = useRef(false);
  const lastSavedConfigRef = useRef(defaultSanitizedConfig);

  const hasAugmentOverride = Boolean(
    item?.augmentOverride &&
      typeof item.augmentOverride.fixedSuccessCount === "number"
  );
  const normalizedTotalCounters =
    totalCountersAllLevels > 0 ? totalCountersAllLevels : 1;

  const defaultMaterials = useMemo(
    () =>
      deriveDefaultMaterials({
        item,
        normalizedTotalCounters,
        hasAugmentOverride,
      }),
    [hasAugmentOverride, item, normalizedTotalCounters]
  );

  const applyConfig = (config) => {
    const sanitized = sanitizeConfig(config);
    const maxCounters =
      requirementTable[sanitized.startLevel]?.counter ??
      sanitized.startProgress;
    setStartLevel(sanitized.startLevel);
    setTargetLevel(sanitized.targetLevel);
    setProgress(clamp(sanitized.startProgress, 0, maxCounters));
    setCounterTime(sanitized.counterTime);
    setCriticalChance(sanitized.criticalChance);
    setQuickStudyLevel(sanitized.quickStudyLevel);
  };

  useEffect(() => {
    configHydratedRef.current = false;
    const key = getItemKey(item) ?? "unknown-item";
    const store = readConfigStore();
    const globalPrefs = sanitizeGlobalPrefs(store[GLOBAL_PREFERENCES_KEY]);
    const rawEntry = store[key];
    const resolved = resolveLegacyConfig(rawEntry);
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...(resolved ?? {}),
      ...globalPrefs,
    };
    const sanitizedConfig = sanitizeConfig(mergedConfig);

    applyConfig(sanitizedConfig);
    lastSavedConfigRef.current = sanitizedConfig;
    configHydratedRef.current = true;
  }, [item, sanitizeConfig]);

  useEffect(() => {
    if (!configHydratedRef.current || !item) return;
    const key = getItemKey(item);
    if (!key) return;

    const sanitized = sanitizeConfig({
      startLevel,
      startProgress,
      targetLevel,
      counterTime,
      criticalChance,
      quickStudyLevel,
    });

    if (areConfigsEqual(sanitized, lastSavedConfigRef.current)) {
      return;
    }

    const store = readConfigStore();
    store[GLOBAL_PREFERENCES_KEY] = sanitizeGlobalPrefs({
      criticalChance: sanitized.criticalChance,
      quickStudyLevel: sanitized.quickStudyLevel,
    });

    const {
      criticalChance: _criticalChance,
      quickStudyLevel: _quickStudyLevel,
      ...itemSpecificConfig
    } = sanitized;

    const sanitizedWithoutGlobals = {
      ...sanitized,
      criticalChance: DEFAULT_CONFIG.criticalChance,
      quickStudyLevel: DEFAULT_CONFIG.quickStudyLevel,
    };

    if (areConfigsEqual(sanitizedWithoutGlobals, DEFAULT_CONFIG)) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        delete store[key];
      }
    } else {
      store[key] = itemSpecificConfig;
    }

    writeConfigStore(store);
    lastSavedConfigRef.current = sanitized;
  }, [
    areConfigsEqual,
    counterTime,
    criticalChance,
    item,
    quickStudyLevel,
    sanitizeConfig,
    startLevel,
    startProgress,
    targetLevel,
  ]);

  useEffect(() => {
    setProgress((prev) => {
      const maxCounters = requirementTable[startLevel]?.counter ?? 0;
      return clamp(prev, 0, maxCounters);
    });
  }, [requirementTable, startLevel]);

  const selectedLevels = useMemo(() => {
    if (targetLevel <= startLevel) {
      return [];
    }
    return requirementTable.slice(startLevel, targetLevel);
  }, [requirementTable, startLevel, targetLevel]);

  const safeStartProgress = isSimpleItem
    ? 0
    : Math.max(Number(startProgress) || 0, 0);
  const safeCounterTime = isSimpleItem
    ? 0
    : Math.max(Number(counterTime) || 0, 0);
  const safeCriticalChance = isSimpleItem
    ? 0
    : Math.max(0, Math.min(Number(criticalChance) || 0, 100));
  const safeQuickStudyLevel = isSimpleItem
    ? 0
    : Math.max(0, Math.min(Number(quickStudyLevel) || 0, 20));
  const quickStudyEfficiency = Math.min(safeQuickStudyLevel * 0.04, 0.8);
  const critRate = safeCriticalChance / 100;
  const materialMultiplier = Math.min(Math.max(1 - critRate, 0), 1);
  const countersPerTimedAction = isSimpleItem ? 1 : 1 + quickStudyEfficiency;

  const currentConfig = useMemo(
    () => ({
      startLevel,
      startProgress: safeStartProgress,
      targetLevel,
      counterTime: safeCounterTime,
      criticalChance: safeCriticalChance,
      quickStudyLevel: safeQuickStudyLevel,
    }),
    [
      safeCounterTime,
      safeCriticalChance,
      safeQuickStudyLevel,
      safeStartProgress,
      startLevel,
      targetLevel,
    ]
  );

  const isDefaultConfig = useMemo(
    () => areConfigsEqual(currentConfig, DEFAULT_CONFIG),
    [areConfigsEqual, currentConfig]
  );

  const maxCountersAtStart = requirementTable[startLevel]?.counter ?? 0;

  const resetConfig = () => {
    applyConfig(DEFAULT_CONFIG);
  };

  return {
    isSimpleItem,
    requirementTable,
    maxLevelIndex,
    targetLevelMaxOption,
    startLevel,
    setStartLevel,
    startProgress,
    setProgress,
    targetLevel,
    setTargetLevel,
    counterTime,
    setCounterTime,
    criticalChance,
    setCriticalChance,
    quickStudyLevel,
    setQuickStudyLevel,
    safeValues: {
      startProgress: safeStartProgress,
      counterTime: safeCounterTime,
      criticalChance: safeCriticalChance,
      quickStudyLevel: safeQuickStudyLevel,
    },
    selectedLevels,
    resetConfig,
    isDefaultConfig,
    maxCountersAtStart,
    materialMultiplier,
    countersPerTimedAction,
    defaultMaterials,
  };
}
