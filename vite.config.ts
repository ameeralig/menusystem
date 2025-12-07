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
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp,woff,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5 MB
        runtimeCaching: [
          // كاش الصور من Supabase Storage
          {
            urlPattern: /^https:\/\/zqlckixwpyrwdwrsuhsg\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // شهر للصور
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // كاش API responses من Supabase
          {
            urlPattern: /^https:\/\/zqlckixwpyrwdwrsuhsg\.supabase\.co\/rest\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 5 // 5 دقائق للـ API
              },
              networkTimeoutSeconds: 3,
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // كاش الخطوط من Google Fonts
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // سنة للخطوط
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // كاش ملفات الخطوط
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // سنة
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // كاش الصور الخارجية الأخرى
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // شهر
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
        manualChunks: (id) => {
          // تقسيم ذكي للـ chunks - الحزم تحمّل عند الحاجة فقط
          if (id.includes('node_modules')) {
            // React الأساسي - يحمّل مع التطبيق
            if (id.includes('react-dom') || id.includes('scheduler')) {
              return 'react-core';
            }
            // React Router - يحمّل مع التطبيق
            if (id.includes('react-router')) {
              return 'router';
            }
            // Supabase - يحمّل مع التطبيق (ضروري للـ auth)
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // TanStack Query - يحمّل مع التطبيق
            if (id.includes('@tanstack')) {
              return 'query';
            }
            // UI Components - تحمّل بشكل منفصل (كسول)
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            // Charts - تحمّل فقط في لوحة التحكم
            if (id.includes('recharts') || id.includes('d3')) {
              return 'charts';
            }
            // QR Code - تحمّل فقط في صفحة QR
            if (id.includes('qrcode') || id.includes('qr-code-styling')) {
              return 'qr';
            }
            // Animations - تحمّل عند الحاجة
            if (id.includes('framer-motion')) {
              return 'animation';
            }
            // Helmet - SEO
            if (id.includes('react-helmet')) {
              return 'seo';
            }
            // الباقي
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      },
      mangle: {
        safari10: true
      }
    },
    // تحسين الأداء
    target: 'esnext',
    modulePreload: {
      polyfill: true
    }
  }
}));
