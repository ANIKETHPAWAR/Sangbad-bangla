import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Production optimizations
    target: 'es2015',
    minify: 'esbuild', // Changed from 'terser' to 'esbuild' for better reliability
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          auth: ['@auth0/auth0-react', '@react-oauth/google'],
          icons: ['react-icons'],
          router: ['react-router-dom']
        }
      }
    },
    // Enable source maps for production debugging
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000
  },
  server: {
    proxy: {
      // Removed proxy configuration - now using deployed backend directly
      // Keep existing proxy for external Hindustan Times API calls
      '/api/sectionfeedperp': {
        target: 'https://bangla.hindustantimes.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/app'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ EXTERNAL API PROXY ERROR:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to External API:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from External API:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/detailfeed': {
        target: 'https://bangla.hindustantimes.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/app'),
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ EXTERNAL API PROXY ERROR:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to External API:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from External API:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/website-content': {
        target: 'https://bangla.hindustantimes.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://localhost');
          const targetUrl = url.searchParams.get('url');
          if (targetUrl) {
            return targetUrl.replace('https://bangla.hindustantimes.com', '');
          }
          return path;
        },
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ WEBSITE PROXY ERROR:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Fetching website content:', proxyReq.path);
          });
        }
      }
      // Removed catch-all proxy since we're using production backend
    }
  }
})
