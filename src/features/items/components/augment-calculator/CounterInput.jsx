import { FormControl, FormLabel, Input, Tooltip, FormHelperText } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export default function CounterInput({
  label,
  value,
  min = 0,
  max,
  onChange,
  tooltip,
  helperText,
  ariaLabel,
}) {
  const [inputValue, setInputValue] = useState(String(value));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clampValue = (val) => {
    let result = Number.isFinite(val) ? val : 0;
    if (typeof max === 'number' && Number.isFinite(max)) {
      result = Math.min(result, max);
    }
    if (typeof min === 'number' && Number.isFinite(min)) {
      result = Math.max(result, min);
    }
    return result;
  };

  const handleBlur = () => {
    const normalized = inputValue.replace(',', '.');
    const parsed = parseFloat(normalized);
    const safeValue = clampValue(parsed);
    onChange(safeValue);
    setInputValue(String(safeValue));
  };

  const numericValue = Number(value);
  const isInvalid =
    (Number.isFinite(min) && numericValue < min) ||
    (Number.isFinite(max) && numericValue > max);

  return (
    <Tooltip label={tooltip} isDisabled={!tooltip} hasArrow placement="top-start">
      <FormControl isInvalid={isInvalid} maxW="160px">
        <FormLabel color="gray.300" fontSize="sm">
          {label}
        </FormLabel>
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={handleBlur}
          aria-label={ariaLabel || label}
          size="sm"
        />
        {helperText && (
          <FormHelperText color={isInvalid ? 'red.300' : 'gray.500'}>
            {helperText}
          </FormHelperText>
        )}
      </FormControl>
    </Tooltip>
  );
}
