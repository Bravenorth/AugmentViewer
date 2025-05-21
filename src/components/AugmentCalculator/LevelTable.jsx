
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

export default function LevelTable({ levels, startLevel, materials, startProgress }) {
  const materialKeys = Object.keys(materials);

  return (
    <Table size="sm" variant="simple">
      <Thead>
        <Tr>
          <Th color="gray.300">Level</Th>
          <Th color="gray.300">Counters</Th>
          <Th color="gray.300">Copies</Th>
          {materialKeys.map((mat) => (
            <Th key={mat} color="gray.300">{mat}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {levels.map((lvl, idx) => {
          const lvlIdx = startLevel + idx + 1;
          const counters = idx === 0 ? Math.max(lvl.counter - startProgress, 0) : lvl.counter;

          return (
            <Tr key={lvlIdx}>
              <Td color="gray.400">+{lvlIdx}</Td>
              <Td color="gray.400">{counters}</Td>
              <Td color="gray.400">{lvl.copies}</Td>
              {materialKeys.map((mat) => (
                <Td key={mat} color="gray.400">
                  {counters * (materials[mat] || 0)}
                </Td>
              ))}
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}
