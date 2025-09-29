import { Box, Button, Collapse, HStack, Stack, useDisclosure } from "@chakra-ui/react";
import LevelTable from "./LevelTable";
import MaterialConfig from "./MaterialConfig";

export default function MaterialsTab({
  materials,
  materialColumns,
  levelBreakdown,
  newMaterialName,
  setNewMaterialName,
  updateMaterialQty,
  renameMaterial,
  removeMaterial,
  addMaterial,
  resetMaterialsToDefault,
}) {
  const { isOpen: showLevelTable, onToggle: toggleLevelTable } = useDisclosure({
    defaultIsOpen: false,
  });

  return (
    <Stack spacing={4}>
      <MaterialConfig
        materials={materials}
        onChange={updateMaterialQty}
        onRename={renameMaterial}
        onRemove={removeMaterial}
        newMaterialName={newMaterialName}
        setNewMaterialName={setNewMaterialName}
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
        <Box
          overflowX="auto"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="md"
          p={3}
        >
          <LevelTable
            breakdown={levelBreakdown}
            materialColumns={materialColumns}
          />
        </Box>
      </Collapse>
    </Stack>
  );
}
