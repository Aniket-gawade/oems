import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const proxyTarget = process.env.VITE_PROXY_TARGET ?? "http://localhost:8080";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    }
  },
  server: {
    host: "0.0.0.0",
    port: Number(process.env.WEB_PORT ?? 5173),
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (urlPath) => urlPath.replace(/^\/api/, "")
      }
    }
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    exclude: ["e2e/**", "node_modules/**", "dist/**"]
  }
});
