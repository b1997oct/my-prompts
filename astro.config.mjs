// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [
      tailwindcss()
    ],
  },

  server: {
    port: 3000
  },

  output: "server",

  devToolbar: {
    enabled: false
  },

  adapter: vercel(),

  security: {
    checkOrigin: false
  }
});