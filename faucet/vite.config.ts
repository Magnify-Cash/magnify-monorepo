import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  envDir: "..",
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
      "@": resolve(__dirname, "./src/"),
    },
  },
  plugins: [react()],
});
