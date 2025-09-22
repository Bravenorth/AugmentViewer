import { augmentRequirements } from "../../../../data/augmentRequirements";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";

export default function LevelSelector({ label, value, onChange }) {
  const options = augmentRequirements.map((_, index) => ({
    value: index,
    label: `+${index}`,
  }));

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
