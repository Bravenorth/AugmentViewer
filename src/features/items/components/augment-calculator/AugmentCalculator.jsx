import { Box, Heading, Collapse, Button } from "@chakra-ui/react";
import { useState, useMemo, useEffect, useRef } from "react";
import { augmentRequirements } from "../../../../data/augmentRequirements";
import LevelSelector from "./LevelSelector";
import CounterInput from "./CounterInput";
import MaterialConfig from "./MaterialConfig";
import LevelTable from "./LevelTable";
import Summary from "./Summary";

const TOTAL_COUNTERS_ALL_LEVELS = augmentRequirements.reduce((sum, lvl) => sum + lvl.counter, 0);

export default function AugmentCalculator({ item }) {
  const [startLevel, setStartLevel] = useState(0);
  const [startProgress, setProgress] = useState(0);
  const [targetLevel, setTargetLevel] = useState(7);
  const [counterTime, setCounterTime] = useState(3);
  const [criticalChance, setCriticalChance] = useState(10);
  const [quickStudyLevel, setQuickStudyLevel] = useState(0);
  const [showTable, toggleTable] = useState(false);
  const [newMatName, setNewMatName] = useState("");
  const [materials, setMaterials] = useState([]);


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

  const itemKeyRef = useRef(null);

  useEffect(() => {
    const key = item?.id ?? item?.name ?? "unknown-item";
    const entries = Object.entries(defaultMaterials);
    if (entries.length === 0) return;

    setMaterials((prev) => {
      const isSameItem = itemKeyRef.current === key;
      if (isSameItem && prev.length > 0) {
        return prev;
      }

      itemKeyRef.current = key;

      return entries.map(([name, qty]) => ({
        id: crypto.randomUUID(),
        name,
        qty,
      }));
    });
  }, [defaultMaterials, item]);

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
    if (!name || materials.some((m) => m.name === name)) return;
    setMaterials((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, qty: 0 },
    ]);
    setNewMatName("");
  };

  return (
    <Box
      w="100%"
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="md"
      p={6}
    >
      <Box mb={4} display="flex" gap={4} flexWrap="wrap">
        <LevelSelector
          label="Start level"
          value={startLevel}
          onChange={setStartLevel}
        />
        <CounterInput
          label="Start counters done"
          value={safeStartProgress}
          max={selectedLevels[0]?.counter || 0}
          onChange={setProgress}
        />
        <LevelSelector
          label="Target level"
          value={targetLevel}
          onChange={setTargetLevel}
        />
        <CounterInput
          label="Time per counter (s)"
          value={counterTime}
          onChange={setCounterTime}
        />
        <CounterInput
          label="Critical augment chance (%)"
          value={criticalChance}
          max={100}
          onChange={setCriticalChance}
        />
        <CounterInput
          label="Quick Study level (0-20)"
          value={quickStudyLevel}
          max={20}
          onChange={setQuickStudyLevel}
        />
      </Box>

      <MaterialConfig
        materials={materials}
        onChange={updateMaterialQty}
        onRename={renameMaterial}
        onRemove={removeMaterial}
        newMaterialName={newMatName}
        setNewMaterialName={setNewMatName}
        onAdd={addMaterial}
      />

      <Button
        size="sm"
        bg="gray.700"
        _hover={{ bg: "gray.600" }}
        onClick={() => toggleTable((v) => !v)}
        mb={2}
      >
        {showTable ? "Hide Level Table" : "Show Level Table"}
      </Button>

      <Collapse in={showTable} animateOpacity>
        <Box overflowX="auto" mt={2}>
          <LevelTable
            breakdown={levelBreakdown}
            materialColumns={materialColumns}
          />
        </Box>
      </Collapse>

      <Summary
        totalMaterials={totalMaterials}
        maxMaterials={maxMaterials}
        totalCopies={levelTotals.totalCopies}
        totalTimeSeconds={totalTimeSeconds}
      />
    </Box>
  );
}

