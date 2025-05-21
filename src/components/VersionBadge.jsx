import { Badge } from "@chakra-ui/react";
import PropTypes from "prop-types";

export default function VersionBadge({ version }) {
  const label = version?.toLowerCase() || "";

  let colorScheme = "gray";
  if (label.includes("alpha")) colorScheme = "orange";
  else if (label.includes("beta")) colorScheme = "red";
  else if (/^v?[\d.]+$/.test(label)) colorScheme = "green"; // pure version → stable

  return (
    <Badge
      colorScheme={colorScheme}
      fontSize="xs"
      px={2}
      py={0.5}
      borderRadius="md"
      fontFamily="monospace"
    >
      v{version}
    </Badge>
  );
}

VersionBadge.propTypes = {
  version: PropTypes.string.isRequired,
};
