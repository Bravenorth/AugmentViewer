import { useEffect, useState } from "react";

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

    const fetchUrl = isDev
      ? "/api/market/manifest"
      : "/data/manifest.json";

    fetch(fetchUrl)
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

    return () => {
      isMounted = false;
    };
  }, []);

  return prices;
}
