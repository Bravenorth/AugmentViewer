/// <reference types="vite/client" />

import { Box, Center, Icon, Stack, Text } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useState } from "react";
import AppLayout from "./layout/AppLayout";
import { ItemSearch, ItemDetail } from "../features/items";

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

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  const selectedItemId = selectedItem?.id ?? selectedItem?.key ?? null;

  return (
    <AppLayout version={__APP_VERSION__}>
      <Stack
        direction={{ base: 'column', xl: 'row' }}
        spacing={{ base: 6, xl: 8 }}
        align="flex-start"
      >
        <Box flex={{ base: 'none', xl: '0 0 360px' }} w="100%">
          <ItemSearch onSelectItem={setSelectedItem} selectedItemId={selectedItemId} />
        </Box>

        <Box flex="1" w="100%">
          {selectedItem ? (
            <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
          ) : (
            <EmptyDetailState />
          )}
        </Box>
      </Stack>
    </AppLayout>
  );
}
