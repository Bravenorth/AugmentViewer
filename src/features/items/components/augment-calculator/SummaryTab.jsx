import Summary from "./Summary";

export default function SummaryTab({
  totalMaterials,
  maxMaterials,
  totalCopies,
  totalTimeSeconds,
}) {
  return (
    <Summary
      totalMaterials={totalMaterials}
      maxMaterials={maxMaterials}
      totalCopies={totalCopies}
      totalTimeSeconds={totalTimeSeconds}
    />
  );
}
