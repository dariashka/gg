// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        donations: resolve(__dirname, 'donations.html'),
        villas: resolve(__dirname, 'villas.html'),
      },
    },
  },
})