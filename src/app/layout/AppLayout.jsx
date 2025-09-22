import { Box } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";

export default function AppLayout({ version, children }) {
  return (
    <Box
      minH="100vh"
      bg="gray.900"
      color="gray.100"
      display="flex"
      flexDirection="column"
    >
      <Header version={version} />
      <Box as="main" flex="1" py={6} px={{ base: 4, md: 10 }}>
        {children}
      </Box>
      <Footer version={version} />
    </Box>
  );
}
