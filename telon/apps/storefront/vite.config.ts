import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const api = process.env.API_URL ?? 'http://localhost:3000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Cada promotor entra por su dominio: entradas.salafaro.localhost, …
    allowedHosts: true,
    hmr: process.env.CODESPACE_NAME ? { clientPort: 443 } : undefined,
    proxy: { '/api': api },
  },
});
