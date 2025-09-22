import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  Stack,
  Tag,
  Text,
  Wrap,
} from "@chakra-ui/react";
import { ArrowBackIcon, ChevronRightIcon, StarIcon } from "@chakra-ui/icons";
import React from "react";
import AugmentCalculator from "./augment-calculator/AugmentCalculator";
import ItemStatTooltip from "./ItemStatTooltip";
import isItemAugmentable from "../utils/isAugmentable";

const rarityColors = {
  common: "gray",
  uncommon: "green",
  rare: "blue",
  epic: "purple",
  legendary: "orange",
  mythical: "red",
};

export default function ItemDetail({ item, onBack, isFavorite = false, onToggleFavorite }) {
  const stats = item.equipmentStats || {};
  const isAugmentable = isItemAugmentable(item);
  const canToggleFavorite = typeof onToggleFavorite === 'function';
  const favoriteLabel = isFavorite ? 'Remove from favorites' : 'Add to favorites';

  return (
    <Stack spacing={6}>
      <Stack spacing={3}>
        <Breadcrumb
          separator={<ChevronRightIcon color="gray.500" boxSize={3} />}
          fontSize="sm"
          color="gray.400"
        >
          <BreadcrumbItem>
            <BreadcrumbLink as="button" onClick={onBack} color="brand.300" cursor="pointer">
              Items
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="gray.200">{item.name}</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        <Flex align={{ base: 'flex-start', md: 'center' }} justify="space-between" wrap="wrap" gap={3}>
          <HStack spacing={3} align="center">
            <Heading size="md" color="gray.100">
              {item.name}
            </Heading>
            {canToggleFavorite && (
              <IconButton
                icon={<StarIcon />}
                size="sm"
                variant={isFavorite ? 'solid' : 'ghost'}
                colorScheme="yellow"
                aria-label={favoriteLabel}
                aria-pressed={isFavorite}
                onClick={() => onToggleFavorite(item)}
                isRound
              />
            )}
          </HStack>
          <Button
            variant="ghost"
            leftIcon={<ArrowBackIcon />}
            onClick={onBack}
            aria-label="Back to search results"
          >
            Back to search
          </Button>
        </Flex>
      </Stack>

      <Flex
        direction={{ base: 'column', xl: 'row' }}
        align="flex-start"
        gap={6}
      >
        <Stack
          spacing={5}
          flex={{ base: '1', xl: '1.1' }}
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="md"
          p={6}
          minW={0}
        >
          <Wrap spacing={2}>
            {item.rarity && (
              <Tag size="sm" colorScheme={rarityColors[item.rarity] || 'gray'}>
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
            <Wrap spacing={1}>
              {item.tags.map((tag) => (
                <Tag key={tag} size="sm" colorScheme="gray">
                  {tag}
                </Tag>
              ))}
            </Wrap>
          )}

          {item.extraTooltipInfo && (
            <Stack spacing={3}>
              <Divider borderColor="gray.700" />
              <Text fontSize="xs" color="gray.500" fontWeight="bold">
                Description
              </Text>
              <Text fontSize="sm" color="gray.300" fontStyle="italic">
                {item.extraTooltipInfo}
              </Text>
            </Stack>
          )}

          <Divider borderColor="gray.700" />
          <ItemStatTooltip item={item} />
        </Stack>

        <Box
          flex={{ base: '1', xl: '1' }}
          w="100%"
          bg="gray.800"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="md"
          p={6}
        >
          <Stack spacing={4}>
            <Heading size="sm" color="gray.100">
              Augment Planner
            </Heading>
            {isAugmentable ? (
              <AugmentCalculator item={item} />
            ) : (
              <Stack spacing={3} align="flex-start">
                <Text fontSize="sm" color="gray.400">
                  This item cannot be augmented.
                </Text>
                <Button size="sm" onClick={onBack} variant="outline">
                  Back to search
                </Button>
              </Stack>
            )}
          </Stack>
        </Box>
      </Flex>
    </Stack>
  );
}
