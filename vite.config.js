import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import electron from "vite-plugin-electron";
import renderer from "vite-plugin-electron-renderer";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        entry: "electron/main.js",
        onstart(options) {
          options.startup();
        },
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
      {
        entry: "electron/preload.js",
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: "dist-electron",
          },
        },
      },
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  build: {
    outDir: "dist-react",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
});
