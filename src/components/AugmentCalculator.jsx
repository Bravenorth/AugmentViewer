// src/components/AugmentCalculator.jsx
import {
  Box,
  Heading,
  Text,
  Select,
  NumberInput,
  NumberInputField,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Collapse,
  Button,
  HStack,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { useState, useMemo } from "react";
import { CloseIcon } from "@chakra-ui/icons";
import { augmentRequirements } from "../data/augmentRequirements";
import useMarketPrices from "../hooks/useMarketPrices";

const sharedInputStyle = {
  bg: "gray.700",
  color: "gray.100",
  borderColor: "gray.600",
};

export default function AugmentCalculator({ item }) {
  const baseMaterials = item.augmentCost || {};

  const [startLevel, setStartLevel] = useState(0);
  const [startProgress, setStartProgress] = useState(0);
  const [targetLevel, setTargetLevel] = useState(7);
  const [showTable, setShowTable] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");

  const [materials, setMaterials] = useState(() => {
    return Object.keys(baseMaterials).length > 0
      ? { ...baseMaterials }
      : { "Example Material": 0 };
  });

  const materialList = Object.keys(materials);
  const applicableLevels = useMemo(
    () => augmentRequirements.slice(startLevel, targetLevel),
    [startLevel, targetLevel]
  );

  const handleMaterialChange = (mat, value) => {
    setMaterials((prev) => ({
      ...prev,
      [mat]: isNaN(value) ? 0 : value,
    }));
  };

  const handleMaterialRename = (oldName, newName) => {
    if (!newName || newName === oldName) return;
    setMaterials((prev) => {
      const updated = { ...prev };
      updated[newName] = updated[oldName];
      delete updated[oldName];
      return updated;
    });
  };

  const handleRemoveMaterial = (mat) => {
    setMaterials(({ [mat]: _, ...rest }) => rest);
  };

  const handleAddMaterial = () => {
    const name = newMaterialName.trim();
    if (!name || materials[name]) return;
    setMaterials((prev) => ({ ...prev, [name]: 0 }));
    setNewMaterialName("");
  };

  const prices = useMarketPrices();

  const totalMaterials = {};
  let totalCopies = 0;

  applicableLevels.forEach((lvl, i) => {
    const counters =
      i === 0 ? Math.max(lvl.counter - startProgress, 0) : lvl.counter;
    totalCopies += lvl.copies || 0;

    materialList.forEach((mat) => {
      totalMaterials[mat] =
        (totalMaterials[mat] || 0) + counters * (materials[mat] || 0);
    });
  });

  return (
    <Box
      w="100%"
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="md"
      p={6}
    >
      <Heading size="sm" mb={4} color="gray.100">
        Augment Calculator
      </Heading>

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
          onChange={setStartProgress}
        />
        <LevelSelector
          label="Target level"
          value={targetLevel}
          onChange={setTargetLevel}
        />
      </Box>

      <MaterialConfig
        materials={materials}
        onChange={handleMaterialChange}
        onRename={handleMaterialRename}
        onRemove={handleRemoveMaterial}
        newMaterialName={newMaterialName}
        setNewMaterialName={setNewMaterialName}
        onAdd={handleAddMaterial}
      />

      <Button
        size="sm"
        variant="solid"
        bg="gray.700"
        _hover={{ bg: "gray.600" }}
        color="gray.100"
        onClick={() => setShowTable((s) => !s)}
        mb={2}
      >
        {showTable ? "Hide Level Table" : "Show Level Table"}
      </Button>

      <Collapse in={showTable} animateOpacity>
        <Box overflowX="auto" mt={2}>
          <LevelTable
            levels={applicableLevels}
            startLevel={startLevel}
            materials={materials}
            startProgress={startProgress}
          />
        </Box>
      </Collapse>

      <Summary
        totalMaterials={totalMaterials}
        totalCopies={totalCopies}
        prices={prices}
      />
    </Box>
  );
}

function LevelSelector({ label, value, onChange }) {
  return (
    <Box>
      <Text color="gray.300" mb={1}>
        {label}
      </Text>
      <Select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        size="sm"
        maxW="100px"
        {...sharedInputStyle}
      >
        {Array.from({ length: 100 }, (_, i) => (
          <option key={i} value={i}>
            +{i}
          </option>
        ))}
      </Select>
    </Box>
  );
}

function CounterInput({ label, value, max, onChange }) {
  return (
    <Box>
      <Text color="gray.300" mb={1}>
        {label}
      </Text>
      <NumberInput
        size="sm"
        value={value}
        min={0}
        max={max}
        onChange={(_, val) => onChange(isNaN(val) ? 0 : val)}
      >
        <NumberInputField maxW="100px" {...sharedInputStyle} />
      </NumberInput>
    </Box>
  );
}

function MaterialConfig({
  materials,
  onChange,
  onRename,
  onRemove,
  newMaterialName,
  setNewMaterialName,
  onAdd,
}) {
  return (
    <Box mb={4}>
      <Heading size="xs" color="gray.300" mb={2}>
        Materials per Counter{" "}
        <Text as="span" fontSize="sm" color="red.400">
          (editable until data fixed)
        </Text>
      </Heading>

      <VStack align="start" spacing={2}>
        {Object.keys(materials).map((mat) => (
          <HStack key={mat} spacing={2}>
            <Input
              value={mat}
              onChange={(e) => onRename(mat, e.target.value)}
              size="sm"
              maxW="160px"
              {...sharedInputStyle}
            />
            <NumberInput
              size="sm"
              min={0}
              value={materials[mat]}
              onChange={(_, val) => onChange(mat, val)}
            >
              <NumberInputField {...sharedInputStyle} />
            </NumberInput>
            <IconButton
              icon={<CloseIcon />}
              size="xs"
              aria-label="Remove"
              onClick={() => onRemove(mat)}
            />
          </HStack>
        ))}
        <HStack pt={2}>
          <Input
            size="sm"
            placeholder="Add material"
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            maxW="200px"
            {...sharedInputStyle}
          />
          <Button size="sm" onClick={onAdd} colorScheme="teal">
            Add
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}

function LevelTable({ levels, startLevel, materials, startProgress }) {
  const materialList = Object.keys(materials);
  return (
    <Table size="sm" variant="simple">
      <Thead>
        <Tr>
          <Th color="gray.300">Level</Th>
          <Th color="gray.300">Counters</Th>
          <Th color="gray.300">Copies</Th>
          {materialList.map((mat) => (
            <Th key={mat} color="gray.300">
              {mat}
            </Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {levels.map((lvl, i) => {
          const level = startLevel + i + 1;
          const counters =
            i === 0 ? Math.max(lvl.counter - startProgress, 0) : lvl.counter;
          return (
            <Tr key={level}>
              <Td color="gray.400">+{level}</Td>
              <Td color="gray.400">{counters}</Td>
              <Td color="gray.400">{lvl.copies}</Td>
              {materialList.map((mat) => (
                <Td key={mat} color="gray.400">
                  {counters * (materials[mat] || 0)}
                </Td>
              ))}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}

function Summary({ totalMaterials, totalCopies, prices }) {
  const estimatedCost = Object.entries(totalMaterials).reduce(
    (total, [mat, qty]) => {
      const unitPrice = prices?.[mat] || 0;
      return total + qty * unitPrice;
    },
    0
  );

  return (
    <Box mt={6}>
      <Heading size="xs" color="gray.300" mb={2}>
        Summary
      </Heading>
      <VStack align="start" spacing={1}>
        {Object.entries(totalMaterials).map(([mat, qty]) => (
          <Text key={mat} fontSize="sm" color="gray.400">
            {qty} × {mat}{" "}
            {prices?.[mat]
              ? `(${(prices[mat] * qty).toLocaleString()} Gold)`
              : ""}
          </Text>
        ))}
        {totalCopies > 0 && (
          <Text fontSize="sm" color="gray.400">
            {totalCopies} × base item copies
          </Text>
        )}
        <Text pt={2} fontWeight="bold" color="teal.300">
          Estimated Cost: {estimatedCost.toLocaleString()} Gold
        </Text>
      </VStack>
    </Box>
  );
}
