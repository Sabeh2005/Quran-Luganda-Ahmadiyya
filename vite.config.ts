import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      includeAssets: ['favicon.ico', 'apple-icon-180.png', 'app-icon-192.maskable.png', 'app-icon-512.maskable.png'],
      manifest: {
        name: 'Quran Luganda Ahmadiyya',
        short_name: 'Quran Luganda',
        description: 'The Holy Quran in Luganda and English',
        lang: 'en',
        dir: 'ltr',
        theme_color: '#000000',
        background_color: '#ffffff',
        orientation: 'any',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [

          {
            src: '/app-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/apple-icon-180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Ensure older precaches are cleaned up and updates take control quickly
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        // Allow larger files (3MB) to be precached - needed for Arabic JSON data
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@tanstack/react-query'],
  },
}));
