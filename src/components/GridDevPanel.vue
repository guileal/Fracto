<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  clampGrid,
  DEFAULT_GRID_CONFIG,
  formatGridReferenceCode,
  GRID_LIMITS,
  type GridConfig,
} from '../lib/gridConfig'
import { normalizeHexColor } from '../lib/colorHex'
import {
  DEFAULT_SCENE_LIGHTING,
  formatLightingReferenceCode,
  type SceneLightingConfig,
} from '../lib/gridLighting'

const lighting = defineModel<SceneLightingConfig>('lighting', { required: true })
const grid = defineModel<GridConfig>('grid', { required: true })

const emit = defineEmits<{
  applyGrid: [GridConfig]
}>()

type Tab = 'light' | 'grid'
const tab = ref<Tab>('light')
const colorHexInput = ref(lighting.value.mouse.color)

watch(
  () => lighting.value.mouse.color,
  (c) => {
    colorHexInput.value = c
  },
)
const copiedLight = ref(false)
const copiedGrid = ref(false)
let copyTimer = 0

const lightCode = computed(() => formatLightingReferenceCode(lighting.value))
const gridCode = computed(() => formatGridReferenceCode(grid.value))
const gridTotal = computed(() => clampGrid(grid.value).cols * clampGrid(grid.value).rows)

function patchMouse(partial: Partial<SceneLightingConfig['mouse']>) {
  lighting.value = {
    mouse: { ...lighting.value.mouse, ...partial },
  }
  if (partial.color !== undefined) {
    colorHexInput.value = partial.color
  }
}

function onColorPicker(input: string) {
  patchMouse({ color: input })
}

function onColorHexBlur() {
  const normalized = normalizeHexColor(colorHexInput.value)
  if (normalized) {
    patchMouse({ color: normalized })
  } else {
    colorHexInput.value = lighting.value.mouse.color
  }
}

function onColorHexEnter(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    ;(event.target as HTMLInputElement).blur()
  }
}

const GRID_ASPECT = DEFAULT_GRID_CONFIG.rows / DEFAULT_GRID_CONFIG.cols
const LIGHT_STEP = 0.2
const LIGHT_INTENSITY_MAX = 6

const densityCols = computed({
  get: () => grid.value.cols,
  set: (cols: number) => setGridDensity(cols),
})

function setGridDensity(cols: number) {
  const rows = Math.round(cols * GRID_ASPECT)
  const clamped = clampGrid({ cols, rows })
  grid.value = clamped
  emit('applyGrid', clamped)
}

function bumpGrid(delta: number) {
  setGridDensity(grid.value.cols + delta)
}

function bumpLight(delta: number) {
  const next = Math.min(
    LIGHT_INTENSITY_MAX,
    Math.max(0, lighting.value.mouse.intensity + delta),
  )
  patchMouse({ intensity: Math.round(next * 100) / 100 })
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (isTypingTarget(event.target)) return

  if (event.key === '[') {
    event.preventDefault()
    bumpGrid(-1)
    return
  }
  if (event.key === ']') {
    event.preventDefault()
    bumpGrid(1)
    return
  }
  if (event.key === '-' || event.key === '_') {
    event.preventDefault()
    bumpLight(-LIGHT_STEP)
    return
  }
  if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    bumpLight(LIGHT_STEP)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})

async function copyText(text: string, which: 'light' | 'grid') {
  try {
    await navigator.clipboard.writeText(text)
    if (which === 'light') copiedLight.value = true
    else copiedGrid.value = true
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copiedLight.value = false
      copiedGrid.value = false
    }, 2000)
  } catch {
    /* silencioso */
  }
}

function resetLight() {
  lighting.value = structuredClone(DEFAULT_SCENE_LIGHTING)
  colorHexInput.value = lighting.value.mouse.color
}

function resetGrid() {
  setGridDensity(DEFAULT_GRID_CONFIG.cols)
}
</script>

