import { AttachmentIcon, RepeatIcon, TimeIcon } from "@chakra-ui/icons";
import { Box, Divider, Heading, HStack, Stack, Text, VStack } from "@chakra-ui/react";

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const formatNumber = (value) => new Intl.NumberFormat().format(value);

export default function Summary({
  totalMaterials,
  maxMaterials,
  totalCopies,
  totalTimeSeconds,
}) {
  const materialLines = Object.entries(maxMaterials).map(([mat, maxQty]) => {
    const estimated = Math.round(totalMaterials[mat] || 0);
    const maximum = Math.round(maxQty);

    return {
      label: mat,
      estimated,
      maximum,
    };
  });

  return (
    <Stack spacing={4}>
      <Box>
        <Heading size="xs" color="gray.200" mb={2} textTransform="uppercase" letterSpacing="wide">
          Materials overview
        </Heading>
        <VStack align="stretch" spacing={2}>
          {materialLines.length === 0 ? (
            <Text fontSize="sm" color="gray.500">
              No materials configured.
            </Text>
          ) : (
            materialLines.map(({ label, estimated, maximum }) => (
              <HStack key={label} spacing={3} align="center">
                <AttachmentIcon color="brand.300" boxSize={4} />
                <Text fontSize="sm" color="gray.300">
                  <Text as="span" fontWeight="medium" color="gray.100">
                    {label}
                  </Text>
                  : {formatNumber(estimated)} estimated / {formatNumber(maximum)} max
                </Text>
              </HStack>
            ))
          )}
        </VStack>
      </Box>

      <Divider borderColor="gray.700" />

      <VStack align="stretch" spacing={2}>
        {totalTimeSeconds > 0 && (
          <HStack spacing={3}>
            <TimeIcon color="brand.300" boxSize={4} />
            <Text fontSize="sm" color="gray.300">
              Estimated time: {formatDuration(totalTimeSeconds)}
            </Text>
          </HStack>
        )}

        {totalCopies > 0 && (
          <HStack spacing={3}>
            <RepeatIcon color="brand.300" boxSize={4} />
            <Text fontSize="sm" color="gray.300">
              Base item copies required: {formatNumber(totalCopies)}
            </Text>
          </HStack>
        )}
      </VStack>
    </Stack>
  );
}
