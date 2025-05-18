import {
  Box,
  Text,
  Button,
  Tag,
  Wrap,
  WrapItem,
  Flex,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import AugmentCalculator from "./AugmentCalculator";
import ItemStatTooltip from "./ItemStatTooltip";

const rarityColors = {
  common: "gray",
  uncommon: "green",
  rare: "blue",
  epic: "purple",
  legendary: "orange",
  mythical: "red",
};

export default function ItemDetail({ item, onBack }) {
  const stats = item.equipmentStats || {};

  return (
    <Box w="100%" maxW="1800px" mx="auto" px={6} mt={6}>
      <Button
        leftIcon={<ArrowBackIcon />}
        onClick={onBack}
        variant="solid"
        colorScheme="gray"
        size="sm"
        bg="gray.600"
        _hover={{ bg: "gray.500" }}
        mb={4}
      >
        Back to Search
      </Button>

      <Flex gap={6} direction={{ base: "column", md: "row" }} align="flex-start">
        {/* LEFT SIDE - STATS TOOLTIP STYLE */}
        <Box
          flex="1.4"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="md"
          p={5}
          minW={0}
        >
          <Text fontSize="lg" fontWeight="bold" mb={2} color="gray.100">
            {item.name}
          </Text>

          <Wrap mb={3} spacing={2}>
            {item.rarity && (
              <Tag size="sm" colorScheme={rarityColors[item.rarity] || "gray"}>
                {item.rarity}
              </Tag>
            )}
            {item.class && (
              <Tag size="sm" colorScheme="yellow">
                {item.class}
              </Tag>
            )}
            {stats.slot && (
              <Tag size="sm" colorScheme="cyan">
                {stats.slot}
              </Tag>
            )}
            {item.level && (
              <Tag size="sm" colorScheme="purple">
                Lv {item.level}
              </Tag>
            )}
            {item.tradeable === false && (
              <Tag size="sm" colorScheme="red">
                Untradeable
              </Tag>
            )}
          </Wrap>

          {item.tags?.length > 0 && (
            <Wrap mb={3} spacing={1}>
              {item.tags.map((tag) => (
                <Tag size="sm" colorScheme="gray" key={tag}>
                  {tag}
                </Tag>
              ))}
            </Wrap>
          )}

          {/* Full stat block rendered via reusable compact tooltip */}
          <ItemStatTooltip item={item} />
        </Box>

        {/* RIGHT SIDE - AUGMENT CALCULATOR */}
        <Box
          flex="1"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="md"
          p={6}
          minW={0}
        >
          <Text fontSize="md" fontWeight="bold" mb={2} color="gray.100">
            Augment Calculator
          </Text>
          <Text fontSize="sm" color="gray.400">
            This panel will allow you to calculate total augment cost, level
            targets, and more based on item data.
          </Text>
          <Box my={4} h="1px" bg="gray.600" />
          <Text fontSize="sm" color="red.500" mb={2}>
            WORK IN PROGRESS – Base material and recipe data may be incomplete or approximative.
          </Text>
          <AugmentCalculator item={item} />
        </Box>
      </Flex>
    </Box>
  );
}
