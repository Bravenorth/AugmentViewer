import { augmentRequirements } from "../../../../data/augmentRequirements";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";

export default function LevelSelector({ label, value, onChange, maxValue, minValue = 0 }) {
  const fallbackMax = augmentRequirements.length - 1;
  const safeMin = Math.max(0, Number.isFinite(minValue) ? Math.floor(minValue) : 0);
  const computedMax = Number.isFinite(maxValue) ? Math.floor(maxValue) : fallbackMax;
  const safeMax = Math.max(safeMin, computedMax);

  const options = [];
  for (let optionValue = safeMin; optionValue <= safeMax; optionValue += 1) {
    options.push({
      value: optionValue,
      label: `+${optionValue}`,
    });
  }

  if (options.length === 0) {
    options.push({ value: 0, label: "+0" });
  }

  return (
    <FormControl maxW="160px">
      <FormLabel color="gray.300" fontSize="sm">
        {label}
      </FormLabel>
      <Select value={value} onChange={(event) => onChange(+event.target.value)} size="sm">
        {options.map(({ value: optionValue, label: optionLabel }) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}