import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // Needed so /api/messages can run on the server (the page itself stays static)
  adapter: vercel(),
  server: {
    // Allow requests from any host (e.g. ngrok tunnels)
    allowedHosts: true,
  },
});
