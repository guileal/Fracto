<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { normalizeHexColor } from '../lib/colorHex'
import type { MagicCubeConfig, MagicCubeMaterialConfig } from '../lib/magicCubeConfig'
import { formatMagicCubeCopyPayload } from '../lib/magicCubeReference'
import { formatMagicCube2CopyPayload } from '../lib/magicCube2Reference'
import {
  degToRad,
  formatMagicCubeViewCopyPayload,
  radToDeg,
} from '../lib/magicCubeViewReference'

type PanelTab = 'layout' | 'white' | 'bevel' | 'view' | 'accent' | 'timing' | 'export'

const props = withDefaults(
  defineProps<{
    config: MagicCubeConfig
    apply: (partial: Partial<MagicCubeConfig>) => void
    defaultConfig: MagicCubeConfig
    viewDefaults: Pick<
      MagicCubeConfig,
      'pivotRotX' | 'pivotRotY' | 'pivotRotZ' | 'cameraX' | 'cameraY' | 'cameraZ'
    >
    defaultBevel?: number
    variant?: 'v1' | 'v2' | 'v1-light' | 'v2-light'
  }>(),
  {
    defaultBevel: undefined,
    variant: 'v1',
  },
)

const activeTab = ref<PanelTab | null>(null)
const accentHexInput = ref(props.config.accentColor)
const cubeHexInput = ref(props.config.cubeColor)
const copyFeedback = ref('')
const copyViewFeedback = ref('')
let copyTimer = 0
let copyViewTimer = 0

const bevelReset = computed(() => props.defaultBevel ?? props.defaultConfig.bevelRadius)

const isV2Variant = computed(() => props.variant === 'v2' || props.variant === 'v2-light')

const copyPayload = computed(() =>
  isV2Variant.value
    ? formatMagicCube2CopyPayload(props.config, props.variant)
    : formatMagicCubeCopyPayload(props.config, props.variant),
)
const copyViewPayload = computed(() => formatMagicCubeViewCopyPayload(props.config, props.variant))

const exportConfigHint = computed(() => {
  if (props.variant === 'v2-light') {
    return 'src/lib/magicCube2Config.ts → npm run build:wp (magic-cube-v2-light)'
  }
  if (props.variant === 'v2') {
    return 'src/lib/magicCube2Config.ts → npm run build:wp (magic-cube-v2)'
  }
  if (props.variant === 'v1-light') {
    return 'src/lib/magicCubeConfig.ts → npm run build:wp (magic-cube-v8-light)'
  }
  return 'src/lib/magicCubeConfig.ts → npm run build:wp (magic-cube-v8)'
})

const exportViewHint = computed(() => {
  if (props.variant === 'v2-light') {
    return 'MAGIC_CUBE_2_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_2_LIGHT_CONFIG em magicCube2Config.ts'
  }
  if (props.variant === 'v2') {
    return 'MAGIC_CUBE_2_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_2_CONFIG em magicCube2Config.ts'
  }
  if (props.variant === 'v1-light') {
    return 'MAGIC_CUBE_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_LIGHT_CONFIG em magicCubeConfig.ts'
  }
  return 'MAGIC_CUBE_VIEW_DEFAULTS + DEFAULT_MAGIC_CUBE_CONFIG em magicCubeConfig.ts'
})

const tabs: { id: PanelTab; label: string }[] = [
  { id: 'layout', label: 'Alinhamento' },
  { id: 'white', label: 'Material branco' },
  { id: 'bevel', label: 'Bevel' },
  { id: 'view', label: 'Vista e pivot' },
  { id: 'accent', label: 'Laranja' },
  { id: 'timing', label: 'Animação' },
  { id: 'export', label: 'Exportar' },
]

watch(
  () => props.config.accentColor,
  (color) => {
    accentHexInput.value = color
  },
)

watch(
  () => props.config.cubeColor,
  (color) => {
    cubeHexInput.value = color
  },
)

function patch(partial: Partial<MagicCubeConfig>) {
  props.apply(partial)
}

function toggleTab(tab: PanelTab) {
  activeTab.value = activeTab.value === tab ? null : tab
}

function onNumberInput(key: keyof MagicCubeConfig, event: Event) {
  patch({ [key]: Number((event.target as HTMLInputElement).value) })
}

