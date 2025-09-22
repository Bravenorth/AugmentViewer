/// <reference types="vite/client" />

import { Box, Center, Icon, Stack, Text } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import AppLayout from "./layout/AppLayout";
import { ItemSearch, ItemDetail } from "../features/items";
import getItemKey from "../features/items/utils/getItemKey";

const FAVORITES_STORAGE_KEY = "augment-favorite-items-v1";

const loadFavorites = () => {
  if (typeof window === "undefined") return [];
  try {
    const stored = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch (error) {
    console.error("Failed to load favorite items", error);
    return [];
  }
};

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [favoriteItemIds, setFavoriteItemIds] = useState(() => loadFavorites());

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favoriteItemIds));
    } catch (error) {
      console.error("Failed to persist favorite items", error);
    }
  }, [favoriteItemIds]);

  const toggleFavorite = (item) => {
    const key = getItemKey(item);
    if (!key) return;
    setFavoriteItemIds((prev) =>
      prev.includes(key)
        ? prev.filter((id) => id !== key)
        : [...prev, key]
    );
  };

  const selectedItemId = getItemKey(selectedItem);
  const isSelectedFavorite = selectedItemId ? favoriteItemIds.includes(selectedItemId) : false;

  return (
    <AppLayout version={__APP_VERSION__}>
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        spacing={{ base: 6, xl: 8 }}
        align="flex-start"
      >
        <Box flex={{ base: 'none', xl: '0 0 360px' }} w="100%">
          <ItemSearch
            onSelectItem={setSelectedItem}
            selectedItemId={selectedItemId}
            favoriteItemIds={favoriteItemIds}
            onToggleFavorite={toggleFavorite}
          />
        </Box>

        <Box flex="1" w="100%">
          {selectedItem ? (
            <ItemDetail
              item={selectedItem}
              onBack={() => setSelectedItem(null)}
              isFavorite={isSelectedFavorite}
              onToggleFavorite={toggleFavorite}
            />
          ) : (
            <EmptyDetailState />
          )}
        </Box>
      </Stack>
    </AppLayout>
  );
}

const EmptyDetailState = () => (
  <Center
    h="100%"
    minH="320px"
    border="1px dashed"
    borderColor="gray.700"
    borderRadius="md"
    bg="gray.800"
  >
    <Stack spacing={3} align="center" px={6} textAlign="center">
      <Icon as={SearchIcon} boxSize={6} color="brand.300" />
      <Text fontSize="md" color="gray.200" fontWeight="semibold">
        Select an item to inspect details
      </Text>
      <Text fontSize="sm" color="gray.500">
        Choose an augmentable item from the list on the left to see stats, recipes, and planner tools.
      </Text>
    </Stack>
  </Center>
);
