import { Box, Text, Table, Tbody, Tr, Td, Grid } from "@chakra-ui/react";
import PropTypes from "prop-types";

const formatStat = (value, suffix = "") => {
  const val = typeof value === "number" ? value : 0;
  const color = val > 0 ? "green.300" : val < 0 ? "red.300" : "gray.400";
  const sign = val > 0 ? "+" : "";
  return (
    <Text as="span" color={color}>
      {sign}{val}{suffix}
    </Text>
  );
};

const StatGroup = ({ label, data, suffix = "", transform }) => {
  if (!data || typeof data !== "object") return null;

  const entries = Object.entries(data)
    .map(([key, val]) => {
      const v = transform ? transform(val, key) : val;
      const isZero =
        v == null ||
        (typeof v === "number" && Math.abs(v) < 0.0001) ||
        (typeof v === "string" && v.trim() === "0");
      return isZero ? null : [key, v];
    })
    .filter(Boolean);

  if (entries.length === 0) return null;

  return (
    <Box mb={1}>
      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={0}>
        {label}
      </Text>
      <Table size="sm" variant="unstyled">
        <Tbody>
          {entries.map(([key, val]) => (
            <Tr key={key}>
              <Td pl={0} pr={1} color="gray.500" fontSize="xs">
                {key}
              </Td>
              <Td pr={0} isNumeric fontSize="xs">
                {formatStat(val, suffix)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

StatGroup.propTypes = {
  label: PropTypes.string.isRequired,
  data: PropTypes.object,
  suffix: PropTypes.string,
  transform: PropTypes.func,
};

const AttackSpeed = ({ value }) => {
  if (value == null) return null;
  return (
    <Box mb={1}>
      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={0}>
        Attack Speed
      </Text>
      <Text fontSize="xs" color="gray.100">
        {value}
      </Text>
    </Box>
  );
};

AttackSpeed.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const AugmentationBonus = ({ bonuses }) => {
  const items = Array.isArray(bonuses)
    ? bonuses.filter((a) => a.value !== 0)
    : [];
  if (items.length === 0) return null;

  return (
    <Box mb={1}>
      <Text fontSize="xs" fontWeight="bold" color="gray.400" mb={0}>
        Augmentation Bonus
      </Text>
      <Table size="sm" variant="unstyled">
        <Tbody>
          {items.map(({ stat, value }, i) => (
            <Tr key={i}>
              <Td pl={0} pr={1} color="gray.500" fontSize="xs">
                {stat}
              </Td>
              <Td pr={0} isNumeric fontSize="xs">
                {formatStat(value)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

AugmentationBonus.propTypes = {
  bonuses: PropTypes.arrayOf(
    PropTypes.shape({
      stat: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
};

export default function ItemStatTooltip({ item }) {
  const stats = item.equipmentStats || {};
  const req = { Requires: item.requiredLevel || {} };

  return (
    <Box
      bg="gray.800"
      border="1px solid"
      borderColor="gray.700"
      borderRadius="md"
      p={3}
    >
      <Grid
        templateAreas={`
          "core offensive"
          "defensive offensive"
          "augment augment"
        `}
        gridTemplateColumns="repeat(2, minmax(0, 1fr))"
        columnGap={4}
        rowGap={2}
      >
        <Box gridArea="core">
          <StatGroup label="Requires" data={req.Requires} />
          <AttackSpeed value={stats.attackSpeed} />
        </Box>

        <Box gridArea="offensive">
          <StatGroup label="Offensive Stats" data={stats.weaponBonus} />
          <StatGroup
            label="Crit Stats"
            data={stats.offensiveCritical}
            transform={(v, key) =>
              key === "chance"
                ? parseFloat((v * 100).toFixed(1))
                : parseFloat(v.toFixed(2))
            }
            suffix="%"
          />
          <StatGroup
            label="Offensive Accuracies"
            data={stats.offensiveAccuracyAffinityRating}
          />
          <StatGroup
            label="Offensive Affinities"
            data={stats.offensiveDamageAffinity}
            transform={(v) => parseFloat(((v - 1) * 100).toFixed(1))}
            suffix="%"
          />
        </Box>

        <Box gridArea="defensive">
          <StatGroup label="Defensive Stats" data={stats.armorBonus} />
          <StatGroup
            label="Hit Multipliers"
            data={stats.hitMults}
            transform={(v, key) => {
              if (key === "minimum")
                return parseFloat(((v - 0.25) * 100).toFixed(1));
              if (key === "maximum")
                return parseFloat(((v - 1.0) * 100).toFixed(1));
              return v;
            }}
            suffix="%"
          />
        </Box>

        <Box gridArea="augment">
          <AugmentationBonus bonuses={stats.augmentationBonus} />
        </Box>
      </Grid>
    </Box>
  );
}

ItemStatTooltip.propTypes = {
  item: PropTypes.shape({
    equipmentStats: PropTypes.object,
    requiredLevel: PropTypes.object,
  }).isRequired,
};
