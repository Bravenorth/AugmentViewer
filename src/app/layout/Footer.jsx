import { Box, Flex, Link, Text } from "@chakra-ui/react";
import VersionBadge from "../../shared/components/VersionBadge";

export default function Footer({ version }) {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      as="footer"
      py={3}
      px={{ base: 4, md: 6 }}
      bg="gray.800"
      borderTop="1px solid"
      borderColor="gray.700"
      position="sticky"
      bottom={0}
      zIndex={10}
    >
      <Box maxW="1920px" mx="auto" w="100%">
        <Flex
          direction={{ base: 'column', sm: 'row' }}
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={2}
          fontSize="sm"
          color="gray.400"
        >
          <Text textAlign={{ base: 'center', sm: 'left' }}>
            &copy; {currentYear}{' '}
            <Link
              href="https://discordapp.com/users/134398029317799936"
              isExternal
              color="brand.300"
              fontWeight="medium"
            >
              Bravenorth
            </Link>{' '}– Fan-made, unofficial project.
          </Text>

          <Flex gap={4} align="center" wrap="wrap" justify="center">
            <Text color="gray.500">No account?</Text>
            <Link href="https://idlescape.com" isExternal color="brand.300" fontWeight="medium">
              Play Idlescape
            </Link>
            <Text color="gray.500">Useful link:</Text>
            <Link href="https://wiki.idlescape.com" isExternal color="brand.300" fontWeight="medium">
              Official Wiki
            </Link>
            <Link href="https://discord.gg/VQT4SEBUMk" isExternal color="brand.300" fontWeight="medium">
              Official Discord
            </Link>
            <VersionBadge version={version} />
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
}
