// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://play.idlescape.com',
        changeOrigin: true,
        // ✅ ne PAS faire de rewrite ici
      },
    },
  },
});
