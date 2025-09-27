import {
  Box,
  Button,
  Collapse,
  HStack,
  SimpleGrid,
  Stack,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  useDisclosure,
} from "@chakra-ui/react";
import { useState, useMemo, useEffect, useRef } from "react";
import { augmentRequirements } from "../../../../data/augmentRequirements";
import LevelSelector from "./LevelSelector";
import CounterInput from "./CounterInput";
import MaterialConfig from "./MaterialConfig";
import LevelTable from "./LevelTable";
import Summary from "./Summary";
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
  const hasFixedSuccess = override && typeof override.fixedSuccessCount === "number";
  const maxAugLevel = Number(item?.maxAugLevel);
  const cappedLevels = Number.isFinite(maxAugLevel)
    ? Math.max(Math.min(maxAugLevel, augmentRequirements.length), 0)
    : augmentRequirements.length;
  const levelCount = cappedLevels > 0 ? cappedLevels : augmentRequirements.length;

  const baseTable = augmentRequirements.slice(0, levelCount).map(({ level, counter, copies }) => ({
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

const mapMaterials = (entries) =>
  entries.map(([name, qty]) => ({
    id: crypto.randomUUID(),
    name,
    qty,
  }));

const resolveLegacyConfig = (entry) => {
  if (!entry || typeof entry !== "object") return null;
  if (Array.isArray(entry)) return null;

  if ("startLevel" in entry || "targetLevel" in entry || "counterTime" in entry) {
    return entry;
  }

  if (Array.isArray(entry.presets)) {
    const { presets, lastSelectedId } = entry;
    const preferred = presets.find((preset) => preset.id === lastSelectedId) ?? presets[0];
    if (preferred && typeof preferred === "object") {
      return preferred.config ?? null;
    }
  }

  return null;
};

export default function AugmentCalculator({ item }) {
  const itemClass = (item?.class || "").toLowerCase();
  const isKeyItem = itemClass === "key";
  const isScrollItem = itemClass.includes("scroll");
  const isSimpleItem = isKeyItem || isScrollItem;

  const requirementTable = useMemo(() => buildRequirementTable(item), [item]);
  const maxLevelIndex = Math.max(requirementTable.length - 1, 0);
  const targetLevelMaxOption = Math.max(requirementTable.length, 0);

  const totalCountersAllLevels = useMemo(
    () => requirementTable.reduce((sum, lvl) => sum + Math.max(lvl.counter || 0, 0), 0),
    [requirementTable]
  );

  const sanitizeConfig = useMemo(() => {
    return (config = {}) => {
      const merged = { ...DEFAULT_CONFIG, ...config };
      const safeMaxLevelIndex = Math.max(maxLevelIndex, 0);
      const safeTargetMax = Math.max(targetLevelMaxOption, 0);

      const startLevelValue = clamp(Math.round(merged.startLevel), 0, safeMaxLevelIndex);
      const targetLevelValue = clamp(Math.round(merged.targetLevel), 0, safeTargetMax);
      const normalizedTarget = Math.max(targetLevelValue, startLevelValue);
      const maxCountersForStart = requirementTable[startLevelValue]?.counter ?? 0;

      return {
        startLevel: startLevelValue,
        startProgress: isSimpleItem ? 0 : clamp(merged.startProgress, 0, maxCountersForStart),
        targetLevel: normalizedTarget,
        counterTime: isSimpleItem ? 0 : clamp(merged.counterTime, 0, undefined),
        criticalChance: isSimpleItem ? 0 : clamp(merged.criticalChance, 0, 100),
        quickStudyLevel: isSimpleItem ? 0 : clamp(merged.quickStudyLevel, 0, 20),
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

  const defaultSanitizedConfig = useMemo(() => sanitizeConfig(DEFAULT_CONFIG), [sanitizeConfig]);

  const [startLevel, setStartLevel] = useState(defaultSanitizedConfig.startLevel);
  const [startProgress, setProgress] = useState(defaultSanitizedConfig.startProgress);
  const [targetLevel, setTargetLevel] = useState(defaultSanitizedConfig.targetLevel);
  const [counterTime, setCounterTime] = useState(defaultSanitizedConfig.counterTime);
  const [criticalChance, setCriticalChance] = useState(defaultSanitizedConfig.criticalChance);
  const [quickStudyLevel, setQuickStudyLevel] = useState(defaultSanitizedConfig.quickStudyLevel);
  const [newMatName, setNewMatName] = useState("");
  const [materials, setMaterials] = useState([]);
  const { isOpen: showLevelTable, onToggle: toggleLevelTable } = useDisclosure({ defaultIsOpen: false });
  const itemKeyRef = useRef(null);
  const configHydratedRef = useRef(false);
  const lastSavedConfigRef = useRef(defaultSanitizedConfig);

  const hasAugmentOverride = Boolean(item?.augmentOverride && typeof item.augmentOverride.fixedSuccessCount === "number");
  const normalizedTotalCounters = totalCountersAllLevels > 0 ? totalCountersAllLevels : 1;

  const defaultMaterials = useMemo(() => {
    const craftData = item?.craft || {};
    const hasScrapping = craftData.scrapping && Object.keys(craftData.scrapping).length > 0;
    const hasAugmenting = craftData.augmenting && Object.keys(craftData.augmenting).length > 0;
    const treatAugmentingAsPerCounter = hasScrapping || (hasAugmenting && hasAugmentOverride);
    const source = hasScrapping ? craftData.scrapping : craftData.augmenting || {};

    if (Object.keys(source).length === 0) {
      return { "Example Material": 0 };
    }

    return Object.entries(source).reduce((acc, [name, totalQty]) => {
      const numericTotal = Number(totalQty);
      if (!Number.isFinite(numericTotal)) {
        acc[name] = 0;
        return acc;
      }

      acc[name] = treatAugmentingAsPerCounter ? Math.max(numericTotal, 0) : numericTotal / normalizedTotalCounters;
      return acc;
    }, {});
  }, [hasAugmentOverride, item, normalizedTotalCounters]);

  const applyConfig = (config) => {
    const sanitized = sanitizeConfig(config);
    const maxCounters = requirementTable[sanitized.startLevel]?.counter ?? sanitized.startProgress;
    setStartLevel(sanitized.startLevel);
    setTargetLevel(sanitized.targetLevel);
    setProgress(clamp(sanitized.startProgress, 0, maxCounters));
    setCounterTime(sanitized.counterTime);
    setCriticalChance(sanitized.criticalChance);
    setQuickStudyLevel(sanitized.quickStudyLevel);
  };

  useEffect(() => {
    const key = getItemKey(item) ?? "unknown-item";
    const entries = Object.entries(defaultMaterials);
    if (entries.length === 0) return;

    setMaterials((prev) => {
      const isSameItem = itemKeyRef.current === key;
      if (isSameItem && prev.length > 0) {
        return prev;
      }

      itemKeyRef.current = key;
      return mapMaterials(entries);
    });
  }, [defaultMaterials, item]);

  useEffect(() => {
    configHydratedRef.current = false;
    const key = getItemKey(item) ?? "unknown-item";
    const store = readConfigStore();
    const rawEntry = store[key];
    const resolved = resolveLegacyConfig(rawEntry);
    const sanitizedConfig = resolved ? sanitizeConfig(resolved) : defaultSanitizedConfig;

    applyConfig(sanitizedConfig);
    lastSavedConfigRef.current = sanitizedConfig;
    configHydratedRef.current = true;
  }, [defaultSanitizedConfig, item, sanitizeConfig]);

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

    if (areConfigsEqual(sanitized, DEFAULT_CONFIG)) {
      if (Object.prototype.hasOwnProperty.call(store, key)) {
        delete store[key];
        writeConfigStore(store);
      }
    } else {
      store[key] = sanitized;
      writeConfigStore(store);
    }

    lastSavedConfigRef.current = sanitized;
  }, [areConfigsEqual, counterTime, criticalChance, item, quickStudyLevel, sanitizeConfig, startLevel, startProgress, targetLevel]);

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

  const materialColumns = useMemo(() => {
    const seen = new Set();
    return materials
      .map((mat) => mat.name?.trim())
      .filter((name) => {
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      });
  }, [materials]);

  const safeStartProgress = isSimpleItem ? 0 : Math.max(Number(startProgress) || 0, 0);
  const safeCounterTime = isSimpleItem ? 0 : Math.max(Number(counterTime) || 0, 0);
  const safeCriticalChance = isSimpleItem ? 0 : Math.max(0, Math.min(Number(criticalChance) || 0, 100));
  const safeQuickStudyLevel = isSimpleItem ? 0 : Math.max(0, Math.min(Number(quickStudyLevel) || 0, 20));
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
    [safeCounterTime, safeCriticalChance, safeQuickStudyLevel, safeStartProgress, startLevel, targetLevel]
  );

  const isDefaultConfig = useMemo(() => areConfigsEqual(currentConfig, DEFAULT_CONFIG), [areConfigsEqual, currentConfig]);

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
      const countersNeeded = idx === 0 ? Math.max((lvl.counter || 0) - safeStartProgress, 0) : (lvl.counter || 0);
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

        if (amount) {
          materialsForLevel[trimmedName] = amount;
        }
      });

      breakdown.push({
        level: lvl.level ?? startLevel + idx + 1,
        countersRequired: countersNeeded,
        copiesRequired,
        materials: materialsForLevel,
      });
    });

    return { breakdown, totals };
  }, [materialColumns, materials, safeStartProgress, selectedLevels, startLevel]);

  const { breakdown: levelBreakdown, totals: levelTotals } = levelData;

  const maxMaterials = levelTotals.maxMaterials;
  const totalMaterials = Object.fromEntries(
    Object.entries(maxMaterials).map(([name, amount]) => [name, amount * materialMultiplier])
  );

  const timedCounters = levelTotals.totalCounters * materialMultiplier;
  const effectiveActions = countersPerTimedAction > 0 ? timedCounters / countersPerTimedAction : timedCounters;
  const totalTimeSeconds = isSimpleItem ? 0 : Math.round(effectiveActions * safeCounterTime);

  const updateMaterialQty = (id, value) => {
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id !== id) return mat;
        const numeric = Number(value);
        const safeQty = Number.isFinite(numeric) ? Math.max(numeric, 0) : 0;
        return { ...mat, qty: safeQty };
      })
    );
  };

  const renameMaterial = (id, newName) => {
    if (!newName.trim()) return;
    setMaterials((prev) =>
      prev.map((mat) => (mat.id === id ? { ...mat, name: newName.trim() } : mat))
    );
  };

  const removeMaterial = (id) => {
    setMaterials((prev) => prev.filter((mat) => mat.id !== id));
  };

  const addMaterial = () => {
    const name = newMatName.trim();
    if (!name || materials.some((m) => m.name.toLowerCase() === name.toLowerCase())) return;
    setMaterials((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, qty: 0 },
    ]);
    setNewMatName("");
  };

  const handleResetConfig = () => {
    applyConfig(DEFAULT_CONFIG);
  };

  const resetMaterialsToDefault = () => {
    const entries = Object.entries(defaultMaterials);
    if (entries.length === 0) return;
    setMaterials(mapMaterials(entries));
  };

  const maxCountersAtStart = requirementTable[startLevel]?.counter ?? 0;

  return (
    <Stack spacing={6}>
      <Tabs variant="enclosed" colorScheme="brand" isLazy>
        <TabList>
          <Tab>Configuration</Tab>
          <Tab>Materials</Tab>
          <Tab>Summary</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <Stack spacing={4}>
              <HStack justifyContent="flex-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleResetConfig}
                  isDisabled={isDefaultConfig}
                >
                  Reset to defaults
                </Button>
              </HStack>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <LevelSelector
                  label="Start level"
                  value={startLevel}
                  onChange={setStartLevel}
                  maxValue={maxLevelIndex}
                />
                <LevelSelector
                  label="Target level"
                  value={targetLevel}
                  onChange={setTargetLevel}
                  maxValue={targetLevelMaxOption}
                />
                {!isSimpleItem && (
                  <CounterInput
                    label="Start counters done"
                    value={safeStartProgress}
                    max={maxCountersAtStart}
                    onChange={setProgress}
                    helperText={`Max ${maxCountersAtStart} counters at +${startLevel}`}
                  />
                )}
                {!isSimpleItem && (
                  <CounterInput
                    label="Time per counter (s)"
                    value={counterTime}
                    min={0.1}
                    onChange={setCounterTime}
                    helperText="Average time to complete one counter"
                  />
                )}
                {!isSimpleItem && (
                  <CounterInput
                    label="Critical augment chance (%)"
                    value={criticalChance}
                    min={0}
                    max={100}
                    onChange={setCriticalChance}
                    tooltip="Chance a counter completes without consuming materials."
                    helperText="0 - 100%"
                  />
                )}
                {!isSimpleItem && (
                  <CounterInput
                    label="Quick Study level"
                    value={quickStudyLevel}
                    min={0}
                    max={20}
                    onChange={setQuickStudyLevel}
                    tooltip="Each Quick Study level adds a 4% chance to skip a counter (up to 80%)."
                    helperText="0 - 20"
                  />
                )}
              </SimpleGrid>
            </Stack>
          </TabPanel>

          <TabPanel px={0}>
            <Stack spacing={4}>
              <MaterialConfig
                materials={materials}
                onChange={updateMaterialQty}
                onRename={renameMaterial}
                onRemove={removeMaterial}
                newMaterialName={newMatName}
                setNewMaterialName={setNewMatName}
                onAdd={addMaterial}
              />

              <HStack spacing={2}>
                <Button size="sm" variant="outline" onClick={resetMaterialsToDefault}>
                  Reset materials
                </Button>
                <Button size="sm" variant="ghost" onClick={toggleLevelTable} alignSelf="flex-start">
                  {showLevelTable ? "Hide level breakdown" : "Show level breakdown"}
                </Button>
              </HStack>

              <Collapse in={showLevelTable} animateOpacity>
                <Box overflowX="auto" border="1px solid" borderColor="gray.700" borderRadius="md" p={3}>
                  <LevelTable breakdown={levelBreakdown} materialColumns={materialColumns} />
                </Box>
              </Collapse>
            </Stack>
          </TabPanel>

          <TabPanel px={0}>
            <Summary
              totalMaterials={totalMaterials}
              maxMaterials={maxMaterials}
              totalCopies={levelTotals.totalCopies}
              totalTimeSeconds={totalTimeSeconds}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}

function readConfigStore() {
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
}

function writeConfigStore(store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to persist configuration store", error);
  }
}