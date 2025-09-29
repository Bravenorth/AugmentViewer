import { useEffect, useMemo, useRef, useState } from "react";
import { augmentRequirements } from "../../../../data/augmentRequirements";
import getItemKey from "../../utils/getItemKey";

const CONFIG_STORAGE_KEY = "augment-configuration-store-v1";

const DEFAULT_CONFIG = Object.freeze({
  startLevel: 0,
  startProgress: 0,
  targetLevel: 7,
  counterTime: 3,
  criticalChance: 10,
  quickStudyLevel: 0,
});

const GLOBAL_PREFERENCES_KEY = "__globals";
const DEFAULT_GLOBAL_PREFERENCES = Object.freeze({
  criticalChance: DEFAULT_CONFIG.criticalChance,
  quickStudyLevel: DEFAULT_CONFIG.quickStudyLevel,
});

const clamp = (value, min, max) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return typeof min === "number" ? min : 0;
  }
  const lowerBound = typeof min === "number" ? min : numeric;
  const upperBound = typeof max === "number" ? max : numeric;
  return Math.min(Math.max(numeric, lowerBound), upperBound);
};

const buildRequirementTable = (item) => {
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

const formatMaterialName = (rawName = "") => {
  if (typeof rawName !== "string") {
    return "";
  }
  const normalized = rawName.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!normalized) {
    return "";
  }
  return normalized
    .toLowerCase()
    .split(" ")
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : ""))
    .join(" ");
};

const sanitizeGlobalPreferences = (prefs = {}) => {
  const merged = { ...DEFAULT_GLOBAL_PREFERENCES, ...prefs };
  return {
    criticalChance: clamp(merged.criticalChance, 0, 100),
    quickStudyLevel: clamp(merged.quickStudyLevel, 0, 20),
  };
};

const resolveLegacyConfig = (entry) => {
  if (!entry || typeof entry !== "object") return null;
  if (Array.isArray(entry)) return null;

  if (
    "startLevel" in entry ||
    "targetLevel" in entry ||
    "counterTime" in entry
  ) {
    return entry;
  }

  if (Array.isArray(entry.presets)) {
    const { presets, lastSelectedId } = entry;
    const preferred =
      presets.find((preset) => preset.id === lastSelectedId) ?? presets[0];
    if (preferred && typeof preferred === "object") {
      return preferred.config ?? null;
    }
  }

  return null;
};

const readConfigStore = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to read configuration store", error);
    return {};
  }
};

const writeConfigStore = (store) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to persist configuration store", error);
  }
};

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
        criticalChance: isSimpleItem ? 0 : clamp(merged.criticalChance, 0, 100),
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
    defaultSanitizedConfig.criticalChance
  );
  const [quickStudyLevel, setQuickStudyLevel] = useState(
    defaultSanitizedConfig.quickStudyLevel
  );

  const configHydratedRef = useRef(false);
  const lastSavedConfigRef = useRef(defaultSanitizedConfig);

  const hasAugmentOverride = Boolean(
    item?.augmentOverride &&
      typeof item.augmentOverride.fixedSuccessCount === "number"
  );
  const normalizedTotalCounters =
    totalCountersAllLevels > 0 ? totalCountersAllLevels : 1;

  const defaultMaterials = useMemo(() => {
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
        : numericTotal / normalizedTotalCounters;
      const previousAmount =
        typeof acc[displayName] === "number" ? acc[displayName] : 0;

      acc[displayName] = previousAmount + baseAmount;
      return acc;
    }, {});
  }, [hasAugmentOverride, item, normalizedTotalCounters]);

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
    const globalPrefs = sanitizeGlobalPreferences(
      store[GLOBAL_PREFERENCES_KEY]
    );
    const rawEntry = store[key];
    const resolved = resolveLegacyConfig(rawEntry);
    const mergedConfig = {
      ...DEFAULT_CONFIG,
      ...globalPrefs,
      ...(resolved ?? {}),
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
    store[GLOBAL_PREFERENCES_KEY] = sanitizeGlobalPreferences({
      criticalChance: sanitized.criticalChance,
      quickStudyLevel: sanitized.quickStudyLevel,
    });

    if (areConfigsEqual(sanitized, DEFAULT_CONFIG)) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        delete store[key];
      }
    } else {
      store[key] = sanitized;
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
