
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  IconButton,
  Button,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const sharedInputStyle = {
  bg: "gray.700",
  color: "gray.100",
  borderColor: "gray.600",
};

export default function MaterialConfig({
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
        <Text as="span" fontSize="sm" color="red.400">(editable)</Text>
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
              onChange={(_, v) => onChange(mat, v)}
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
