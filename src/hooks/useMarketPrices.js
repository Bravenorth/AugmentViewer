import { useEffect, useState } from "react";
import staticManifest from "../data/manifest.json";

export default function useMarketPrices() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    let isMounted = true;

    const processManifest = (manifest) => {
      const priceMap = {};
      for (const item of manifest) {
        if (item.league === 1 && item.name && item.minPrice != null) {
          priceMap[item.name] = item.minPrice;
        }
      }
      if (isMounted) setPrices(priceMap);
    };

    const isDev = import.meta.env.MODE === "development";

    if (isDev) {
      fetch("/api/market/manifest")
        .then((res) => {
          if (!res.ok) throw new Error("Erreur de réponse API");
          return res.json();
        })
        .then((data) => {
          const manifest = data.manifest || data;
          processManifest(manifest);
        })
        .catch((err) => {
          console.error("Erreur lors du chargement des prix :", err);
        });
    } else {
      // En production : static import
      processManifest(staticManifest.manifest || staticManifest);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return prices;
}
