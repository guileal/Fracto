import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import { fractoAlias } from '../vite-shared'

const assetId = 'logo-01-black'
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
      name: 'Fracto3dLogo01Black',
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
