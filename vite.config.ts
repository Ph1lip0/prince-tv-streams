import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''),
        headers: {
          'X-Auth-Token': '9170ec64b5034fe8986cefe145d52b51',
        },
      },
    },
  },
});
