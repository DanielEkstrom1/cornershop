import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import iconify from '@tomjs/vite-plugin-iconify';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    iconify({
      resources: ['https://unpkg.com/@iconify/json/json'],
      rotate: 3000,
      local: ['ant-design', 'ep'],
    })
  ],
  server : {
    watch: {
      usePolling: true
    },
    proxy: {
      '/api' : {
        target: "http://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/,''),
        changeOrigin: true,
        secure: false,
        rewriteWsOrigin: true,
        ws: true,
      }
    }
  }
});
