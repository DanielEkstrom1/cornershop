import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import iconify from '@tomjs/vite-plugin-iconify';

export default defineConfig({
  plugins: [tailwindcss(), 
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
        target: "https://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/,''),
        changeOrigin: true,
        secure: false,
        rewriteWsOrigin: true,
        ws: true,
      }
    }
  }
});
