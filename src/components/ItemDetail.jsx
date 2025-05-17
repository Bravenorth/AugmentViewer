// src/components/ItemDetail.jsx
import {
  Box,
  Heading,
  Text,
  VStack,
  Button,
  Tag,
  TagLabel,
  Divider,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import AugmentCalculator from "./AugmentCalculator";

const rarityColors = {
  common: "gray",
  uncommon: "green",
  rare: "blue",
  epic: "purple",
  legendary: "orange",
  mythical: "red",
};

export default function ItemDetail({ item, onBack }) {
  return (
    <VStack align="start" spacing={6}>
      <Button
        leftIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="solid"
        colorScheme="gray"
        size="sm"
        bg="gray.600"
        _hover={{ bg: "gray.500" }}
      >
        Back to Search
      </Button>

      <Box
        w="100%"
        bg="gray.800"
        border="1px solid"
        borderColor="gray.700"
        borderRadius="md"
        p={6}
      >
        <Heading size="md" mb={1} color="gray.100">
          {item.name}
        </Heading>

        {item.id && (
          <Text fontSize="sm" color="gray.400" mb={1}>
            ID: {item.id}
          </Text>
        )}

        {item.key && (
          <Text fontSize="sm" color="gray.500" mb={2}>
            Key: {item.key}
          </Text>
        )}

        {item.rarity && (
          <Tag
            size="sm"
            colorScheme={rarityColors[item.rarity] || "gray"}
            variant="subtle"
          >
            <TagLabel>{item.rarity}</TagLabel>
          </Tag>
        )}

        <Wrap mt={4} spacing={2}>
          {item.slot && (
            <WrapItem>
              <Tag size="sm" colorScheme="cyan">
                <TagLabel>Slot: {item.slot}</TagLabel>
              </Tag>
            </WrapItem>
          )}
          {item.class && (
            <WrapItem>
              <Tag size="sm" colorScheme="yellow">
                <TagLabel>Class: {item.class}</TagLabel>
              </Tag>
            </WrapItem>
          )}
          {item.levelRequired &&
            Object.entries(item.levelRequired).map(([skill, lvl]) => (
              <WrapItem key={skill}>
                <Tag size="sm" colorScheme="purple">
                  <TagLabel>
                    {skill}: {lvl}
                  </TagLabel>
                </Tag>
              </WrapItem>
            ))}
          {item.tags?.map((tag) => (
            <WrapItem key={tag}>
              <Tag size="sm" colorScheme="gray">
                <TagLabel>{tag}</TagLabel>
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      </Box>

      <Box
        w="100%"
        bg="gray.800"
        border="1px solid"
        borderColor="gray.700"
        borderRadius="md"
        p={6}
      >
        <Heading size="sm" mb={3} color="gray.100">
          Augment Calculator
        </Heading>
        <Text fontSize="sm" color="gray.400">
          This panel will allow you to calculate total augment cost, level
          targets, and more based on item data.
        </Text>
        <Divider my={4} borderColor="gray.600" />
        <Text fontSize="sm" color="red.500">
          WORK IN PROGRESS – Base material and recipe data may be incomplete or
          approximative.
        </Text>
        <AugmentCalculator item={item} />
      </Box>
    </VStack>
  );
}
