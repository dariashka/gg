// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        debriefs: resolve(__dirname, 'debriefs/index.html'),
        project8: resolve(__dirname, 'debriefs/project8.html'),
        project9: resolve(__dirname, 'debriefs/project9.html'),
        project10: resolve(__dirname, 'debriefs/project10.html'),
        project11: resolve(__dirname, 'debriefs/project11.html'),
        project12: resolve(__dirname, 'debriefs/project12.html'),
        project13: resolve(__dirname, 'debriefs/project13.html'),
        project14: resolve(__dirname, 'debriefs/project14.html'),
        project15: resolve(__dirname, 'debriefs/project15.html'),
      },
    },
  },
})