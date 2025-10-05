import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss()],
  server : {
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
