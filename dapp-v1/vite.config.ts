import react from '@vitejs/plugin-react'
import { resolve } from "path";
import { defineConfig } from 'vite'


// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      process: 'process/browser',
      util: 'util',
      "@": resolve(__dirname, "./src/"),
    },
  },
  plugins: [react()],
  build: { //add this property
      sourcemap: true,
  }
})
