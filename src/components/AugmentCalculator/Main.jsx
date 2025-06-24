import { Box, Heading, Collapse, Button } from "@chakra-ui/react";
import { useState, useMemo, useEffect } from "react";
import { augmentRequirements } from "../../data/augmentRequirements";
import useMarketPrices from "../../hooks/useMarketPrices";
import LevelSelector from "./LevelSelector";
import CounterInput from "./CounterInput";
import MaterialConfig from "./MaterialConfig";
import LevelTable from "./LevelTable";
import Summary from "./Summary";

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

  const prices = useMarketPrices();

  const selectedLevels = useMemo(
    () => augmentRequirements.slice(startLevel, targetLevel),
    [startLevel, targetLevel]
  );

  const defaultMaterials = useMemo(() => {
    const base = item.augmenting || {};
    const perCounter = {};
    const totalCounters = augmentRequirements
      .slice(startLevel, targetLevel)
      .reduce((sum, lvl, idx) => {
        const counters =
          idx === 0 ? Math.max(lvl.counter - startProgress, 0) : lvl.counter;
        return sum + counters;
      }, 0);

    if (Object.keys(base).length > 0 && totalCounters > 0) {
      for (const [mat, totalQty] of Object.entries(base)) {
        perCounter[mat] = totalQty / totalCounters;
      }
      return perCounter;
    }

    return { "Example Material": 0 };
  }, [item, startLevel, targetLevel, startProgress]);

  useEffect(() => {
    setMaterials((prev) => {
      if (prev.length > 0) return prev;
      const entries = Object.entries(defaultMaterials);
      return entries.map(([name, qty]) => ({
        id: crypto.randomUUID(),
        name,
        qty,
      }));
    });
  }, [defaultMaterials]);

  const quickStudyEfficiency = Math.min(quickStudyLevel * 0.04, 0.8);

  const { maxMaterials, totalMaterials, totalCopies, totalCounters } = useMemo(
    () => {
      const baseTotals = selectedLevels.reduce(
        (acc, lvl, idx) => {
          const countersNeeded =
            idx === 0 ? Math.max(lvl.counter - startProgress, 0) : lvl.counter;
          acc.totalCounters += countersNeeded;
          acc.totalCopies += lvl.copies || 0;

          materials.forEach(({ name, qty }) => {
            const amount = countersNeeded * qty;
            acc.maxMaterials[name] = (acc.maxMaterials[name] || 0) + amount;
          });

          return acc;
        },
        { maxMaterials: {}, totalMaterials: {}, totalCopies: 0, totalCounters: 0 }
      );

      const effectiveRatio =
        (1 - criticalChance / 100) * (1 - quickStudyEfficiency);

      Object.entries(baseTotals.maxMaterials).forEach(([name, qty]) => {
        baseTotals.totalMaterials[name] = qty * effectiveRatio;
      });

      return baseTotals;
    }, [
      selectedLevels,
      startProgress,
      materials,
      criticalChance,
      quickStudyLevel,
    ]
  );

  const effectiveCounters =
    totalCounters * (1 - criticalChance / 100) * (1 - quickStudyEfficiency);
  const totalTimeSeconds = Math.round(effectiveCounters * counterTime);

  const updateMaterialQty = (id, value) => {
    setMaterials((prev) =>
      prev.map((mat) =>
        mat.id === id ? { ...mat, qty: isNaN(value) ? 0 : value } : mat
      )
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
          value={startProgress}
          max={augmentRequirements[startLevel]?.counter || 0}
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
            levels={selectedLevels}
            startLevel={startLevel}
            materials={materials}
            startProgress={startProgress}
          />
        </Box>
      </Collapse>

      <Summary
        totalMaterials={totalMaterials}
        maxMaterials={maxMaterials}
        totalCopies={totalCopies}
        totalTimeSeconds={totalTimeSeconds}
        prices={prices}
      />
    </Box>
  );
}
