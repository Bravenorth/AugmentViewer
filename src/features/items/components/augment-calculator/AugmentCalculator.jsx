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

const TOTAL_COUNTERS_ALL_LEVELS = augmentRequirements.reduce((sum, lvl) => sum + lvl.counter, 0);
const MAX_LEVEL_INDEX = augmentRequirements.length - 1;
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

const sanitizeConfig = (config = {}) => {
  const merged = { ...DEFAULT_CONFIG, ...config };
  const startLevel = clamp(Math.round(merged.startLevel), 0, MAX_LEVEL_INDEX);
  const targetLevel = clamp(Math.round(merged.targetLevel), 0, MAX_LEVEL_INDEX);
  const normalizedTarget = Math.max(targetLevel, startLevel);
  const maxCounters = augmentRequirements[startLevel]?.counter;

  return {
    startLevel,
    startProgress: clamp(merged.startProgress, 0, maxCounters),
    targetLevel: normalizedTarget,
    counterTime: clamp(merged.counterTime, 0, undefined),
    criticalChance: clamp(merged.criticalChance, 0, 100),
    quickStudyLevel: clamp(merged.quickStudyLevel, 0, 20),
  };
};

const areConfigsEqual = (left, right) => {
  const a = sanitizeConfig(left);
  const b = sanitizeConfig(right);
  return Object.keys(DEFAULT_CONFIG).every((key) => a[key] === b[key]);
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

const DEFAULT_SANITIZED_CONFIG = sanitizeConfig(DEFAULT_CONFIG);

export default function AugmentCalculator({ item }) {
  const [startLevel, setStartLevel] = useState(DEFAULT_CONFIG.startLevel);
  const [startProgress, setProgress] = useState(DEFAULT_CONFIG.startProgress);
  const [targetLevel, setTargetLevel] = useState(DEFAULT_CONFIG.targetLevel);
  const [counterTime, setCounterTime] = useState(DEFAULT_CONFIG.counterTime);
  const [criticalChance, setCriticalChance] = useState(DEFAULT_CONFIG.criticalChance);
  const [quickStudyLevel, setQuickStudyLevel] = useState(DEFAULT_CONFIG.quickStudyLevel);
  const [newMatName, setNewMatName] = useState("");
  const [materials, setMaterials] = useState([]);
  const { isOpen: showLevelTable, onToggle: toggleLevelTable } = useDisclosure({ defaultIsOpen: false });
  const itemKeyRef = useRef(null);
  const configHydratedRef = useRef(false);
  const lastSavedConfigRef = useRef(DEFAULT_SANITIZED_CONFIG);

  const defaultMaterials = useMemo(() => {
    const craftData = item?.craft || {};
    const hasScrapping = craftData.scrapping && Object.keys(craftData.scrapping).length > 0;
    const source = hasScrapping ? craftData.scrapping : craftData.augmenting || {};
    const isPerCounter = hasScrapping;

    if (Object.keys(source).length === 0) {
      return { "Example Material": 0 };
    }

    return Object.entries(source).reduce((acc, [name, totalQty]) => {
      const numericTotal = Number(totalQty);
      if (!Number.isFinite(numericTotal)) {
        acc[name] = 0;
        return acc;
      }

      acc[name] = isPerCounter ? Math.max(numericTotal, 0) : numericTotal / TOTAL_COUNTERS_ALL_LEVELS;
      return acc;
    }, {});
  }, [item]);

  const applyConfig = (config) => {
    const sanitized = sanitizeConfig(config);
    const maxCounters = augmentRequirements[sanitized.startLevel]?.counter ?? sanitized.startProgress;
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
    const sanitizedConfig = resolved ? sanitizeConfig(resolved) : DEFAULT_SANITIZED_CONFIG;

    applyConfig(sanitizedConfig);
    lastSavedConfigRef.current = sanitizedConfig;
    configHydratedRef.current = true;
  }, [item]);

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
  }, [startLevel, startProgress, targetLevel, counterTime, criticalChance, quickStudyLevel, item]);

  useEffect(() => {
    setProgress((prev) => {
      const maxCounters = augmentRequirements[startLevel]?.counter;
      return clamp(prev, 0, maxCounters);
    });
  }, [startLevel]);

  const selectedLevels = useMemo(() => {
    if (targetLevel <= startLevel) {
      return [];
    }
    return augmentRequirements.slice(startLevel, targetLevel);
  }, [startLevel, targetLevel]);

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

  const safeStartProgress = Math.max(Number(startProgress) || 0, 0);
  const safeCounterTime = Math.max(Number(counterTime) || 0, 0);
  const safeCriticalChance = Math.max(0, Math.min(Number(criticalChance) || 0, 100));
  const safeQuickStudyLevel = Math.max(0, Math.min(Number(quickStudyLevel) || 0, 20));
  const quickStudyEfficiency = Math.min(safeQuickStudyLevel * 0.04, 0.8);
  const critRate = safeCriticalChance / 100;
  const materialMultiplier = Math.min(Math.max(1 - critRate, 0), 1);
  const countersPerTimedAction = 1 + quickStudyEfficiency;

  const currentConfig = useMemo(
    () => ({
      startLevel,
      startProgress: safeStartProgress,
      targetLevel,
      counterTime: safeCounterTime,
      criticalChance: safeCriticalChance,
      quickStudyLevel: safeQuickStudyLevel,
    }),
    [startLevel, safeStartProgress, targetLevel, safeCounterTime, safeCriticalChance, safeQuickStudyLevel]
  );

  const isDefaultConfig = useMemo(
    () => areConfigsEqual(currentConfig, DEFAULT_CONFIG),
    [currentConfig]
  );

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
      const countersNeeded = idx === 0 ? Math.max(lvl.counter - safeStartProgress, 0) : lvl.counter;
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
        level: startLevel + idx + 1,
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
  const totalTimeSeconds = Math.round(effectiveActions * safeCounterTime);

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
      prev.map((mat) =>
        mat.id === id ? { ...mat, name: newName.trim() } : mat
      )
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
                <LevelSelector label="Start level" value={startLevel} onChange={setStartLevel} />
                <LevelSelector label="Target level" value={targetLevel} onChange={setTargetLevel} />
                <CounterInput
                  label="Start counters done"
                  value={safeStartProgress}
                  max={augmentRequirements[startLevel]?.counter || 0}
                  onChange={setProgress}
                  helperText={`Max ${(augmentRequirements[startLevel]?.counter ?? 0)} counters at +${startLevel}`}
                />
                <CounterInput
                  label="Time per counter (s)"
                  value={counterTime}
                  min={0.1}
                  onChange={setCounterTime}
                  helperText="Average time to complete one counter"
                />
                <CounterInput
                  label="Critical augment chance (%)"
                  value={criticalChance}
                  min={0}
                  max={100}
                  onChange={setCriticalChance}
                  tooltip="Chance a counter completes without consuming materials."
                  helperText="0 - 100%"
                />
                <CounterInput
                  label="Quick Study level"
                  value={quickStudyLevel}
                  min={0}
                  max={20}
                  onChange={setQuickStudyLevel}
                  tooltip="Each Quick Study level adds a 4% chance to skip a counter (up to 80%)."
                  helperText="0 - 20"
                />
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

