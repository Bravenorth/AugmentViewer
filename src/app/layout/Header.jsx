import { Box, Flex, Heading, Text } from "@chakra-ui/react";
import VersionBadge from "../../shared/components/VersionBadge";

export default function Header({ version }) {
  return (
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
        <VersionBadge version={version} />
      </Flex>
      <Text fontSize="sm" color="gray.400" mt={1}>
        Some data are missing, use at your own risk.
      </Text>
    </Box>
  );
}
