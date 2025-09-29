import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import eslint from 'vite-plugin-eslint';
import Pages from 'vite-plugin-pages'

export default defineConfig({
  plugins: [tailwindcss(), eslint(),   Pages({
      dirs: [
        // basic
        { dir: 'src/pages', baseRoute: '' },
        { dir: 'src/about', baseRoute: 'about' },
      ],
    }),],
  server : {
    proxy: {
      '/api' : {
        target: "https://localhost:8080",
        rewrite: (path) => path.replace(/^\/api/,''),
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
