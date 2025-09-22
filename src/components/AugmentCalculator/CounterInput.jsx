import { Box, Text, Input } from "@chakra-ui/react";
import { useState, useEffect } from "react";

const sharedInputStyle = {
  bg: "gray.700",
  color: "gray.100",
  borderColor: "gray.600",
};

export default function CounterInput({ label, value, max, onChange }) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clampValue = (val) => {
    let result = Number.isFinite(val) ? val : 0;
    if (typeof max === "number" && Number.isFinite(max)) {
      result = Math.min(result, max);
    }
    return Math.max(result, 0);
  };

  const handleBlur = () => {
    const normalized = inputValue.replace(",", ".");
    const parsed = parseFloat(normalized);
    const safeValue = clampValue(parsed);
    onChange(safeValue);
    setInputValue(String(safeValue));
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
