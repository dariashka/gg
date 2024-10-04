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
        profile: resolve(__dirname, 'profile.html'),
        store: resolve(__dirname, 'store.html'),
        product: resolve(__dirname, 'product.html'),
        debriefs: resolve(__dirname, 'debriefs/index.html'),
        project8: resolve(__dirname, 'debriefs/project8.html'),
        project9: resolve(__dirname, 'debriefs/project9.html'),
      },
    },
  },
})