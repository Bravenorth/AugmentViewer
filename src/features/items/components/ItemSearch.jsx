import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  Wrap,
  WrapItem,
  Collapse,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon, ChevronUpIcon, StarIcon } from "@chakra-ui/icons";
import React, { useMemo, useState, useRef, useEffect } from "react";
import rawItems from "../../../data/combined_items.json";
import isAugmentable from "../utils/isAugmentable";
import getItemKey from "../utils/getItemKey";

const ITEMS_PER_LOAD = 30;

export default function ItemSearch({
  onSelectItem,
  selectedItemId,
  favoriteItemIds = [],
  onToggleFavorite,
}) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [isLoading, setIsLoading] = useState(true);
  const observerRef = useRef();
  const { isOpen, onToggle } = useDisclosure();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(
    () => Object.values(rawItems).filter((item) => item.name && isAugmentable(item)),
    []
  );

  const favoriteIdsSet = useMemo(() => new Set((favoriteItemIds || []).map(String)), [favoriteItemIds]);

  const rarityColors = {
    common: "gray",
    uncommon: "green",
    rare: "blue",
    epic: "purple",
    legendary: "orange",
    mythical: "red",
  };

  const getAllTags = useMemo(() => {
    const tagSet = new Set();
    items.forEach((item) => {
      if (item.rarity) tagSet.add(item.rarity);
      if (item.class) tagSet.add(item.class);
      if (item.tradeable === false) tagSet.add("untradeable");
      if (item.slot) tagSet.add(item.slot);
      if (item.tags) item.tags.forEach((t) => tagSet.add(t));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const handleTagToggle = (tag) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
    setVisibleCount(ITEMS_PER_LOAD);
  };

  const clearFilters = () => {
    setActiveTags([]);
    setQuery("");
    setVisibleCount(ITEMS_PER_LOAD);
  };

  const matchesFilters = (item) => {
    const normalizedTags = [
      item.rarity,
      item.class,
      item.tradeable === false ? "untradeable" : null,
      item.slot,
      ...(item.tags || []),
    ].filter(Boolean);
    return activeTags.every((tag) => normalizedTags.includes(tag));
  };

  const filteredItems = items
    .filter(
      (item) =>
        item.name?.toLowerCase().includes(query.toLowerCase()) ||
        item.key?.toLowerCase().includes(query.toLowerCase())
    )
    .filter(matchesFilters);

  const sortedItems = useMemo(() => {
    if (favoriteIdsSet.size === 0) return filteredItems;
    const favorites = [];
    const others = [];

    filteredItems.forEach((item) => {
      const key = getItemKey(item);
      if (key && favoriteIdsSet.has(key)) {
        favorites.push(item);
      } else {
        others.push(item);
      }
    });

    return [...favorites, ...others];
  }, [filteredItems, favoriteIdsSet]);

  const visibleItems = sortedItems.slice(0, visibleCount);

  useEffect(() => {
    if (!observerRef.current || visibleItems.length >= sortedItems.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + ITEMS_PER_LOAD, sortedItems.length)
          );
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [visibleItems, sortedItems]);

  const renderResults = () => {
    if (isLoading) {
      return (
        <Center py={16} w="100%">
          <Spinner size="lg" color="brand.300" thickness="4px" />
        </Center>
      );
    }

    if (sortedItems.length === 0) {
      return (
        <Center py={16} px={6} textAlign="center" w="100%">
          <Stack spacing={2} align="center">
            <Heading size="sm" color="gray.200">
              No items found
            </Heading>
            <Text fontSize="sm" color="gray.400">
              Try adjusting your search or filters to find another augmentable item.
            </Text>
          </Stack>
        </Center>
      );
    }

    return (
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
        {visibleItems.map((item, idx) => {
          const key = getItemKey(item);
          const cardKey = key ?? `${item.name ?? "item"}-${idx}`;
          const isSelected = selectedItemId && key === selectedItemId;
          const isFavorite = key ? favoriteIdsSet.has(key) : false;
          const borderColor = isSelected ? 'brand.400' : isFavorite ? 'yellow.400' : 'gray.700';
          const hoverBorderColor = isSelected ? 'brand.300' : isFavorite ? 'yellow.300' : 'brand.300';

          return (
            <Box
              key={cardKey}
              role="button"
              tabIndex={0}
              onClick={() => onSelectItem(item)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelectItem(item);
                }
              }}
              cursor="pointer"
              bg="gray.800"
              border="1px solid"
              borderColor={borderColor}
              borderRadius="md"
              boxShadow="md"
              p={4}
              transition="all 0.2s ease"
              _hover={{ borderColor: hoverBorderColor, bg: 'gray.750' }}
            >
              <Flex justify="space-between" align="flex-start" mb={2} gap={3}>
                <Heading size="sm" color="gray.100">
                  {item.name}
                </Heading>
                <IconButton
                  icon={<StarIcon />}
                  size="sm"
                  variant={isFavorite ? 'solid' : 'ghost'}
                  colorScheme="yellow"
                  aria-label={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (onToggleFavorite) {
                      onToggleFavorite(item);
                    }
                  }}
                  isRound
                />
              </Flex>
              {item.id && (
                <Text fontSize="xs" color="gray.400" mb={2}>
                  ID: {item.id}
                </Text>
              )}
              {item.rarity && (
                <Tag
                  size="sm"
                  colorScheme={rarityColors[item.rarity] || 'gray'}
                  variant="subtle"
                >
                  <TagLabel>{item.rarity}</TagLabel>
                </Tag>
              )}
            </Box>
          );
        })}
      </SimpleGrid>
    );
  };

  return (
    <Stack spacing={6} w="100%">
      <InputGroup size="md">
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.500" />
        </InputLeftElement>
        <Input
          aria-label="Search for items"
          placeholder="Search for an item..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(ITEMS_PER_LOAD);
          }}
        />
        <IconButton
          ml={2}
          aria-label={isOpen ? 'Hide filters' : 'Show filters'}
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={onToggle}
          variant="ghost"
        />
      </InputGroup>

      <Collapse in={isOpen} animateOpacity>
        <Stack spacing={3} border="1px solid" borderColor="gray.700" borderRadius="md" p={4}>
          <Wrap spacing={2}>
            {getAllTags.map((tag) => (
              <WrapItem key={tag}>
                <Tag
                  size="sm"
                  variant={activeTags.includes(tag) ? 'solid' : 'subtle'}
                  colorScheme={activeTags.includes(tag) ? 'blue' : 'gray'}
                  cursor="pointer"
                  onClick={() => handleTagToggle(tag)}
                >
                  {tag}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
          {(activeTags.length > 0 || query) && (
            <Flex justify="flex-end">
              <Button size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </Flex>
          )}
        </Stack>
      </Collapse>

      <Divider borderColor="gray.700" />

      {renderResults()}

      <Box ref={observerRef} h="20px" />
    </Stack>
  );
}
