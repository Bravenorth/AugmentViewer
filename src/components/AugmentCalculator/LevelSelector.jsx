import { augmentRequirements } from "../../data/augmentRequirements";
import { Box, Select, Text } from "@chakra-ui/react";

const sharedInputStyle = {
  bg: "gray.700",
  color: "gray.100",
  borderColor: "gray.600",
};

export default function LevelSelector({ label, value, onChange }) {
  const options = augmentRequirements.map((level, index) => ({
    value: index,
    label: `+${level.level ?? index}`,
  }));

  return (
    <Box>
      <Text color="gray.300" mb={1}>{label}</Text>
      <Select
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        size="sm"
        maxW="100px"
        {...sharedInputStyle}
      >
        {options.map(({ value: optionValue, label: optionLabel }) => (
          <option key={optionValue} value={optionValue}>{optionLabel}</option>
        ))}
      </Select>
    </Box>
  );
}
