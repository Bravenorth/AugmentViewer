import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

export default function LevelTable({ breakdown, materialColumns }) {
  return (
    <Table size="sm" variant="simple">
      <Thead>
        <Tr>
          <Th color="gray.300">Level</Th>
          <Th color="gray.300">Counters</Th>
          <Th color="gray.300">Copies</Th>
          {materialColumns.map((mat) => (
            <Th key={mat} color="gray.300">{mat}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {breakdown.map((row) => (
          <Tr key={row.level}>
            <Td color="gray.400">+{row.level}</Td>
            <Td color="gray.400">{row.countersRequired}</Td>
            <Td color="gray.400">{row.copiesRequired}</Td>
            {materialColumns.map((mat) => (
              <Td key={mat} color="gray.400">
                {Math.round(row.materials[mat] || 0)}
              </Td>
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}
