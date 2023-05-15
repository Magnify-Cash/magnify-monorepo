import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  envDir: "..",
  resolve: {
    alias: {
      process: "process/browser",
      util: "util",
    },
  },
  plugins: [react()],
});
