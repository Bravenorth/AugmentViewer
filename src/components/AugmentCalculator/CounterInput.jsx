
import { Box, Text, Input } from "@chakra-ui/react";
import { useState } from "react";

const sharedInputStyle = {
  bg: "gray.700",
  color: "gray.100",
  borderColor: "gray.600",
};

export default function CounterInput({ label, value, max, onChange }) {
  const [inputValue, setInputValue] = useState(String(value));

  const handleBlur = () => {
    const normalized = inputValue.replace(",", ".");
    const parsed = parseFloat(normalized);
    if (!isNaN(parsed)) {
      onChange(parsed);
    } else {
      onChange(0);
    }
  };

  return (
    <Box>
      <Text color="gray.300" mb={1}>{label}</Text>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleBlur}
        maxW="120px"
        size="sm"
        {...sharedInputStyle}
      />
    </Box>
  );
}
