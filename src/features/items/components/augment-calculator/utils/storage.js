export const CONFIG_STORAGE_KEY = "augment-configuration-store-v1";
export const GLOBAL_PREFERENCES_KEY = "__globals";

export const resolveLegacyConfig = (entry) => {
  if (!entry || typeof entry !== "object") return null;
  if (Array.isArray(entry)) return null;

  if (
    "startLevel" in entry ||
    "targetLevel" in entry ||
    "counterTime" in entry
  ) {
    return entry;
  }

  if (Array.isArray(entry.presets)) {
    const { presets, lastSelectedId } = entry;
    const preferred =
      presets.find((preset) => preset.id === lastSelectedId) ?? presets[0];
    if (preferred && typeof preferred === "object") {
      return preferred.config ?? null;
    }
  }

  return null;
};

export const readConfigStore = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = window.localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!stored) return {};
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    console.error("Failed to read configuration store", error);
    return {};
  }
};

export const writeConfigStore = (store) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error("Failed to persist configuration store", error);
  }
};

export const sanitizeGlobalPreferences = (prefs = {}, defaults, clampFn) => {
  const merged = { ...defaults, ...prefs };
  return {
    criticalChance: clampFn(merged.criticalChance, 0, 100),
    quickStudyLevel: clampFn(merged.quickStudyLevel, 0, 20),
  };
};
