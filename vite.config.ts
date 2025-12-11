import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

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
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // تقسيم بسيط وآمن للـ chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'supabase': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query'],
        },
        // تقسيم CSS لتجنب ملف واحد كبير
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true, // تفعيل تقسيم CSS
    minify: 'esbuild',
    cssMinify: 'esbuild', // ضغط CSS أسرع
    // دعم المتصفحات الحديثة
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],
    // تحسين تقسيم الموارد
    sourcemap: false,
    reportCompressedSize: false
  }
}));
