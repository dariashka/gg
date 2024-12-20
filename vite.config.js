import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                payout: resolve(__dirname, 'payout/index.html'),
                debriefs: resolve(__dirname, 'debriefs/index.html'),
                project13: resolve(__dirname, 'debriefs/project13.html'),
                project14: resolve(__dirname, 'debriefs/project14.html'),
                project15: resolve(__dirname, 'debriefs/project15.html'),
                project16: resolve(__dirname, 'debriefs/project16.html'),
                project17: resolve(__dirname, 'debriefs/project17.html'),
                project18: resolve(__dirname, 'debriefs/project18.html'),
                project19: resolve(__dirname, 'debriefs/project19.html'),
                project20: resolve(__dirname, 'debriefs/project20.html'),
            },
        },
    },
    server: {
        historyApiFallback: true,
    },
})