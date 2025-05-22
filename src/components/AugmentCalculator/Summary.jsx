import React, { useMemo } from "react";
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
  prices,
}) {
  const coin = "🪙";

  const estCost = useMemo(
    () =>
      Object.entries(totalMaterials).reduce(
        (sum, [mat, qty]) => sum + Math.round(qty) * (prices?.[mat] || 0),
        0
      ),
    [totalMaterials, prices]
  );

  const maxCost = useMemo(
    () =>
      Object.entries(maxMaterials).reduce(
        (sum, [mat, qty]) => sum + Math.round(qty) * (prices?.[mat] || 0),
        0
      ),
    [maxMaterials, prices]
  );

  const displayLine = Object.entries(maxMaterials).map(([mat, maxQty]) => {
    const estQty = Math.round(totalMaterials[mat] || 0);
    const maxQtyInt = Math.round(maxQty);
    const price = prices?.[mat] || 0;
    const estGold = estQty * price;
    const maxGold = maxQtyInt * price;

    return {
      label: mat,
      estQty,
      maxQty: maxQtyInt,
      estGold,
      maxGold,
    };
  });

  return (
    <Box mt={6}>
      <Heading size="xs" color="gray.300" mb={2}>
        Summary
      </Heading>
      <VStack align="start" spacing={1}>
        {displayLine.map(({ label, estQty, maxQty, estGold, maxGold }) => (
          <Text key={label} fontSize="sm" color="gray.400">
            {label}: {estQty} (Estimated) / {maxQty} (Max) —{" "}
            {estGold.toLocaleString()} {coin} (estimated) /{" "}
            {maxGold.toLocaleString()} {coin} (max)
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
          Estimated total Cost: {estCost.toLocaleString()} {coin}
        </Text>
        <Text fontSize="xs" color="gray.500">
          (Maximum possible cost: {maxCost.toLocaleString()} {coin})
        </Text>
      </VStack>
    </Box>
  );
}
