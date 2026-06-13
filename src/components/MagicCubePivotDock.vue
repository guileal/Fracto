<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  MAGIC_CUBE_PIVOT,
  type MagicCubeConfig,
} from '../lib/magicCubeConfig'
import {
  degToRad,
  formatMagicCubeViewCopyPayload,
  radToDeg,
  resetMagicCubeViewDefaults,
} from '../lib/magicCubeViewReference'

const props = withDefaults(
  defineProps<{
    config?: MagicCubeConfig
    apply?: (partial: Partial<MagicCubeConfig>) => void
  }>(),
  {
    config: () => ({ ...DEFAULT_MAGIC_CUBE_CONFIG }),
    apply: () => {},
  },
)

const panelOpen = ref(false)
const copyFeedback = ref('')
let copyTimer = 0

const copyPayload = computed(() => formatMagicCubeViewCopyPayload(props.config))

function patch(partial: Partial<MagicCubeConfig>) {
  props.apply(partial)
}

function onPivotRotDegInput(key: 'pivotRotX' | 'pivotRotY' | 'pivotRotZ', event: Event) {
  patch({ [key]: degToRad(Number((event.target as HTMLInputElement).value)) })
}

function onCameraInput(key: 'cameraX' | 'cameraY' | 'cameraZ', event: Event) {
  patch({ [key]: Number((event.target as HTMLInputElement).value) })
}

function resetView() {
  patch(resetMagicCubeViewDefaults())
}

function togglePanel() {
  panelOpen.value = !panelOpen.value
}

