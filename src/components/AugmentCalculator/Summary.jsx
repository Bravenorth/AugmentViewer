
import { Box, Heading, Text, VStack } from "@chakra-ui/react";
import { useMemo } from "react";

const formatDuration = (totalSeconds) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h ${m}m ${s}s`;
};

export default function Summary({ totalMaterials, totalCopies, totalTimeSeconds, prices }) {
  const estCost = useMemo(
    () =>
      Object.entries(totalMaterials).reduce(
        (sum, [mat, qty]) => sum + qty * (prices?.[mat] || 0),
        0
      ),
    [totalMaterials, prices]
  );

  return (
    <Box mt={6}>
      <Heading size="xs" color="gray.300" mb={2}>Summary</Heading>
      <VStack align="start" spacing={1}>
        {Object.entries(totalMaterials).map(([mat, qty]) => (
          <Text key={mat} fontSize="sm" color="gray.400">
            {qty} × {mat}
            {prices?.[mat] ? ` (${(prices[mat] * qty).toLocaleString()} Gold)` : ""}
          </Text>
        ))}

        {totalCopies > 0 && (
          <Text fontSize="sm" color="gray.400">
            {totalCopies} × base item copies
          </Text>
        )}

        {totalTimeSeconds > 0 && (
          <Text fontSize="sm" color="gray.400">
            Estimated Time: {formatDuration(totalTimeSeconds)}
          </Text>
        )}

        <Text pt={2} fontWeight="bold" color="teal.300">
          Estimated Cost: {estCost.toLocaleString()} Gold
        </Text>
      </VStack>
    </Box>
  );
}
