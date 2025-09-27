import {
  Box,
  Flex,
  Table,
  Tbody,
  Tr,
  Td,
  Text,
  chakra,
} from "@chakra-ui/react";
import PropTypes from "prop-types";


const STYLES = {
  wrapper: {
    bg: "gray.800",
    border: "1px solid",
    borderColor: "gray.700",
    borderRadius: "md",
    p: 3,
    maxW: "100%",
    overflowX: "auto",
  },
  statBlock: {
    minW: "260px",
    flex: "1 1 260px",
  },
  sectionTitle: {
    fontSize: "xs",
    fontWeight: "bold",
    color: "gray.400",
    mb: 1,
    whiteSpace: "nowrap",
  },
  tableStyle: {
    w: "100%",
    tableLayout: "fixed",
  },
  labelCell: {
    w: "50%",
    pr: 2,
    color: "gray.500",
    fontSize: "xs",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    p: 0.5,
  },
  valueCell: {
    w: "50%",
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    textAlign: "right",
    fontSize: "xs",
    fontWeight: "bold",
    fontFamily: "monospace",
    whiteSpace: "nowrap",
    p: 0.5,
  },
};


function flattenStatsObject(stats) {
  return Object.entries(stats || {}).reduce((flat, [key, value]) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(flat, value);
    } else {
      flat[key] = value;
    }
    return flat;
  }, {});
}

const ColoredValue = chakra(Text, {
  baseStyle: ({ value }) => ({
    color: value > 0 ? "green.300" : value < 0 ? "red.300" : "gray.400",
    textAlign: "right",
    as: "span",
  }),
});

function formatStatValue(value, suffix = "", opts = {}) {
  const { forceSign = true } = opts;
  if (typeof value === "number") {
    return (
      <ColoredValue value={value}>
        {forceSign && value > 0 && "+"}
        {value}
        {suffix}
      </ColoredValue>
    );
  }
  return <Text as="span">{String(value)}</Text>;
}

function prepareTableRows(stats, transformFn, opts) {
  return Object.entries(flattenStatsObject(stats))
    .map(([label, rawValue]) => {
      const value = transformFn ? transformFn(rawValue, label) : rawValue;
      const isEmpty =
        value == null ||
        (typeof value === "number" && Math.abs(value) < 0.0001) ||
        value === "0";
      return isEmpty ? null : [label, value, opts];
    })
    .filter(Boolean);
}


function StatSection({ title, rows, suffix }) {
  if (!rows || rows.length === 0) return null;

  return (
    <Box sx={STYLES.statBlock}>
      <Text sx={STYLES.sectionTitle}>{title}</Text>
      <Table variant="unstyled" sx={STYLES.tableStyle}>
        <Tbody>
          {rows.map(([label, value, opts]) => (
            <Tr
              key={label}
              _hover={{
                bg: "gray.700",
              }}
            >
              <Td sx={STYLES.labelCell}>{label}</Td>
              <Td sx={STYLES.valueCell}>{formatStatValue(value, suffix, opts)}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}

StatSection.propTypes = {
  title: PropTypes.string.isRequired,
  rows: PropTypes.arrayOf(PropTypes.array).isRequired,
  suffix: PropTypes.string,
};


export default function ItemStatTooltip({ item }) {
  const stats = item.equipmentStats || {};

  const augmentationBonuses = (stats.augmentationBonus || []).reduce(
    (obj, { stat, value }) => {
      if (value) obj[stat] = value;
      return obj;
    },
    {}
  );

  const STAT_SECTIONS = [
    {
      title: "Requires",
      stats:
        typeof item.requiredLevel === "object"
          ? item.requiredLevel
          : { Level: item.requiredLevel },
      forceSign: false,
    },
    {
      title: "Attack Speed",
      stats: { "": stats.attackSpeed },
      suffix: "s",
      forceSign: false,
    },

    { title: "Offensive Stats", stats: stats.weaponBonus },
    {
      title: "Crit Stats",
      stats: stats.offensiveCritical,
      suffix: "%",
      transform: (v, k) =>
        k === "chance" ? +(v * 100).toFixed(1) : +v.toFixed(2),
    },
    {
      title: "Offensive Accuracies",
      stats: stats.offensiveAccuracyAffinityRating,
    },
    {
      title: "Offensive Affinities",
      stats: stats.offensiveDamageAffinity,
      suffix: "%",
      transform: (v) => +((v - 1) * 100).toFixed(1),
    },

    { title: "Defensive Stats", stats: stats.armorBonus },
    {
      title: "Hit Multipliers",
      stats: stats.hitMults,
      suffix: "%",
      transform: (v, k) =>
        k === "minimum"
          ? +((v - 0.25) * 100).toFixed(1)
          : k === "maximum"
          ? +((v - 1) * 100).toFixed(1)
          : v,
    },

    { title: "Augmentation Bonus", stats: augmentationBonuses },
  ];

  const preparedSections = STAT_SECTIONS
    .map((section) => ({
      ...section,
      rows: prepareTableRows(section.stats, section.transform, { forceSign: section.forceSign ?? true }),
    }))
    .filter((section) => section.rows.length > 0);

  if (preparedSections.length === 0) {
    return (
      <Box sx={STYLES.wrapper}>
        <Text fontSize="sm" color="gray.500">No detailed stats available for this item.</Text>
      </Box>
    );
  }

  return (
    <Box sx={STYLES.wrapper}>
      <Flex wrap="wrap" gap={3}>
        {preparedSections.map((section) => (
          <StatSection
            key={section.title}
            title={section.title}
            rows={section.rows}
            suffix={section.suffix}
          />
        ))}
      </Flex>
    </Box>
  );
}

ItemStatTooltip.propTypes = {
  item: PropTypes.shape({
    equipmentStats: PropTypes.object,
    requiredLevel: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  }).isRequired,
};

