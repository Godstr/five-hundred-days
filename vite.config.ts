import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { adminPlugin } from './server/admin-plugin.ts'

// `base: './'` keeps every asset path relative, so the built site works on any
// static host — Vercel, Netlify, GitHub Pages sub-folders, even a USB stick.
export default defineConfig({
  base: './',
  // adminPlugin powers http://localhost:5173/#admin and only runs under `npm run dev`
  plugins: [react(), tailwindcss(), adminPlugin()],
})
