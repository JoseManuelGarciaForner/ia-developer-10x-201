import { defineConfig } from 'vite';

// El editor es un microfrontend: el backoffice lo sirve bajo /mfe/editor/ (proxy)
// y lo embebe en un iframe. Hablan por postMessage (ver src/protocol.ts).
export default defineConfig({
  base: '/mfe/editor/',
  server: {
    port: 5175,
    strictPort: true,
    host: true,
    allowedHosts: true,
    hmr: process.env.CODESPACE_NAME ? { clientPort: 443 } : undefined,
  },
});
