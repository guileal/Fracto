import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

export const wordpressDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = resolve(wordpressDir, 'wp-assets.catalog.json')
const exportsPath = resolve(wordpressDir, 'wp-assets.exports.json')

export function loadCatalog() {
  return JSON.parse(readFileSync(catalogPath, 'utf8'))
}

export function loadExports() {
  const list = JSON.parse(readFileSync(exportsPath, 'utf8'))
  if (!Array.isArray(list)) throw new Error('wp-assets.exports.json deve ser um array.')
  return list
}

export function loadManifest() {
  const catalog = loadCatalog()
  const exportIds = loadExports()
  const exports = exportIds.map((id) => {
    const entry = catalog[id]
    if (!entry) throw new Error(`Export "${id}" não existe no catálogo.`)
    return { id, ...entry }
  })
  return { exports, catalog, exportIds, catalogPath, exportsPath }
}

export function saveCatalog(catalog) {
  writeFileSync(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`)
}

export function saveExports(exportIds) {
  writeFileSync(exportsPath, `${JSON.stringify(exportIds, null, 2)}\n`)
}

export function saveManifest({ catalog, exportIds }) {
  saveCatalog(catalog)
  saveExports(exportIds)
}

export function toIifeName(id) {
  const pascal = id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  return `Fracto3d${pascal}`
}

export function defaultShortcode(id) {
  return `fracto3d_${id.replace(/-/g, '_')}`
}

export function defaultRowClass(id) {
  return `fracto-${id}`
}
