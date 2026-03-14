import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../core_inventory/react_dist', // Output to Django project dir
    emptyOutDir: true,
  }
})
