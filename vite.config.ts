import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // Manual registration to defer loading
      includeAssets: ['favicon.png', 'qr-logo-og.png'],
      manifest: {
        name: 'QRM - قائمة الطعام الإلكترونية',
        short_name: 'QRM',
        description: 'نظام قوائم الطعام الإلكترونية الذكي',
        theme_color: '#3baaff',
        background_color: '#0F172A',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/favicon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/zqlckixwpyrwdwrsuhsg\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // أسبوع
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core vendors - الأساسيات فقط
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/')) {
            return 'react-core';
          }
          
          // Router - منفصل
          if (id.includes('node_modules/react-router-dom') ||
              id.includes('node_modules/react-router') ||
              id.includes('node_modules/@remix-run')) {
            return 'react-router';
          }
          
          // Supabase
          if (id.includes('@supabase')) {
            return 'supabase';
          }
          
          // UI Components
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          
          // Charts - lazy load
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // QR - lazy load
          if (id.includes('qrcode') || id.includes('qr-code-styling')) {
            return 'qr';
          }
          
          // Background effects - lazy load
          if (id.includes('three') || id.includes('vanta')) {
            return 'background-effects';
          }
          
          // Animations
          if (id.includes('framer-motion')) {
            return 'animations';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    // تقليل حجم الملفات
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // إزالة console.log في production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  }
}));
