import { useEffect, useMemo, useRef, useState } from "react";
import getItemKey from "../../../utils/getItemKey";
import { mapMaterials } from "../utils/materials";

export default function useMaterials(item, defaultMaterials = {}) {
  const [materials, setMaterials] = useState([]);
  const [newMaterialName, setNewMaterialName] = useState("");
  const itemKeyRef = useRef(null);
  const defaultSnapshotRef = useRef("");

  const defaultEntries = useMemo(
    () => Object.entries(defaultMaterials),
    [defaultMaterials]
  );
  const serializedDefaults = useMemo(
    () => JSON.stringify(defaultEntries),
    [defaultEntries]
  );

  useEffect(() => {
    const key = getItemKey(item) ?? "unknown-item";
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
      return mapMaterials(defaultEntries);
    });

    if (shouldClearDraftName) {
      setNewMaterialName("");
    }
  }, [defaultEntries, item, serializedDefaults]);

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
    const key = getItemKey(item) ?? "unknown-item";
    itemKeyRef.current = key;
    defaultSnapshotRef.current = serializedDefaults;
    setMaterials(mapMaterials(defaultEntries));
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
