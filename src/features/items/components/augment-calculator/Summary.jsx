import { Box, Heading, Text, VStack } from "@chakra-ui/react";

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
};

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
    <Box mt={6}>
      <Heading size="xs" color="gray.300" mb={2}>
        Summary
      </Heading>
      <VStack align="start" spacing={1}>
        {materialLines.map(({ label, estimated, maximum }) => (
          <Text key={label} fontSize="sm" color="gray.400">
            {label}: {estimated} (estimated) / {maximum} (max)
          </Text>
        ))}

        {totalCopies > 0 && (
          <Text fontSize="sm" color="gray.400">
            {totalCopies} base item copies
          </Text>
        )}

        {totalTimeSeconds > 0 && (
          <Text fontSize="sm" color="gray.400">
            Estimated Time: {formatDuration(totalTimeSeconds)}
          </Text>
        )}
      </VStack>
    </Box>
  );
}
