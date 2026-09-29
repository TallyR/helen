import { defineConfig } from 'astro/config';
import node from '@astrojs/node';

export default defineConfig({
  // Needed so /api/messages can run on the server (the page itself stays static)
  adapter: node({ mode: 'standalone' }),
  server: {
    // Allow requests from any host (e.g. ngrok tunnels)
    allowedHosts: true,
  },
});
