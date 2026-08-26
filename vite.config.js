import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' produces relative asset URLs so the build works
// whether GoDaddy serves it from the domain root or a subfolder.
export default defineConfig({
  base: './',
  plugins: [react()],
})
