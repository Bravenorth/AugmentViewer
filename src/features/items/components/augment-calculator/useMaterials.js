import { useEffect, useMemo, useRef, useState } from "react";
import getItemKey from "../../utils/getItemKey";

const mapMaterials = (entries) =>
  entries.map(([name, qty]) => ({
    id: crypto.randomUUID(),
    name,
    qty,
  }));

export default function useMaterials(item, defaultMaterials = {}) {
  const [materials, setMaterials] = useState([]);
  const [newMaterialName, setNewMaterialName] = useState("");
  const itemKeyRef = useRef(null);
  const defaultSnapshotRef = useRef("");

  useEffect(() => {
    const key = getItemKey(item) ?? "unknown-item";
    const entries = Object.entries(defaultMaterials);
    const serializedDefaults = JSON.stringify(entries);
    let shouldClearDraftName = false;

    setMaterials((prev) => {
      const isSameItem = itemKeyRef.current === key;
      const defaultsChanged = defaultSnapshotRef.current !== serializedDefaults;
      const shouldHydrate = !isSameItem || defaultsChanged || prev.length === 0;

      if (!shouldHydrate) {
        return prev;
      }

      itemKeyRef.current = key;
      defaultSnapshotRef.current = serializedDefaults;
      shouldClearDraftName = !isSameItem || defaultsChanged;
      return mapMaterials(entries);
    });

    if (shouldClearDraftName) {
      setNewMaterialName("");
    }
  }, [defaultMaterials, item]);

  const updateMaterialQty = (id, value) => {
    setMaterials((prev) =>
      prev.map((mat) => {
        if (mat.id !== id) return mat;
        const numeric = Number(value);
        const safeQty = Number.isFinite(numeric) ? Math.max(numeric, 0) : 0;
        return { ...mat, qty: safeQty };
      })
    );
  };

  const renameMaterial = (id, newName) => {
    setMaterials((prev) =>
      prev.map((mat) => (mat.id === id ? { ...mat, name: newName } : mat))
    );
  };

  const removeMaterial = (id) => {
    setMaterials((prev) => prev.filter((mat) => mat.id !== id));
  };

  const addMaterial = () => {
    const name = newMaterialName.trim();
    if (
      !name ||
      materials.some((m) => m.name.toLowerCase() === name.toLowerCase())
    ) {
      return;
    }

    setMaterials((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name, qty: 0 },
    ]);
    setNewMaterialName("");
  };

  const resetMaterialsToDefault = () => {
    const entries = Object.entries(defaultMaterials);
    const serializedDefaults = JSON.stringify(entries);
    itemKeyRef.current = getItemKey(item) ?? "unknown-item";
    defaultSnapshotRef.current = serializedDefaults;
    setMaterials(mapMaterials(entries));
    setNewMaterialName("");
  };

  const materialColumns = useMemo(() => {
    const seen = new Set();
    return materials
      .map((mat) => mat.name?.trim())
      .filter((name) => {
        if (!name || seen.has(name)) return false;
        seen.add(name);
        return true;
      });
  }, [materials]);

  return {
    materials,
    newMaterialName,
    setNewMaterialName,
    updateMaterialQty,
    renameMaterial,
    removeMaterial,
    addMaterial,
    resetMaterialsToDefault,
    materialColumns,
  };
}
