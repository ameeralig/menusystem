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
          // Core vendors - تُحمل في كل صفحة
          if (id.includes('node_modules/react') || 
              id.includes('node_modules/react-dom') || 
              id.includes('node_modules/react-router-dom')) {
            return 'react-vendor';
          }
          
          // Supabase - تُحمل عند الحاجة
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase';
          }
          
          // UI Components - تُحمل عند الحاجة
          if (id.includes('@radix-ui')) {
            return 'ui-vendor';
          }
          
          // Charts - تُحمل فقط في Dashboard وSales
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // QR - تُحمل فقط في QR Generator
          if (id.includes('qrcode') || id.includes('qr-code-styling')) {
            return 'qr';
          }
          
          // Three.js & Vanta - تُحمل فقط في الصفحات التي تستخدمها
          if (id.includes('three') || id.includes('vanta')) {
            return 'background-effects';
          }
          
          // Framer Motion - تُحمل عند الحاجة
          if (id.includes('framer-motion')) {
            return 'animations';
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
