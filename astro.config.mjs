import { defineConfig } from 'astro/config';

export default defineConfig({
  server: {
    // Allow requests from any host (e.g. ngrok tunnels)
    allowedHosts: true,
  },
});