function onMaterialInput(
  target: 'cubeMaterial' | 'accentMaterial',
  key: keyof MagicCubeMaterialConfig,
  event: Event,
) {
  const value = Number((event.target as HTMLInputElement).value)
  patch({
    [target]: {
      ...props.config[target],
      [key]: value,
    },
  })
}

function onPivotRotDegInput(key: 'pivotRotX' | 'pivotRotY' | 'pivotRotZ', event: Event) {
  patch({ [key]: degToRad(Number((event.target as HTMLInputElement).value)) })
}

function onCubeColorPicker(input: string) {
  const normalized = normalizeHexColor(input)
  if (normalized) patch({ cubeColor: normalized })
}

function onCubeHexInput(event: Event) {
  const normalized = normalizeHexColor((event.target as HTMLInputElement).value)
  if (normalized) patch({ cubeColor: normalized })
}

function onCubeHexBlur() {
  const normalized = normalizeHexColor(cubeHexInput.value)
  if (normalized) {
    patch({ cubeColor: normalized })
  } else {
    cubeHexInput.value = props.config.cubeColor
  }
}

function onAccentColorPicker(input: string) {
  const normalized = normalizeHexColor(input)
  if (normalized) patch({ accentColor: normalized })
}

function onAccentHexInput(event: Event) {
  const normalized = normalizeHexColor((event.target as HTMLInputElement).value)
  if (normalized) patch({ accentColor: normalized })
}

function onAccentHexBlur() {
  const normalized = normalizeHexColor(accentHexInput.value)
  if (normalized) {
    patch({ accentColor: normalized })
  } else {
    accentHexInput.value = props.config.accentColor
  }
}

function resetLayout() {
  patch({
    scale: props.defaultConfig.scale,
    offsetX: props.defaultConfig.offsetX,
    offsetY: props.defaultConfig.offsetY,
  })
}

function resetWhiteMaterial() {
  patch({
    cubeColor: props.defaultConfig.cubeColor,
    cubeMaterial: { ...props.defaultConfig.cubeMaterial },
  })
}

function resetBevel() {
  patch({ bevelRadius: bevelReset.value })
}

function resetView() {
  patch({ ...props.viewDefaults })
}

async function copyDefaultsReference() {
  try {
    await navigator.clipboard.writeText(copyPayload.value)
    copyFeedback.value = 'Copiado!'
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copyFeedback.value = ''
    }, 2000)
  } catch {
    copyFeedback.value = 'Erro ao copiar'
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copyFeedback.value = ''
    }, 2000)
  }
}

async function copyViewReference() {
  try {
    await navigator.clipboard.writeText(copyViewPayload.value)
    copyViewFeedback.value = 'Copiado!'
    window.clearTimeout(copyViewTimer)
    copyViewTimer = window.setTimeout(() => {
      copyViewFeedback.value = ''
    }, 2000)
  } catch {
    copyViewFeedback.value = 'Erro ao copiar'
    window.clearTimeout(copyViewTimer)
    copyViewTimer = window.setTimeout(() => {
      copyViewFeedback.value = ''
    }, 2000)
  }
}

onBeforeUnmount(() => {
  window.clearTimeout(copyTimer)
  window.clearTimeout(copyViewTimer)
})
</script>

