import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react()],
  server: {
    proxy: {
      "/api": `http://127.0.0.1:${process.env.AUTH_PORT || 8787}`,
    },
    watch: {
      ignored: ["**/public/Resume.pdf", "**/public/images/logos/**"],
    },
  },
  // The SSR bundle is only used by scripts/prerender.mjs during `npm run build`.
  ssr: {
    noExternal: ["lucide-react"],
  },
  build: {
    copyPublicDir: !isSsrBuild,
    rollupOptions: isSsrBuild ? {} : {
      input: {
        main: resolve(__dirname, "index.html"),
        admin: resolve(__dirname, "admin/index.html"),
      },
    },
  },
}));
