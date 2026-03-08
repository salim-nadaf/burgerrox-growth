import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { imagetools } from "vite-imagetools";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    imagetools({
      defaultDirectives: (url) => {
        const pathname = url.pathname;
        const ext = pathname.split('.').pop()?.toLowerCase();
        if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) {
          return new URLSearchParams();
        }
        // Hero images need larger size for full-width display
        if (pathname.includes('hero') || pathname.includes('zinger-hero')) {
          return new URLSearchParams('w=500&format=webp&quality=45');
        }
        // Brother-sister about photo displayed at ~350px
        if (pathname.includes('brother-sister')) {
          return new URLSearchParams('w=500&format=webp&quality=65');
        }
        // Logo displayed at ~80px height, 200px is 2.5x retina
        if (pathname.includes('logo')) {
          return new URLSearchParams('w=200&format=webp&quality=70');
        }
        // Menu item images displayed at 72px → 200px is ~2.8x retina
        if (pathname.includes('Burger') || pathname.includes('Fries') || 
            pathname.includes('Wedges') || pathname.includes('Popcorn') || 
            pathname.includes('lava-cake') || pathname.includes('chicken-burger') ||
            pathname.includes('egg-burger') || pathname.includes('Lava')) {
          return new URLSearchParams('w=200&format=webp&quality=70');
        }
        // Food strip images displayed at max 200px → 400px is 2x retina
        return new URLSearchParams('w=400&format=webp&quality=70');
      },
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