async function copyViewReference() {
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

onBeforeUnmount(() => {
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <aside
    class="pivot-dock"
    :class="{ 'pivot-dock--hidden': !panelOpen }"
    aria-label="Editor de vista do cubo mágico"
  >
    <button
      type="button"
      class="pivot-dock__header"
      :aria-expanded="panelOpen"
      aria-controls="pivot-dock-body"
      @click="togglePanel"
    >
      <span class="pivot-dock__title">Vista e pivot</span>
      <span class="pivot-dock__toggle-label">{{ panelOpen ? 'Fechar' : 'Abrir' }}</span>
    </button>

    <div v-show="panelOpen" id="pivot-dock-body" class="pivot-dock__body">
      <p class="pivot-dock__hint">Rotação do pivot central (isoGroup). A câmera enquadra o cubo.</p>

      <label class="pivot-dock__row">
        <span class="pivot-dock__label">Pivot X</span>
        <input
          type="range"
          :min="MAGIC_CUBE_PIVOT.rotDeg.min"
          :max="MAGIC_CUBE_PIVOT.rotDeg.max"
          :step="MAGIC_CUBE_PIVOT.rotDeg.step"
          :value="radToDeg(config.pivotRotX)"
          @input="onPivotRotDegInput('pivotRotX', $event)"
        />
        <output class="pivot-dock__value">{{ radToDeg(config.pivotRotX).toFixed(1) }}°</output>
      </label>

      <label class="pivot-dock__row">
        <span class="pivot-dock__label">Pivot Y</span>
        <input
          type="range"
          :min="MAGIC_CUBE_PIVOT.rotDeg.min"
          :max="MAGIC_CUBE_PIVOT.rotDeg.max"
          :step="MAGIC_CUBE_PIVOT.rotDeg.step"
          :value="radToDeg(config.pivotRotY)"
          @input="onPivotRotDegInput('pivotRotY', $event)"
        />
        <output class="pivot-dock__value">{{ radToDeg(config.pivotRotY).toFixed(1) }}°</output>
      </label>

      <label class="pivot-dock__row">
        <span class="pivot-dock__label">Pivot Z</span>
        <input
          type="range"
          :min="MAGIC_CUBE_PIVOT.rotDeg.min"
          :max="MAGIC_CUBE_PIVOT.rotDeg.max"
          :step="MAGIC_CUBE_PIVOT.rotDeg.step"
          :value="radToDeg(config.pivotRotZ)"
          @input="onPivotRotDegInput('pivotRotZ', $event)"
        />
        <output class="pivot-dock__value">{{ radToDeg(config.pivotRotZ).toFixed(1) }}°</output>
      </label>

      <p class="pivot-dock__section">Câmera</p>

      <label class="pivot-dock__row">
        <span class="pivot-dock__label">Cam X</span>
        <input
          type="range"
          :min="MAGIC_CUBE_PIVOT.cameraX.min"
          :max="MAGIC_CUBE_PIVOT.cameraX.max"
          :step="MAGIC_CUBE_PIVOT.cameraX.step"
          :value="config.cameraX"
          @input="onCameraInput('cameraX', $event)"
        />
        <output class="pivot-dock__value">{{ config.cameraX.toFixed(2) }}</output>
      </label>

      <label class="pivot-dock__row">
        <span class="pivot-dock__label">Cam Y</span>
        <input
          type="range"
          :min="MAGIC_CUBE_PIVOT.cameraY.min"
          :max="MAGIC_CUBE_PIVOT.cameraY.max"
          :step="MAGIC_CUBE_PIVOT.cameraY.step"
          :value="config.cameraY"
          @input="onCameraInput('cameraY', $event)"
        />
        <output class="pivot-dock__value">{{ config.cameraY.toFixed(2) }}</output>
      </label>

      <label class="pivot-dock__row">
        <span class="pivot-dock__label">Cam Z</span>
        <input
          type="range"
          :min="MAGIC_CUBE_PIVOT.cameraZ.min"
          :max="MAGIC_CUBE_PIVOT.cameraZ.max"
          :step="MAGIC_CUBE_PIVOT.cameraZ.step"
          :value="config.cameraZ"
          @input="onCameraInput('cameraZ', $event)"
        />
        <output class="pivot-dock__value">{{ config.cameraZ.toFixed(2) }}</output>
      </label>

      <button type="button" class="pivot-dock__reset" @click="resetView">
        Repor vista padrão
      </button>

      <div class="pivot-dock__export">
        <p class="pivot-dock__export-hint">
          Ajuste o ângulo, copie e fixe os defaults antes do build WP.
        </p>
        <button type="button" class="pivot-dock__copy" @click="copyViewReference">
          {{ copyFeedback || 'Copiar parâmetros da vista' }}
        </button>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.pivot-dock {
  position: fixed;
  top: clamp(1rem, 3vw, 1.5rem);
  right: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: min(280px, calc(100vw - 2.5rem));
  max-height: min(82vh, 620px);
  overflow-y: auto;
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  background: rgba(8, 8, 10, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.pivot-dock--hidden {
  width: auto;
  max-width: min(280px, calc(100vw - 2.5rem));
  padding: 0.55rem 0.85rem;
  max-height: none;
  overflow: hidden;
}

.pivot-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  text-align: left;
}

.pivot-dock__title {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.pivot-dock__toggle-label {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}

.pivot-dock__body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.pivot-dock__hint {
  margin: 0;
  font-size: 0.62rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.42);
}

.pivot-dock__section {
  margin: 0.35rem 0 0;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
}

.pivot-dock__row {
  display: grid;
  grid-template-columns: 4.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

.pivot-dock__label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.72);
}

.pivot-dock__row input[type='range'] {
  width: 100%;
  height: 4px;
  accent-color: var(--fracto-brand);
  cursor: pointer;
}

.pivot-dock__value {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  min-width: 2.8rem;
  text-align: right;
}

.pivot-dock__reset {
  margin-top: 0.25rem;
  width: 100%;
  padding: 0.4rem 0.65rem;
  font-size: 0.66rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
}

.pivot-dock__reset:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

.pivot-dock__export {
  margin-top: 0.35rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pivot-dock__export-hint {
  margin: 0;
  font-size: 0.62rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.42);
}

.pivot-dock__copy {
  width: 100%;
  padding: 0.45rem 0.65rem;
  font-size: 0.68rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(245, 94, 29, 0.18);
  border: 1px solid rgba(245, 94, 29, 0.35);
  border-radius: 8px;
  cursor: pointer;
}

.pivot-dock__copy:hover {
  background: rgba(245, 94, 29, 0.28);
  border-color: rgba(245, 94, 29, 0.5);
}

@media (max-width: 899px) {
  .pivot-dock:not(.pivot-dock--hidden) {
    top: clamp(3.5rem, 8vw, 4.25rem);
    left: clamp(1rem, 4vw, 1.5rem);
    right: auto;
  }
}
</style>
