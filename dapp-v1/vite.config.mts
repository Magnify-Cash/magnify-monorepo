import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  if (mode === "production") {
    return {
      resolve: {
        alias: {
          process: "process/browser",
          util: "util",
          "@": resolve(__dirname, "./src/"),
        },
      },
      plugins: [react()],
      build: {
        sourcemap: true,
      },
    };
  }

  if (mode === "development") {
    return {
      define: {
        global: "globalThis",
      },
      resolve: {
        alias: {
          process: "process/browser",
          util: "util",
          "@": resolve(__dirname, "./src/"),
        },
      },
      plugins: [react()],
      build: {
        sourcemap: true,
      },
    };
  }
  return {};
});