<template>
  <aside class="dev-panel" aria-label="Painel de desenvolvimento da grade">
    <nav class="dev-panel__tabs" role="tablist">
      <button
        type="button"
        role="tab"
        class="dev-panel__tab"
        :class="{ 'dev-panel__tab--active': tab === 'light' }"
        :aria-selected="tab === 'light'"
        @click="tab = 'light'"
      >
        Luz
      </button>
      <button
        type="button"
        role="tab"
        class="dev-panel__tab"
        :class="{ 'dev-panel__tab--active': tab === 'grid' }"
        :aria-selected="tab === 'grid'"
        @click="tab = 'grid'"
      >
        Grade
      </button>
    </nav>

    <!-- —— Luz —— -->
    <div v-show="tab === 'light'" class="dev-panel__pane" role="tabpanel">
      <header class="dev-panel__head">
        <h2 class="dev-panel__title">Luz do mouse</h2>
        <button type="button" class="dev-panel__reset" @click="resetLight">Reset</button>
      </header>

      <label class="dev-panel__row dev-panel__row--check">
        <input
          type="checkbox"
          :checked="lighting.mouse.enabled"
          @change="patchMouse({ enabled: ($event.target as HTMLInputElement).checked })"
        />
        Ativa
      </label>

      <div class="dev-panel__color-block">
        <span class="dev-panel__label">Cor</span>
        <div class="dev-panel__color-row">
          <input
            type="color"
            :value="lighting.mouse.color"
            @input="onColorPicker(($event.target as HTMLInputElement).value)"
          />
          <input
            v-model="colorHexInput"
            type="text"
            class="dev-panel__hex"
            spellcheck="false"
            placeholder="#f55e1d"
            maxlength="7"
            @blur="onColorHexBlur"
            @keydown="onColorHexEnter"
          />
        </div>
      </div>

      <label class="dev-panel__row">
        <span>Intensidade</span>
        <input
          type="range"
          min="0"
          max="6"
          step="0.05"
          :value="lighting.mouse.intensity"
          @input="patchMouse({ intensity: Number(($event.target as HTMLInputElement).value) })"
        />
        <output>{{ lighting.mouse.intensity.toFixed(2) }}</output>
      </label>

      <label class="dev-panel__row">
        <span>Distância</span>
        <input
          type="range"
          min="4"
          max="40"
          step="1"
          :value="lighting.mouse.distance"
          @input="patchMouse({ distance: Number(($event.target as HTMLInputElement).value) })"
        />
        <output>{{ lighting.mouse.distance }}</output>
      </label>

      <label class="dev-panel__row">
        <span>Decay</span>
        <input
          type="range"
          min="0"
          max="3"
          step="0.1"
          :value="lighting.mouse.decay"
          @input="patchMouse({ decay: Number(($event.target as HTMLInputElement).value) })"
        />
        <output>{{ lighting.mouse.decay.toFixed(1) }}</output>
      </label>

      <label class="dev-panel__row">
        <span>Z (profundidade)</span>
        <input
          type="range"
          min="1"
          max="10"
          step="0.1"
          :value="lighting.mouse.zOffset"
          @input="patchMouse({ zOffset: Number(($event.target as HTMLInputElement).value) })"
        />
        <output>{{ lighting.mouse.zOffset.toFixed(1) }}</output>
      </label>

      <ul class="dev-panel__keys dev-panel__keys--compact" aria-label="Atalhos de teclado">
        <li><kbd>-</kbd> luz mais fraca · <kbd>+</kbd> luz mais forte</li>
        <li><kbd>[</kbd> menos quadrados · <kbd>]</kbd> mais quadrados</li>
      </ul>

      <div class="dev-panel__code-wrap">
        <pre class="dev-panel__code">{{ lightCode }}</pre>
        <button type="button" class="dev-panel__copy" @click="copyText(lightCode, 'light')">
          {{ copiedLight ? 'Copiado!' : 'Copiar código da luz' }}
        </button>
      </div>
    </div>

    <!-- —— Grade —— -->
    <div v-show="tab === 'grid'" class="dev-panel__pane" role="tabpanel">
      <header class="dev-panel__head">
        <h2 class="dev-panel__title">Quadrados</h2>
        <button type="button" class="dev-panel__reset" @click="resetGrid">Reset</button>
      </header>

      <p class="dev-panel__hint">
        <strong>{{ gridTotal }}</strong> cubos · {{ clampGrid(grid).cols }} ×
        {{ clampGrid(grid).rows }}
      </p>

      <label class="dev-panel__density">
        <span>Quantidade (colunas)</span>
        <input
          v-model.number="densityCols"
          type="range"
          :min="GRID_LIMITS.cols.min"
          :max="GRID_LIMITS.cols.max"
          step="1"
        />
        <div class="dev-panel__density-meta">
          <output>{{ clampGrid(grid).cols }} col</output>
          <output>{{ clampGrid(grid).rows }} lin</output>
        </div>
      </label>

      <ul class="dev-panel__keys" aria-label="Atalhos de teclado">
        <li><kbd>[</kbd> menos quadrados</li>
        <li><kbd>]</kbd> mais quadrados</li>
        <li><kbd>-</kbd> luz mais fraca</li>
        <li><kbd>+</kbd> luz mais forte</li>
      </ul>

      <div class="dev-panel__code-wrap">
        <pre class="dev-panel__code">{{ gridCode }}</pre>
        <button type="button" class="dev-panel__copy" @click="copyText(gridCode, 'grid')">
          {{ copiedGrid ? 'Copiado!' : 'Copiar código da grade' }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.dev-panel {
  position: fixed;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 9998;
  width: min(320px, calc(100vw - 1.5rem));
  max-height: calc(100vh - 1.5rem);
  overflow: auto;
  padding: 0.75rem 1rem 1rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(0, 0, 0, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.dev-panel__tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.dev-panel__tab {
  flex: 1;
  padding: 0.4rem 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.dev-panel__tab--active {
  background: var(--fracto-brand-dim);
  border-color: var(--fracto-brand-border);
  color: var(--fracto-brand-soft);
}

.dev-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.65rem;
}

.dev-panel__title {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--fracto-brand-soft);
}

.dev-panel__reset {
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.68rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.dev-panel__reset:hover {
  color: #fff;
}

.dev-panel__hint {
  margin: 0 0 0.75rem;
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.5);
}

.dev-panel__hint strong {
  color: rgba(255, 255, 255, 0.85);
}

.dev-panel__row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.35rem 0.5rem;
  margin-bottom: 0.5rem;
}

.dev-panel__row--check {
  grid-template-columns: auto 1fr;
  margin-bottom: 0.65rem;
}

.dev-panel__row span,
.dev-panel__label {
  grid-column: 1 / -1;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.68rem;
}

.dev-panel__color-block {
  margin-bottom: 0.65rem;
}

.dev-panel__color-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dev-panel__color-row input[type='color'] {
  width: 2.25rem;
  height: 1.75rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  flex-shrink: 0;
}

.dev-panel__hex {
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.72rem;
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
}

.dev-panel__hex:focus {
  outline: none;
  border-color: var(--fracto-brand-border);
}

.dev-panel__density {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.dev-panel__density span {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.55);
}

.dev-panel__density input[type='range'] {
  width: 100%;
  accent-color: var(--fracto-brand);
}

.dev-panel__density-meta {
  display: flex;
  justify-content: space-between;
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.5);
}

