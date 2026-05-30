import { resolve } from 'node:path'
import { defineConfig } from 'vite'

const assetId = 'grid-background'
const uploadDir = resolve(__dirname, `../../uploads/fracto-3d/${assetId}`)

export default defineConfig({
  build: {
    outDir: uploadDir,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Fracto3dGridBackground',
      formats: ['iife'],
      fileName: () => `${assetId}.min.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false,
    cssFileName: assetId,
    minify: 'esbuild',
    sourcemap: true,
  },
})
