import {
  Box,
  Text,
  Button,
  Tag,
  Wrap,
  Flex,
  Divider,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import AugmentCalculator from "../AugmentCalculator/Main";
import ItemStatTooltip from "../common/ItemStatTooltip";
import isItemAugmentable from "../../utils/isAugmentable";

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
  const isAugmentable = isItemAugmentable(item);

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
                <Tag key={tag} size="sm" colorScheme="gray">
                  {tag}
                </Tag>
              ))}
            </Wrap>
          )}
          {item.extraTooltipInfo && (
            <>
              <Divider mb={3} borderColor="gray.700" />
              <Text fontSize="xs" color="gray.500" fontWeight="bold" mb={1}>
                Description
              </Text>
              <Text fontSize="sm" mb={3} color="gray.300" fontStyle="italic">
                {item.extraTooltipInfo}
              </Text>
            </>
          )}

          <Divider mb={4} borderColor="gray.600" />
          <ItemStatTooltip item={item} />
        </Box>
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

          {isAugmentable ? (
            <>
              <Text fontSize="sm" color="gray.400">
                This panel will allow you to calculate total augment cost, level targets, and more based on item data.
              </Text>

              <Box my={4} h="1px" bg="gray.600" />

              <Text fontSize="sm" color="red.500" mb={2}>
                WORK IN PROGRESS - Base material and recipe data may be incomplete or approximative.
              </Text>

              <AugmentCalculator item={item} />
            </>
          ) : (
            <Text fontSize="sm" color="gray.500" mt={2}>
              This item is <strong>not augmentable</strong>.
            </Text>
          )}
        </Box>
      </Flex>
    </Box>
  );
}


