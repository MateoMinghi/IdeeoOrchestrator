import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';

export default defineConfig({
  envFile: false,
  plugins: [react(),tailwind()],
  resolve: {alias: {'@':fileURLToPath(new URL('./src',import.meta.url))}},
  build: {outDir:'dist/ideeo',rollupOptions:{input:fileURLToPath(new URL('./ideeo.html',import.meta.url))}},
});
