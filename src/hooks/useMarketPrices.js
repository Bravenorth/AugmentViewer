// src/hooks/useMarketPrices.js
import { useEffect, useState } from "react";

export default function useMarketPrices() {
  const [prices, setPrices] = useState({});

  useEffect(() => {
    let isMounted = true;

    fetch("/api/market/manifest")
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        const priceMap = {};

        for (const item of data.manifest) {
          // ✅ On filtre explicitement pour league 1
          if (item.league === 1 && item.name && item.minPrice != null) {
            priceMap[item.name] = item.minPrice;
          }
        }

        setPrices(priceMap);
      })
      .catch((err) => console.error("Erreur lors du chargement des prix :", err));

    return () => {
      isMounted = false;
    };
  }, []);

  return prices;
}
