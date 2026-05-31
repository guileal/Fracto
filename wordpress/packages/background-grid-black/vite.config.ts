import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { fractoAlias } from '../vite-shared'

const assetId = 'background-grid-black'
const themeAssetsDir = resolve(__dirname, `../../themes/Fracto/assets/3d/${assetId}`)

export default defineConfig({
  resolve: {
    alias: fractoAlias,
  },
  build: {
    outDir: themeAssetsDir,
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Fracto3dBackgroundGridBlack',
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
