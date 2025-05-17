// src/hooks/useMarketPrices.js
import { useEffect, useState } from "react";

export default function useMarketPrices() {
  const [prices, setPrices] = useState({});

  const API_BASE_URL =
    import.meta.env.MODE === "development"
      ? "/api"
      : "https://play.idlescape.com"; // <-- correction ici

  useEffect(() => {
    let isMounted = true;

    fetch(`${API_BASE_URL}/api/market/manifest`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de réponse API");
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        const priceMap = {};

        for (const item of data.manifest) {
          if (item.league === 1 && item.name && item.minPrice != null) {
            priceMap[item.name] = item.minPrice;
          }
        }

        setPrices(priceMap);
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
