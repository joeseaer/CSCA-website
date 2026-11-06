import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://joeseaer.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1', port: 4321 },
});