.dev-panel__keys {
  margin: 0 0 0.75rem;
  padding: 0.5rem 0 0;
  list-style: none;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.45);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.dev-panel__keys li {
  margin-bottom: 0.25rem;
}

.dev-panel__keys--compact {
  border-top: none;
  padding-top: 0;
  margin-top: 0.5rem;
}

.dev-panel__keys kbd {
  display: inline-block;
  min-width: 1.1rem;
  margin-right: 0.35rem;
  padding: 0.1rem 0.35rem;
  font-family: ui-monospace, monospace;
  font-size: 0.62rem;
  text-align: center;
  color: var(--fracto-brand-soft);
  background: var(--fracto-brand-dim);
  border: 1px solid var(--fracto-brand-border);
  border-radius: 4px;
}

.dev-panel__row input[type='range'] {
  grid-column: 1;
  width: 100%;
  accent-color: var(--fracto-brand);
}

.dev-panel__row output,
.dev-panel__num {
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.75);
}

.dev-panel__num {
  width: 2.75rem;
  padding: 0.2rem 0.35rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 6px;
}

.dev-panel__code-wrap {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dev-panel__code {
  margin: 0 0 0.6rem;
  padding: 0.55rem;
  font-family: ui-monospace, monospace;
  font-size: 0.62rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}

.dev-panel__copy {
  width: 100%;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--fracto-brand-border);
  border-radius: 8px;
  background: var(--fracto-brand-dim);
  color: var(--fracto-brand-soft);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
}

.dev-panel__copy:hover {
  background: rgba(245, 94, 29, 0.22);
}
</style>
