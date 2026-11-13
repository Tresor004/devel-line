import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` produit un unique fichier dist/index.html autonome
export default defineConfig({
  plugins: [react(), viteSingleFile()],
})
