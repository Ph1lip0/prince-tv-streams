import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: (pathStr) => pathStr.replace(/^\/api/, ''),
        headers: {
          'X-Auth-Token': '9170ec64b5034fe8986cefe145d52b51',
        },
      },
    },
  },
})
