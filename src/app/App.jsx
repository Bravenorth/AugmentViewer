/// <reference types="vite/client" />

import { useState } from "react";
import AppLayout from "./layout/AppLayout";
import { ItemSearch, ItemDetail } from "../features/items";

const selectStyle = `
  select, option {
    background-color: #2d3748 !important;
    color: #edf2f7 !important;
  }
`;

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <style>{selectStyle}</style>

      <AppLayout version={__APP_VERSION__}>
        {!selectedItem ? (
          <ItemSearch onSelectItem={setSelectedItem} />
        ) : (
          <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} />
        )}
      </AppLayout>
    </>
  );
}
