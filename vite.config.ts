import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    open: '/', // 自动打开浏览器
    proxy: {
      // 修改代理配置，确保正确转发请求
      '/api': {
        target: 'http://localhost:8081', // 后端服务地址
        // target: 'http://localhost:5000',
        changeOrigin: true,
        // ？？？ for CORS issues
        // rewrite: path => path.replace(/^\/api/, '')
        
      }
    }
  },
})
