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
  FormControl,
  FormErrorMessage,
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
        <Text as="span" fontSize="sm" color="red.400">
          (editable)
        </Text>
      </Heading>

      <VStack align="start" spacing={2}>
        {materials.map((mat) => {
          const isInvalid = !mat.name.trim();

          return (
            <HStack key={mat.id} spacing={2} align="start">
              <FormControl isInvalid={isInvalid}>
                <Input
                  value={mat.name}
                  onChange={(e) => onRename(mat.id, e.target.value)}
                  onBlur={(e) => onRename(mat.id, e.target.value.trim())}
                  size="sm"
                  maxW="160px"
                  {...sharedInputStyle}
                />
                {isInvalid && (
                  <FormErrorMessage>Material name required</FormErrorMessage>
                )}
              </FormControl>

              <NumberInput
                size="sm"
                min={0}
                value={mat.qty}
                onChange={(_, v) => onChange(mat.id, v)}
              >
                <NumberInputField {...sharedInputStyle} />
              </NumberInput>

              <IconButton
                icon={<CloseIcon />}
                size="xs"
                aria-label="Remove"
                onClick={() => onRemove(mat.id)}
              />
            </HStack>
          );
        })}

        <HStack pt={2}>
          <Input
            size="sm"
            placeholder="Add material"
            value={newMaterialName}
            onChange={(e) => setNewMaterialName(e.target.value)}
            onBlur={(e) => {
              const cleaned = e.target.value.trim();
              if (cleaned !== e.target.value) {
                setNewMaterialName(cleaned);
              }
            }}
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
