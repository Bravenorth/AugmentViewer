import { augmentRequirements } from "../../../../data/augmentRequirements";
import {
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";

export default function LevelSelector({ label, value, onChange, maxValue, minValue = 0 }) {
  const fallbackMax = augmentRequirements.length - 1;
  const safeMin = Math.max(0, Number.isFinite(minValue) ? Math.floor(minValue) : 0);
  const computedMax = Number.isFinite(maxValue) ? Math.floor(maxValue) : fallbackMax;
  const safeMax = Math.max(safeMin, computedMax);

  const clampToRange = (input) => {
    const numeric = Number(input);
    if (!Number.isFinite(numeric)) {
      return safeMin;
    }
    const rounded = Math.round(numeric);
    if (rounded < safeMin) return safeMin;
    if (rounded > safeMax) return safeMax;
    return rounded;
  };

  const safeValue = clampToRange(value);

  const handleChange = (_, numericValue) => {
    if (!Number.isFinite(numericValue)) {
      return;
    }
    const nextValue = clampToRange(numericValue);
    if (nextValue !== safeValue) {
      onChange(nextValue);
    }
  };

  const handleBlur = (event) => {
    const normalized = clampToRange(event.target.value);
    if (normalized !== safeValue) {
      onChange(normalized);
    }
  };

  return (
    <FormControl maxW="160px">
      <FormLabel color="gray.300" fontSize="sm">
        {label}
      </FormLabel>
      <NumberInput
        value={safeValue}
        min={safeMin}
        max={safeMax}
        step={1}
        onChange={handleChange}
        onBlur={handleBlur}
        clampValueOnBlur
        keepWithinRange
        size="sm"
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </FormControl>
  );
}
