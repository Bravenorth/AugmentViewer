// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'fs';

// ⬇️ Récupération dynamique de la version du package.json
const { version } = JSON.parse(readFileSync('./package.json', 'utf-8'));

export default defineConfig({
  plugins: [react()],
  base: '/Augment/',
  define: {
    __APP_VERSION__: JSON.stringify(version), // ⬅️ Variable globale disponible dans ton app
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://play.idlescape.com',
        changeOrigin: true,
      },
    },
  },
});
