
import { Box, Select, Text } from "@chakra-ui/react";

const sharedInputStyle = {
  bg: "gray.700",
  color: "gray.100",
  borderColor: "gray.600",
};

export default function LevelSelector({ label, value, onChange }) {
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
        {Array.from({ length: 100 }, (_, i) => (
          <option key={i} value={i}>+{i}</option>
        ))}
      </Select>
    </Box>
  );
}
