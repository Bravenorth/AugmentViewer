/// <reference types="vite/client" />

import {
  Box,
  Text,
  Link,
  Heading,
  Flex,
} from "@chakra-ui/react";
import { useState } from "react";
import ItemSearch from "./components/ItemSearch";
import ItemDetail from "./components/ItemDetail";
import VersionBadge from "./components/common/VersionBadge";

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <style>
        {`
          select, option {
            background-color: #2d3748 !important;
            color: #edf2f7 !important;
          }
        `}
      </style>

      <Box
        minH="100vh"
        bg="gray.900"
        color="gray.100"
        display="flex"
        flexDirection="column"
      >
        <Box
          as="header"
          py={4}
          px={{ base: 4, md: 10 }}
          bg="gray.800"
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          <Flex justify="space-between" align="center" wrap="wrap" gap={2}>
            <Heading as="h1" size="md">
              Idlescape Augment Viewer
            </Heading>
            <VersionBadge version={__APP_VERSION__} />
          </Flex>
          <Text fontSize="sm" color="gray.400" mt={1}>
            Some data are missing, use at your own risk.
          </Text>
        </Box>

        <Box as="main" flex="1" py={6} px={{ base: 4, md: 10 }}>
          {!selectedItem ? (
            <ItemSearch onSelectItem={setSelectedItem} />
          ) : (
            <ItemDetail
              item={selectedItem}
              onBack={() => setSelectedItem(null)}
            />
          )}
        </Box>

        <Box
          as="footer"
          py={3}
          px={{ base: 4, md: 10 }}
          bg="gray.800"
          borderTop="1px solid"
          borderColor="gray.700"
          position="sticky"
          bottom={0}
          zIndex={10}
        >
          <Flex
            direction={{ base: "column", sm: "row" }}
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={2}
            fontSize="sm"
            color="gray.400"
          >
            <Text textAlign={{ base: "center", sm: "left" }}>
              &copy; {new Date().getFullYear()} {" "}
              <Link
                href="https://discordapp.com/users/134398029317799936"
                isExternal
                color="teal.300"
                fontWeight="medium"
              >
                Bravenorth
              </Link>{" "}
              - Fan-made, unofficial project.
            </Text>

            <Flex gap={4} align="center" wrap="wrap" justify="center">
              <Text color="gray.500">No account?</Text>
              <Link
                href="https://idlescape.com"
                isExternal
                color="teal.300"
                fontWeight="medium"
              >
                Play Idlescape
              </Link>
              <Text color="gray.500">Useful link:</Text>
              <Link
                href="https://wiki.idlescape.com"
                isExternal
                color="teal.300"
                fontWeight="medium"
              >
                Official Wiki
              </Link>
              <Link
                href="https://discord.gg/VQT4SEBUMk"
                isExternal
                color="teal.300"
                fontWeight="medium"
              >
                Official Discord
              </Link>
              <VersionBadge version={__APP_VERSION__} />
            </Flex>
          </Flex>
        </Box>
      </Box>
    </>
  );
}