<template>
  <div
    class="cube-panel"
    :class="{ 'cube-panel--open': activeTab !== null }"
    aria-label="Controles do cubo mágico"
  >
    <div v-show="activeTab !== null" class="cube-panel__body" role="region" :aria-label="tabs.find((t) => t.id === activeTab)?.label">
      <header class="cube-panel__body-header">
        <h2 class="cube-panel__body-title">{{ tabs.find((t) => t.id === activeTab)?.label }}</h2>
      </header>

      <div v-if="activeTab === 'layout'" class="cube-panel__section">
        <label class="cube-panel__row">
          <span class="cube-panel__label">Tamanho</span>
          <input
            type="range"
            min="0.4"
            max="1.6"
            step="0.01"
            :value="config.scale"
            @input="onNumberInput('scale', $event)"
          />
          <output class="cube-panel__value">{{ config.scale.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Horizontal</span>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            :value="config.offsetX"
            @input="onNumberInput('offsetX', $event)"
          />
          <output class="cube-panel__value">{{ config.offsetX.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Vertical</span>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.05"
            :value="config.offsetY"
            @input="onNumberInput('offsetY', $event)"
          />
          <output class="cube-panel__value">{{ config.offsetY.toFixed(2) }}</output>
        </label>
        <button type="button" class="cube-panel__reset" @click="resetLayout">Repor layout</button>
      </div>

      <div v-else-if="activeTab === 'white'" class="cube-panel__section">
        <div class="cube-panel__row cube-panel__row--color">
          <span class="cube-panel__label">Cor</span>
          <label class="cube-panel__swatch">
            <input
              type="color"
              :value="config.cubeColor"
              @input="onCubeColorPicker(($event.target as HTMLInputElement).value)"
            />
          </label>
          <input
            v-model="cubeHexInput"
            type="text"
            class="cube-panel__hex"
            maxlength="7"
            spellcheck="false"
            @change="onCubeHexInput"
            @blur="onCubeHexBlur"
          />
        </div>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Rugosidade</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="config.cubeMaterial.roughness"
            @input="onMaterialInput('cubeMaterial', 'roughness', $event)"
          />
          <output class="cube-panel__value">{{ config.cubeMaterial.roughness.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Verniz</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="config.cubeMaterial.clearcoat"
            @input="onMaterialInput('cubeMaterial', 'clearcoat', $event)"
          />
          <output class="cube-panel__value">{{ config.cubeMaterial.clearcoat.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Reflexo</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            :value="config.cubeMaterial.envMapIntensity"
            @input="onMaterialInput('cubeMaterial', 'envMapIntensity', $event)"
          />
          <output class="cube-panel__value">{{ config.cubeMaterial.envMapIntensity.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Emissão</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            :value="config.cubeMaterial.emissiveIntensity"
            @input="onMaterialInput('cubeMaterial', 'emissiveIntensity', $event)"
          />
          <output class="cube-panel__value">{{ config.cubeMaterial.emissiveIntensity.toFixed(2) }}</output>
        </label>
        <button type="button" class="cube-panel__reset" @click="resetWhiteMaterial">Repor branco</button>
      </div>

      <div v-else-if="activeTab === 'bevel'" class="cube-panel__section">
        <label class="cube-panel__row">
          <span class="cube-panel__label">Raio</span>
          <input
            type="range"
            min="0"
            max="0.08"
            step="0.001"
            :value="config.bevelRadius"
            @input="onNumberInput('bevelRadius', $event)"
          />
          <output class="cube-panel__value">{{ config.bevelRadius.toFixed(3) }}</output>
        </label>
        <button type="button" class="cube-panel__reset" @click="resetBevel">
          Repor bevel ({{ bevelReset.toFixed(3) }})
        </button>
      </div>

      <div v-else-if="activeTab === 'view'" class="cube-panel__section">
        <p class="cube-panel__hint">Rotação do pivot central. A câmera enquadra o cubo.</p>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Pivot X</span>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            :value="radToDeg(config.pivotRotX)"
            @input="onPivotRotDegInput('pivotRotX', $event)"
          />
          <output class="cube-panel__value">{{ radToDeg(config.pivotRotX).toFixed(1) }}°</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Pivot Y</span>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            :value="radToDeg(config.pivotRotY)"
            @input="onPivotRotDegInput('pivotRotY', $event)"
          />
          <output class="cube-panel__value">{{ radToDeg(config.pivotRotY).toFixed(1) }}°</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Pivot Z</span>
          <input
            type="range"
            min="-180"
            max="180"
            step="0.5"
            :value="radToDeg(config.pivotRotZ)"
            @input="onPivotRotDegInput('pivotRotZ', $event)"
          />
          <output class="cube-panel__value">{{ radToDeg(config.pivotRotZ).toFixed(1) }}°</output>
        </label>
        <p class="cube-panel__subsection">Câmera</p>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Cam X</span>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.05"
            :value="config.cameraX"
            @input="onNumberInput('cameraX', $event)"
          />
          <output class="cube-panel__value">{{ config.cameraX.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Cam Y</span>
          <input
            type="range"
            min="-5"
            max="5"
            step="0.05"
            :value="config.cameraY"
            @input="onNumberInput('cameraY', $event)"
          />
          <output class="cube-panel__value">{{ config.cameraY.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Cam Z</span>
          <input
            type="range"
            min="4"
            max="24"
            step="0.1"
            :value="config.cameraZ"
            @input="onNumberInput('cameraZ', $event)"
          />
          <output class="cube-panel__value">{{ config.cameraZ.toFixed(2) }}</output>
        </label>
        <button type="button" class="cube-panel__reset" @click="resetView">Repor vista</button>
        <div class="cube-panel__export-block">
          <p class="cube-panel__hint">Copia pivot + câmera para fixar em {{ exportViewHint }}.</p>
          <button type="button" class="cube-panel__copy" @click="copyViewReference">
            {{ copyViewFeedback || 'Copiar vista' }}
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'accent'" class="cube-panel__section">
        <div class="cube-panel__row cube-panel__row--color">
          <span class="cube-panel__label">Cor destaque</span>
          <label class="cube-panel__swatch">
            <input
              type="color"
              :value="config.accentColor"
              @input="onAccentColorPicker(($event.target as HTMLInputElement).value)"
            />
          </label>
          <input
            v-model="accentHexInput"
            type="text"
            class="cube-panel__hex"
            maxlength="7"
            spellcheck="false"
            @change="onAccentHexInput"
            @blur="onAccentHexBlur"
          />
        </div>
        <p class="cube-panel__subsection">Material laranja</p>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Rugosidade</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="config.accentMaterial.roughness"
            @input="onMaterialInput('accentMaterial', 'roughness', $event)"
          />
          <output class="cube-panel__value">{{ config.accentMaterial.roughness.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Verniz</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="config.accentMaterial.clearcoat"
            @input="onMaterialInput('accentMaterial', 'clearcoat', $event)"
          />
          <output class="cube-panel__value">{{ config.accentMaterial.clearcoat.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Reflexo</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            :value="config.accentMaterial.envMapIntensity"
            @input="onMaterialInput('accentMaterial', 'envMapIntensity', $event)"
          />
          <output class="cube-panel__value">{{ config.accentMaterial.envMapIntensity.toFixed(2) }}</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Emissão</span>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            :value="config.accentMaterial.emissiveIntensity"
            @input="onMaterialInput('accentMaterial', 'emissiveIntensity', $event)"
          />
          <output class="cube-panel__value">{{ config.accentMaterial.emissiveIntensity.toFixed(2) }}</output>
        </label>
      </div>

      <div v-else-if="activeTab === 'timing'" class="cube-panel__section">
        <label class="cube-panel__row">
          <span class="cube-panel__label">Giro fatia</span>
          <input
            type="range"
            min="0.2"
            max="2"
            step="0.05"
            :value="config.sliceDuration"
            @input="onNumberInput('sliceDuration', $event)"
          />
          <output class="cube-panel__value">{{ config.sliceDuration.toFixed(2) }}s</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Explosão</span>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.05"
            :value="config.explodeDuration"
            @input="onNumberInput('explodeDuration', $event)"
          />
          <output class="cube-panel__value">{{ config.explodeDuration.toFixed(2) }}s</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Reset</span>
          <input
            type="range"
            min="0.3"
            max="3"
            step="0.05"
            :value="config.resetDuration"
            @input="onNumberInput('resetDuration', $event)"
          />
          <output class="cube-panel__value">{{ config.resetDuration.toFixed(2) }}s</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Pausa início</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            :value="config.waitStart"
            @input="onNumberInput('waitStart', $event)"
          />
          <output class="cube-panel__value">{{ config.waitStart.toFixed(1) }}s</output>
        </label>
        <label class="cube-panel__row">
          <span class="cube-panel__label">Pré-explosão</span>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            :value="config.waitBeforeExplode"
            @input="onNumberInput('waitBeforeExplode', $event)"
          />
          <output class="cube-panel__value">{{ config.waitBeforeExplode.toFixed(1) }}s</output>
        </label>
      </div>

      <div v-else-if="activeTab === 'export'" class="cube-panel__section">
        <p class="cube-panel__hint">
          Copia todos os parâmetros aprovados para fixar em {{ exportConfigHint }}.
        </p>
        <button type="button" class="cube-panel__copy" @click="copyDefaultsReference">
          {{ copyFeedback || 'Copiar config completa' }}
        </button>
      </div>
    </div>

    <nav class="cube-panel__tabs" aria-label="Secções de controlo">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="cube-panel__tab"
        :class="{ 'cube-panel__tab--active': activeTab === tab.id }"
        :aria-label="tab.label"
        :aria-expanded="activeTab === tab.id"
        @click="toggleTab(tab.id)"
      >
        <svg
          v-if="tab.id === 'layout'"
          class="cube-panel__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <svg
          v-else-if="tab.id === 'white'"
          class="cube-panel__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <rect x="5" y="5" width="14" height="14" rx="2" />
        </svg>
        <svg
          v-else-if="tab.id === 'bevel'"
          class="cube-panel__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <path d="M4 20V8a4 4 0 0 1 4-4h8" />
        </svg>
        <svg
          v-else-if="tab.id === 'view'"
          class="cube-panel__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        <svg
          v-else-if="tab.id === 'accent'"
          class="cube-panel__icon cube-panel__icon--accent"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="8" fill="currentColor" />
        </svg>
        <svg
          v-else-if="tab.id === 'timing'"
          class="cube-panel__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
        <svg
          v-else-if="tab.id === 'export'"
          class="cube-panel__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.75"
          aria-hidden="true"
        >
          <rect x="8" y="2" width="8" height="4" rx="1" />
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        </svg>
      </button>
    </nav>
  </div>
</template>

<style scoped>
.cube-panel {
  position: fixed;
  left: 50%;
  bottom: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min(100%, 28rem);
  transform: translateX(-50%);
  pointer-events: none;
}

.cube-panel__body,
.cube-panel__tabs {
  pointer-events: auto;
}

.cube-panel__body {
  max-height: min(52vh, 22rem);
  overflow-y: auto;
  margin: 0 0.75rem 0.5rem;
  padding: 0.85rem 1rem 1rem;
  border-radius: 14px 14px 10px 10px;
  background: rgba(12, 12, 14, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.45);
}

.cube-panel__body-header {
  margin-bottom: 0.65rem;
}

.cube-panel__body-title {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.cube-panel__section {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.cube-panel__subsection {
  margin: 0.35rem 0 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.cube-panel__hint {
  margin: 0 0 0.25rem;
  font-size: 0.78rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.42);
}

.cube-panel__row {
  display: grid;
  grid-template-columns: 5.5rem 1fr 2.75rem;
  align-items: center;
  gap: 0.5rem;
}

.cube-panel__row--color {
  grid-template-columns: 5.5rem auto 1fr;
}

.cube-panel__label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);
}

.cube-panel__row input[type='range'] {
  width: 100%;
  height: 1.25rem;
  margin: 0;
  accent-color: #f05a28;
  cursor: pointer;
}

.cube-panel__value {
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: rgba(255, 255, 255, 0.65);
}

.cube-panel__swatch input[type='color'] {
  display: block;
  width: 2rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
}

.cube-panel__hex {
  width: 100%;
  padding: 0.35rem 0.5rem;
  font-size: 0.78rem;
  font-family: ui-monospace, monospace;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.cube-panel__hex:focus {
  outline: none;
  border-color: rgba(240, 90, 40, 0.55);
}

.cube-panel__reset,
.cube-panel__copy {
  margin-top: 0.35rem;
  padding: 0.45rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.75);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;
}

.cube-panel__reset:hover,
.cube-panel__copy:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
}

.cube-panel__export-block {
  margin-top: 0.5rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.cube-panel__tabs {
  display: flex;
  justify-content: center;
  gap: 0.15rem;
  margin: 0 0.75rem 0.75rem;
  padding: 0.35rem;
  border-radius: 999px;
  background: rgba(12, 12, 14, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

.cube-panel__tab {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  color: rgba(255, 255, 255, 0.42);
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}

.cube-panel__tab:hover {
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.06);
}

.cube-panel__tab--active {
  color: #fff;
  background: rgba(240, 90, 40, 0.22);
}

.cube-panel__tab--active:hover {
  background: rgba(240, 90, 40, 0.3);
}

.cube-panel__icon {
  width: 1.15rem;
  height: 1.15rem;
}

.cube-panel__icon--accent {
  color: #f72f00;
}

@media (max-width: 900px) {
  .cube-panel {
    width: min(100%, calc(100% - 1rem));
  }

  .cube-panel__row {
    grid-template-columns: 4.75rem 1fr 2.5rem;
  }

  .cube-panel__row--color {
    grid-template-columns: 4.75rem auto 1fr;
  }
}
</style>
