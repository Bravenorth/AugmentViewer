import { Box } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ version, children }) {
  return (
    <Box minH="100vh" bg="gray.900" color="gray.100" display="flex" flexDirection="column">
      <Header version={version} />
      <Box as="main" flex="1" py={{ base: 6, md: 8 }} px={{ base: 4, md: 6 }}>
        <Box maxW="1200px" mx="auto" w="100%">
          {children}
        </Box>
      </Box>
      <Footer version={version} />
    </Box>
  );
}
