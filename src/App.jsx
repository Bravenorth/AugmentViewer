// src/App.jsx
import {
  Box,
  Text,
  Link,
  VStack,
  Heading,
  Container,
  Flex,
  Button,
} from "@chakra-ui/react";
import { useState } from "react";
import ItemSearch from "./components/ItemSearch";
import ItemDetail from "./components/ItemDetail";

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      {/* Global styles patch for selector ... chakra bug? to fix later */}
      <style>
        {`
          select, option {
            background-color: #2d3748 !important; /* gray.800 */
            color: #edf2f7 !important;            /* gray.100 */
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
        {/* Header */}
        <Box
          as="header"
          py={4}
          bg="gray.800"
          borderBottom="1px solid"
          borderColor="gray.700"
        >
          <Container maxW="1000px">
            <Heading as="h1" size="md">
              Idlescape Augment Viewer
            </Heading>
            <Text fontSize="sm" color="red.400">
              Beta 1.0.0 | Some data are missing, use at your own risk.
              <br />
            </Text>
          </Container>
        </Box>

        {/* Main Content */}
        <Box as="main" flex="1" py={6}>
          <Container maxW="1000px">
            {!selectedItem ? (
              <ItemSearch onSelectItem={setSelectedItem} />
            ) : (
              <ItemDetail
                item={selectedItem}
                onBack={() => setSelectedItem(null)}
              />
            )}
          </Container>
        </Box>

        {/* Footer */}
        <Box
          as="footer"
          py={3}
          bg="gray.800"
          borderTop="1px solid"
          borderColor="gray.700"
          position="sticky"
          bottom={0}
          zIndex={10}
        >
          <Container maxW="1000px">
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
                &copy; {new Date().getFullYear()}{" "}
                <Link
                  href="https://discordapp.com/users/134398029317799936"
                  isExternal
                  color="teal.300"
                  fontWeight="medium"
                >
                  Bravenorth
                </Link>{" "}
                – Fan-made, unofficial project.
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
              </Flex>
            </Flex>
          </Container>
        </Box>
      </Box>
    </>
  );
}
