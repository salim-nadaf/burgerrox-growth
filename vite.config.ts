import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    ViteImageOptimizer({
      jpg: { quality: 20, mozjpeg: true },
      jpeg: { quality: 20, mozjpeg: true },
      png: { quality: 30, compressionLevel: 9 },
      webp: { quality: 15, effort: 6, smartSubsample: true },
      avif: { quality: 20, effort: 6 },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-select', '@radix-ui/react-toast'],
          query: ['@tanstack/react-query'],
        },
      },
    },
  },
}));