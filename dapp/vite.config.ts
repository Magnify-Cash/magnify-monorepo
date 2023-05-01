import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [react()],
});
