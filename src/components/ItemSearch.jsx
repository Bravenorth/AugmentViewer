// src/components/ItemSearch.jsx
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Text,
  VStack,
  Heading,
  Tag,
  TagLabel,
  Button,
  Wrap,
  WrapItem,
  Collapse,
  IconButton,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon, ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons";
import React, { useMemo, useState, useRef, useEffect } from "react";
import rawItems from "../data/combined_items.json";

const ITEMS_PER_LOAD = 30;

export default function ItemSearch({ onSelectItem }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_LOAD);
  const observerRef = useRef();
  const { isOpen, onToggle } = useDisclosure();

  const items = useMemo(
    () => Object.values(rawItems).filter((item) => item.name),
    []
  );

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

  const visibleItems = filteredItems.slice(0, visibleCount);

  useEffect(() => {
    if (!observerRef.current || visibleItems.length >= filteredItems.length)
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) =>
            Math.min(prev + ITEMS_PER_LOAD, filteredItems.length)
          );
        }
      },
      { threshold: 1.0 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [visibleItems, filteredItems]);

  return (
    <VStack align="start" spacing={6} w="100%" maxW="1000px" mx="auto" mt={10}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.500" />
        </InputLeftElement>
        <Input
          placeholder="Search for an item..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibleCount(ITEMS_PER_LOAD);
          }}
          size="lg"
          bg="gray.800"
          color="gray.100"
          border="1px solid"
          borderColor="gray.700"
          borderRadius="md"
          fontSize="md"
          _focus={{ borderColor: "brand.400", boxShadow: "0 0 0 1px #2c94cb" }}
        />
        <IconButton
          ml={2}
          aria-label="Toggle filters"
          icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          onClick={onToggle}
          variant="solid"
          size="lg"
          bg="gray.700"
          _hover={{ bg: "gray.600" }}
          color="white"
          border="1px solid"
          borderColor="gray.600"
        />
      </InputGroup>

      <Collapse in={isOpen} animateOpacity>
        <Wrap spacing={2} mt={2}>
          {getAllTags.map((tag) => (
            <WrapItem key={tag}>
              <Tag
                size="sm"
                variant={activeTags.includes(tag) ? "solid" : "subtle"}
                colorScheme={activeTags.includes(tag) ? "blue" : "gray"}
                cursor="pointer"
                onClick={() => handleTagToggle(tag)}
              >
                {tag}
              </Tag>
            </WrapItem>
          ))}
          {(activeTags.length > 0 || query) && (
            <WrapItem>
              <Button
                size="sm"
                onClick={clearFilters}
                colorScheme="red"
                variant="outline"
              >
                Clear Filters
              </Button>
            </WrapItem>
          )}
        </Wrap>
      </Collapse>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={5} w="100%">
        {visibleItems.map((item) => (
          <Box
            key={`${item.name}-${item.id ?? item.key ?? Math.random()}`}
            onClick={() => onSelectItem(item)}
            cursor="pointer"
            bg="gray.800"
            border="1px solid"
            borderColor="gray.700"
            borderRadius="md"
            boxShadow="md"
            p={4}
            _hover={{ borderColor: "brand.400", bg: "gray.700" }}
          >
            <Heading size="sm" color="gray.100" mb={1}>
              {item.name}
            </Heading>
            {item.id && (
              <Text fontSize="sm" color="gray.400" mb={2}>
                ID: {item.id}
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
          </Box>
        ))}
      </SimpleGrid>

      <div ref={observerRef} style={{ height: "20px" }} />
    </VStack>
  );
}
