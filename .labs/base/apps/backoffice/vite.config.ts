import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const api = process.env.API_URL ?? 'http://localhost:3000';
const editor = process.env.EDITOR_MFE_URL ?? 'http://localhost:5175';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
    host: true,
    allowedHosts: true,
    hmr: process.env.CODESPACE_NAME ? { clientPort: 443 } : undefined,
    proxy: {
      '/api': api,
      // El microfrontend del editor se sirve en el mismo origen que el backoffice
      '/mfe/editor': { target: editor, ws: true },
    },
  },
});
