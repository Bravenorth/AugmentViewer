import { Box, Button, HStack, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import CounterInput from "./CounterInput";
import LevelSelector from "./LevelSelector";

export default function ConfigurationTab({
  // item-specific
  isSimpleItem,
  maxLevelIndex,
  targetLevelMaxOption,
  startLevel,
  setStartLevel,
  targetLevel,
  setTargetLevel,
  safeStartProgress,
  setProgress,
  maxCountersAtStart,
  counterTime,
  setCounterTime,
  resetConfig,
  isDefaultConfig,

  // globals
  criticalChance,
  setCriticalChance,
  quickStudyLevel,
  setQuickStudyLevel,
  resetGlobals, // ⬅️ nouveau si tu veux un bouton reset séparé
}) {
  return (
    <Stack spacing={6}>
      {/* Actions */}
      <HStack justifyContent="flex-end">
        <Button
          size="sm"
          variant="outline"
          onClick={resetConfig}
          isDisabled={isDefaultConfig}
        >
          Reset item config
        </Button>
        {resetGlobals && (
          <Button
            size="sm"
            variant="outline"
            onClick={resetGlobals}
            colorScheme="red"
          >
            Reset globals
          </Button>
        )}
      </HStack>

      {/* Per-item config */}
      <Box>
        <Text fontSize="sm" color="gray.400" mb={2}>
          Item configuration
        </Text>
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
        </SimpleGrid>
      </Box>

      {/* Global preferences */}
      {!isSimpleItem && (
        <Box>
          <Text fontSize="sm" color="gray.400" mb={2}>
            Global preferences
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <CounterInput
              label="Critical augment chance (%)"
              value={criticalChance}
              min={0}
              max={100}
              onChange={setCriticalChance}
              tooltip="Chance for an additional augment counter."
              helperText="0 - 100%"
            />
            <CounterInput
              label="Quick Study level"
              value={quickStudyLevel}
              min={0}
              max={20}
              onChange={setQuickStudyLevel}
              tooltip="Each level grants a 4% chance per enchanting action (caps at 80% and 5 chained procs)."
              helperText="0 - 20"
            />
          </SimpleGrid>
        </Box>
      )}
    </Stack>
  );
}
