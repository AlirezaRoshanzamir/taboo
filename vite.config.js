import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// App is served from https://<username>.github.io/taboo/
// so assets must be referenced under the /taboo/ base path.
export default defineConfig({
  base: '/taboo/',
  plugins: [react()],
})
