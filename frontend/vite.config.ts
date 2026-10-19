import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:5080';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      // Allow importing the shared ../content/portfolio.json used as offline fallback.
      fs: { allow: ['..'] },
      // In development the browser calls /api on the Vite server, which forwards to ASP.NET Core.
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    preview: {
      port: 4173,
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
    build: {
      sourcemap: false,
      target: 'es2020',
    },
  };
});
