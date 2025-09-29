import { Stack, Tabs, Tab, TabList, TabPanels, TabPanel } from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import ConfigurationTab from "./ConfigurationTab";
import MaterialsTab from "./MaterialsTab";
import SummaryTab from "./SummaryTab";
import useAugmentConfig from "./hooks/useAugmentConfig";
import useLevelData from "./hooks/useLevelData";
import useMaterials from "./hooks/useMaterials";
import getItemKey from "../../utils/getItemKey";

export default function AugmentCalculator({ item }) {
  const itemKey = useMemo(() => getItemKey(item) ?? "unknown-item", [item]);

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

  useEffect(() => {
    resetMaterialsToDefault();
  }, [itemKey, resetMaterialsToDefault]);

  const { startProgress: safeStartProgress, counterTime: safeCounterTime } = safeValues;

  const { levelBreakdown, levelTotals, maxMaterials, totalMaterials, totalTimeSeconds } =
    useLevelData({
      selectedLevels,
      startLevel,
      materials,
      materialColumns,
      safeStartProgress,
      materialMultiplier,
      countersPerTimedAction,
      safeCounterTime,
      isSimpleItem,
    });

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
            <ConfigurationTab
              isSimpleItem={isSimpleItem}
              maxLevelIndex={maxLevelIndex}
              targetLevelMaxOption={targetLevelMaxOption}
              startLevel={startLevel}
              setStartLevel={setStartLevel}
              targetLevel={targetLevel}
              setTargetLevel={setTargetLevel}
              safeStartProgress={safeStartProgress}
              setProgress={setProgress}
              maxCountersAtStart={maxCountersAtStart}
              counterTime={counterTime}
              setCounterTime={setCounterTime}
              criticalChance={criticalChance}
              setCriticalChance={setCriticalChance}
              quickStudyLevel={quickStudyLevel}
              setQuickStudyLevel={setQuickStudyLevel}
              resetConfig={resetConfig}
              isDefaultConfig={isDefaultConfig}
            />
          </TabPanel>
          <TabPanel px={0}>
            <MaterialsTab
              materials={materials}
              materialColumns={materialColumns}
              levelBreakdown={levelBreakdown}
              newMaterialName={newMaterialName}
              setNewMaterialName={setNewMaterialName}
              updateMaterialQty={updateMaterialQty}
              renameMaterial={renameMaterial}
              removeMaterial={removeMaterial}
              addMaterial={addMaterial}
              resetMaterialsToDefault={resetMaterialsToDefault}
            />
          </TabPanel>
          <TabPanel px={0}>
            <SummaryTab
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
