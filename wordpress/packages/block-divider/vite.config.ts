import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { fractoAlias } from '../vite-shared'

const assetId = 'block-divider'
const themeAssetsDir = resolve(__dirname, `../../themes/Fracto/assets/ui/${assetId}`)

export default defineConfig({
  resolve: {
    alias: fractoAlias,
  },
  build: {
    outDir: themeAssetsDir,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'FractoBlockDivider',
      formats: ['iife'],
      fileName: () => `${assetId}.min.js`,
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        assetFileNames: `${assetId}[extname]`,
      },
    },
    cssCodeSplit: false,
    cssFileName: assetId,
    minify: 'esbuild',
    sourcemap: true,
  },
})
