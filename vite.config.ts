import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'pwa/icon-192.svg', 'pwa/icon-512.svg'],
          manifest: {
            name: 'Saldo - Gestão Financeira',
            short_name: 'Saldo',
            description: 'Assuma o controle do seu dinheiro com o Saldo.',
            theme_color: '#ffffff',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
              {
                src: 'pwa/icon-192.svg',
                sizes: '192x192',
                type: 'image/svg+xml'
              },
              {
                src: 'pwa/icon-512.svg',
                sizes: '512x512',
                type: 'image/svg+xml'
              }
            ]
          }
        })
      ],
      define: {
        // 'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
