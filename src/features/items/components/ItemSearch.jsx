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
  InputRightElement,
  SimpleGrid,
  Spinner,
  Stack,
  Tag,
  TagLabel,
  Text,
  Checkbox,
  CheckboxGroup,
  Wrap,
  WrapItem,
  Select,
} from "@chakra-ui/react";
import { SearchIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";
import React, { useMemo, useState, useRef, useEffect } from "react";
import rawItems from "../../../data/combined_items.json";
import isAugmentable from "../utils/isAugmentable";
import getItemKey from "../utils/getItemKey";

const ITEMS_PER_LOAD = 30;

const rarityOrder = ["mythical", "legendary", "epic", "rare", "uncommon", "common"];

const CLASS_FILTERS = [
  { value: "equipment", label: "Equipment" },
  { value: "key", label: "Keys" },
  { value: "scroll", label: "Scrolls" },
];

const getRarityRank = (rarity = "") => {
  const index = rarityOrder.indexOf(String(rarity).toLowerCase());
  return index === -1 ? rarityOrder.length : index;
};

const toTitleCase = (value = "") =>
  String(value)
    .split(/[_-]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const getFilterValueForClass = (itemClass) => {
  if (!itemClass) {
    return null;
  }

  const normalized = String(itemClass).toLowerCase();

  if (normalized === "equipment") {
    return "equipment";
  }

  if (normalized === "key") {
    return "key";
  }

  if (normalized.includes("scroll")) {
    return "scroll";
  }

  return null;
};

const getClassLabel = (itemClass) => {
  const filterValue = getFilterValueForClass(itemClass);
  const match = CLASS_FILTERS.find((option) => option.value === filterValue);

  if (match) {
    return match.label;
  }

  return toTitleCase(itemClass ?? "");
};

export default function ItemSearch({
  onSelectItem,
  selectedItemId,
  favoriteItemIds = [],
  onToggleFavorite,
}) {
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const [isLoading, setIsLoading] = useState(true);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortMode, setSortMode] = useState("favorites");
  const [activeClassFilters, setActiveClassFilters] = useState(
    CLASS_FILTERS.map((filter) => filter.value)
  );
  const observerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  const items = useMemo(
    () =>
      Object.values(rawItems).filter((item) => {
        if (!item?.name || !isAugmentable(item)) {
          return false;
        }

        return Boolean(getFilterValueForClass(item.class));
      }),
    []
  );

  const favoriteIdsSet = useMemo(
    () => new Set((favoriteItemIds || []).map((id) => String(id))),
    [favoriteItemIds]
  );

  const trimmedQuery = query.trim();
  const hasSearchQuery = trimmedQuery.length > 0;

  const filteredItems = useMemo(() => {
    const normalizedQuery = trimmedQuery.toLowerCase();
    const hasQuery = normalizedQuery.length > 0;
    const selectedFilterSet = new Set(activeClassFilters);

    return items.filter((item) => {
      const filterValue = getFilterValueForClass(item.class);

      if (!filterValue) {
        return false;
      }

      if (selectedFilterSet.size > 0 && !selectedFilterSet.has(filterValue)) {
        return false;
      }

      const itemKey = getItemKey(item);

      if (showFavoritesOnly && (!itemKey || !favoriteIdsSet.has(String(itemKey)))) {
        return false;
      }

      if (hasQuery) {
        const nameMatch = (item.name ?? "").toLowerCase().includes(normalizedQuery);
        const keyMatch = itemKey ? String(itemKey).toLowerCase().includes(normalizedQuery) : false;

        if (!nameMatch && !keyMatch) {
          return false;
        }
      }

      return true;
    });
  }, [items, activeClassFilters, trimmedQuery, showFavoritesOnly, favoriteIdsSet]);

  const sortedItems = useMemo(() => {
    const results = [...filteredItems];

    const compareByName = (a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" });

    return results.sort((a, b) => {
      if (sortMode === "name") {
        return compareByName(a, b);
      }

      if (sortMode === "rarity") {
        const rarityDifference = getRarityRank(a.rarity) - getRarityRank(b.rarity);
        if (rarityDifference !== 0) {
          return rarityDifference;
        }
        return compareByName(a, b);
      }

      const aKey = getItemKey(a);
      const bKey = getItemKey(b);
      const aFavorite = aKey ? favoriteIdsSet.has(String(aKey)) : false;
      const bFavorite = bKey ? favoriteIdsSet.has(String(bKey)) : false;

      if (aFavorite !== bFavorite) {
        return aFavorite ? -1 : 1;
      }

      return compareByName(a, b);
    });
  }, [filteredItems, sortMode, favoriteIdsSet]);

  const visibleItems = sortedItems.slice(0, visibleCount);
  const totalResults = sortedItems.length;

  useEffect(() => {
    if (!observerRef.current || visibleItems.length >= totalResults) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_LOAD, totalResults));
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [visibleItems.length, totalResults]);

  const rarityColors = {
    common: "gray",
    uncommon: "green",
    rare: "blue",
    epic: "purple",
    legendary: "orange",
    mythical: "red",
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <Center py={16} w="100%">
          <Spinner size="lg" color="brand.300" thickness="4px" />
        </Center>
      );
    }

    if (totalResults === 0) {
      let emptyTitle = "No items found";
      let emptyDescription = "Try adjusting your search or filters.";

      if (!hasSearchQuery && !showFavoritesOnly && activeClassFilters.length === 0) {
        emptyTitle = "No augmentable items";
        emptyDescription = "These categories currently have no items available.";
      } else if (showFavoritesOnly) {
        emptyTitle = "No favorite items yet";
        emptyDescription = "Mark items as favorites or disable the favorites filter.";
      } else if (hasSearchQuery) {
        emptyTitle = "Nothing matches your search";
        emptyDescription = "Refine your keywords or reset the filters.";
      }

      return (
        <Center py={16} px={6} textAlign="center" w="100%">
          <Stack spacing={2} align="center">
            <Heading size="sm" color="gray.200">
              {emptyTitle}
            </Heading>
            <Text fontSize="sm" color="gray.400">
              {emptyDescription}
            </Text>
          </Stack>
        </Center>
      );
    }

    return (
      <Stack spacing={4} w="100%">
        <Text fontSize="sm" color="gray.400">
          {totalResults === 1 ? "1 item" : `${totalResults} items`}
        </Text>
        <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} w="100%">
          {visibleItems.map((item, idx) => {
            const key = getItemKey(item);
            const cardKey = key ?? `${item.name ?? "item"}-${idx}`;
            const isSelected = selectedItemId && key === selectedItemId;
            const isFavorite = key ? favoriteIdsSet.has(String(key)) : false;
            const borderColor = isSelected
              ? "brand.400"
              : isFavorite
              ? "yellow.400"
              : "gray.700";
            const hoverBorderColor = isSelected
              ? "brand.300"
              : isFavorite
              ? "yellow.300"
              : "brand.300";
            const classLabel = getClassLabel(item.class);

            return (
              <Box
                key={cardKey}
                role="button"
                tabIndex={0}
                onClick={() => onSelectItem(item)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
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
                _hover={{ borderColor: hoverBorderColor, bg: "gray.750" }}
              >
                <Flex justify="space-between" align="flex-start" mb={2} gap={3}>
                  <Heading size="sm" color="gray.100">
                    {item.name}
                  </Heading>
                  <IconButton
                    icon={<StarIcon />}
                    size="sm"
                    variant={isFavorite ? "solid" : "ghost"}
                    colorScheme="yellow"
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
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
                    colorScheme={rarityColors[item.rarity] || "gray"}
                    variant="subtle"
                    mb={2}
                  >
                    <TagLabel>{toTitleCase(item.rarity)}</TagLabel>
                  </Tag>
                )}

                <Stack spacing={1}>
                  <Text fontSize="xs" color="gray.400">
                    Type: {classLabel}
                  </Text>
                  {item.maxAugLevel && (
                    <Text fontSize="xs" color="gray.400">
                      Max augment level: {item.maxAugLevel}
                    </Text>
                  )}
                </Stack>
              </Box>
            );
          })}
        </SimpleGrid>
      </Stack>
    );
  };

  return (
    <Stack spacing={6} w="100%">
      <Stack spacing={4}>
        <InputGroup size="md">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.500" />
          </InputLeftElement>
          <Input
            aria-label="Search for items"
            placeholder="Search for an item..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(ITEMS_PER_LOAD);
            }}
          />
          {hasSearchQuery && (
            <InputRightElement>
              <IconButton
                aria-label="Clear search"
                icon={<CloseIcon />}
                size="sm"
                variant="ghost"
                onClick={() => {
                  setQuery("");
                  setVisibleCount(ITEMS_PER_LOAD);
                }}
              />
            </InputRightElement>
          )}
        </InputGroup>

        <Box>
          <Text
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wide"
            color="gray.400"
            mb={1}
          >
            Categories
          </Text>
          <CheckboxGroup
            value={activeClassFilters}
            onChange={(values) => {
              setActiveClassFilters(values);
              setVisibleCount(ITEMS_PER_LOAD);
            }}
          >
            <Wrap spacing={3}>
              {CLASS_FILTERS.map((filter) => (
                <WrapItem key={filter.value}>
                  <Checkbox value={filter.value}>{filter.label}</Checkbox>
                </WrapItem>
              ))}
            </Wrap>
          </CheckboxGroup>
        </Box>

        <Flex
          direction={{ base: "column", md: "row" }}
          gap={3}
          align={{ base: "flex-start", md: "center" }}
        >
          <Checkbox
            isChecked={showFavoritesOnly}
            onChange={(event) => {
              setShowFavoritesOnly(event.target.checked);
              setVisibleCount(ITEMS_PER_LOAD);
            }}
          >
            Favorites only
          </Checkbox>

          <Select
            value={sortMode}
            onChange={(event) => {
              setSortMode(event.target.value);
              setVisibleCount(ITEMS_PER_LOAD);
            }}
            w={{ base: "100%", md: "200px" }}
            aria-label="Sort items"
          >
            <option value="favorites">Favorites first</option>
            <option value="name">A to Z</option>
            <option value="rarity">Rarity</option>
          </Select>
        </Flex>
      </Stack>

      <Divider borderColor="gray.700" />

      {renderResults()}

      <Box ref={observerRef} h="20px" />
    </Stack>
  );
}
