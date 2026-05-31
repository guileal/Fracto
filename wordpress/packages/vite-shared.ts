import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageDir = fileURLToPath(new URL('.', import.meta.url))
const repoSrc = resolve(packageDir, '../../src')

/** Alias para importar cenas Three.js do app Vue (fonte única). Ver AGENTS.md §2 I2. */
export const fractoAlias = {
  '@fracto': repoSrc,
} as const
