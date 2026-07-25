import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures relative path resolution for GitHub Pages / Vercel / Netlify
  server: {
    port: 3000,
    host: true
  }
})
