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
      // Route our new API endpoints to local backend
      '/api/popular-stories': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ LOCAL API PROXY ERROR:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to Local Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from Local Backend:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/section-feed': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ LOCAL API PROXY ERROR:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to Local Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from Local Backend:', proxyRes.statusCode, req.url);
          });
        }
      },
      '/api/proxy-hindustantimes': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ LOCAL API PROXY ERROR:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to Local Backend:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from Local Backend:', proxyRes.statusCode, req.url);
          });
        }
      },
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
      },
      // Catch-all proxy for any other /api routes to go to local backend
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('❌ CATCH-ALL API PROXY ERROR:', err);
            console.log('Request URL:', req.url);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('📤 Sending Request to Local Backend (catch-all):', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('📥 Received Response from Local Backend (catch-all):', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
