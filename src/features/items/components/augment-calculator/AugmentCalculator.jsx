import { Box, Button, Collapse, HStack, SimpleGrid, Stack, Tabs, Tab, TabList, TabPanels, TabPanel, useDisclosure } from "@chakra-ui/react";
import { useMemo } from "react";
import LevelSelector from "./LevelSelector";
import CounterInput from "./CounterInput";
import MaterialConfig from "./MaterialConfig";
import LevelTable from "./LevelTable";
import Summary from "./Summary";
import useAugmentConfig from "./useAugmentConfig";
import useMaterials from "./useMaterials";

export default function AugmentCalculator({ item }) {
  const {
    isSimpleItem,
    maxLevelIndex,
    targetLevelMaxOption,
    startLevel,
    setStartLevel,
    setProgress,
    setTargetLevel,
    setCounterTime,
    setCriticalChance,
    setQuickStudyLevel,
    targetLevel,
    counterTime,
    criticalChance,
    quickStudyLevel,
    safeValues,
    selectedLevels,
    resetConfig,
    isDefaultConfig,
    maxCountersAtStart,
    materialMultiplier,
    countersPerTimedAction,
    defaultMaterials,
  } = useAugmentConfig(item);
  const {
    materials,
    newMaterialName,
    setNewMaterialName,
    updateMaterialQty,
    renameMaterial,
    removeMaterial,
    addMaterial,
    resetMaterialsToDefault,
    materialColumns,
  } = useMaterials(item, defaultMaterials);
  const { isOpen: showLevelTable, onToggle: toggleLevelTable } = useDisclosure({ defaultIsOpen: false });
  const { startProgress: safeStartProgress, counterTime: safeCounterTime } = safeValues;

  const levelData = useMemo(() => {
    const breakdown = [];
    const materialSet = new Set(materialColumns);
    const totals = {
      totalCounters: 0,
      totalCopies: 0,
      maxMaterials: materialColumns.reduce((acc, name) => ((acc[name] = 0), acc), {}),
    };

    selectedLevels.forEach((lvl, idx) => {
      const countersNeeded = idx === 0 ? Math.max((lvl.counter || 0) - safeStartProgress, 0) : lvl.counter || 0;
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
  }, [materialColumns, materials, safeStartProgress, selectedLevels, startLevel]);

  const { breakdown: levelBreakdown, totals: levelTotals } = levelData;
  const maxMaterials = levelTotals.maxMaterials;
  const totalMaterials = useMemo(() => Object.fromEntries(Object.entries(maxMaterials).map(([name, amount]) => [name, amount * materialMultiplier])), [materialMultiplier, maxMaterials]);
  const timedCounters = levelTotals.totalCounters * materialMultiplier;
  const effectiveActions = countersPerTimedAction > 0 ? timedCounters / countersPerTimedAction : timedCounters;
  const totalTimeSeconds = isSimpleItem ? 0 : Math.round(effectiveActions * safeCounterTime);

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
                <Button size="sm" variant="outline" onClick={resetConfig} isDisabled={isDefaultConfig}>Reset to defaults</Button>
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <LevelSelector label="Start level" value={startLevel} onChange={setStartLevel} maxValue={maxLevelIndex} />
                <LevelSelector label="Target level" value={targetLevel} onChange={setTargetLevel} maxValue={targetLevelMaxOption} />
                {!isSimpleItem && (
                  <CounterInput label="Start counters done" value={safeStartProgress} max={maxCountersAtStart} onChange={setProgress} helperText={`Max ${maxCountersAtStart} counters at +${startLevel}`} />
                )}
                {!isSimpleItem && (
                  <CounterInput label="Time per counter (s)" value={counterTime} min={0.1} onChange={setCounterTime} helperText="Average time to complete one counter" />
                )}
                {!isSimpleItem && (
                  <CounterInput label="Critical augment chance (%)" value={criticalChance} min={0} max={100} onChange={setCriticalChance} tooltip="Chance for an addtionnel augment counter." helperText="0 - 100%" />
                )}
                {!isSimpleItem && (
                  <CounterInput label="Quick Study level" value={quickStudyLevel} min={0} max={20} onChange={setQuickStudyLevel} tooltip="Each level grants a 4% chance per enchanting actions to complete another enchanting action (caps at 80% and 5 chained procs)." helperText="0 - 20" />
                )}
              </SimpleGrid>
            </Stack>
          </TabPanel>
          <TabPanel px={0}>
            <Stack spacing={4}>
              <MaterialConfig materials={materials} onChange={updateMaterialQty} onRename={renameMaterial} onRemove={removeMaterial} newMaterialName={newMaterialName} setNewMaterialName={setNewMaterialName} onAdd={addMaterial} />
              <HStack spacing={2}>
                <Button size="sm" variant="outline" onClick={resetMaterialsToDefault}>Reset materials</Button>
                <Button size="sm" variant="ghost" onClick={toggleLevelTable} alignSelf="flex-start">{showLevelTable ? "Hide level breakdown" : "Show level breakdown"}</Button>
              </HStack>
              <Collapse in={showLevelTable} animateOpacity>
                <Box overflowX="auto" border="1px solid" borderColor="gray.700" borderRadius="md" p={3}>
                  <LevelTable breakdown={levelBreakdown} materialColumns={materialColumns} />
                </Box>
              </Collapse>
            </Stack>
          </TabPanel>
          <TabPanel px={0}>
            <Summary totalMaterials={totalMaterials} maxMaterials={maxMaterials} totalCopies={levelTotals.totalCopies} totalTimeSeconds={totalTimeSeconds} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Stack>
  );
}
