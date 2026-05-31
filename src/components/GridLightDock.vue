<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  clampGrid,
  DEFAULT_GRID_CONFIG,
  type GridConfig,
} from '../lib/gridConfig'
import { normalizeHexColor } from '../lib/colorHex'
import { buildV4Lighting, V4_LIGHT_INTENSITY } from '../lib/gridLightingV4'
import type { SceneLightingConfig } from '../lib/gridLighting'
import {
  formatV4AiBriefing,
  formatV4SceneCode,
  formatV4ShareUrl,
} from '../lib/sceneReferenceV4'
import SceneReferenceBubble from './SceneReferenceBubble.vue'

const props = defineProps<{
  lighting: SceneLightingConfig
  grid: GridConfig
  showCubeColor?: boolean
  cubeColor?: string
}>()

const emit = defineEmits<{
  'update:lighting': [SceneLightingConfig]
  'update:grid': [GridConfig]
  'update:cubeColor': [string]
  applyGrid: [GridConfig]
}>()

const intensity = ref(props.lighting.mouse.intensity)
const colorHex = ref(props.lighting.mouse.color)
const colorHexInput = ref(props.lighting.mouse.color)
const cubeColorHex = ref(props.cubeColor ?? '#fafafa')
const cubeColorHexInput = ref(props.cubeColor ?? '#fafafa')

function emitCubeColor(raw: string) {
  const normalized = normalizeHexColor(raw)
  if (!normalized) return
  cubeColorHex.value = normalized
  cubeColorHexInput.value = normalized
  emit('update:cubeColor', normalized)
}

function onCubeColorPicker(event: Event) {
  emitCubeColor((event.target as HTMLInputElement).value)
}

function onCubeColorHexInput(event: Event) {
  const raw = (event.target as HTMLInputElement).value
  cubeColorHexInput.value = raw
  emitCubeColor(raw)
}

const GRID_ASPECT = DEFAULT_GRID_CONFIG.rows / DEFAULT_GRID_CONFIG.cols

const sceneCode = computed(() => formatV4SceneCode(props.lighting, props.grid))
const aiBriefing = computed(() => formatV4AiBriefing(props.lighting, props.grid))
const shareUrl = computed(() => formatV4ShareUrl(props.lighting, props.grid))

const dockStyle = computed(() => ({
  '--dock-accent': props.lighting.mouse.color,
}))

watch(
  () => props.lighting.mouse.color,
  (c) => {
    colorHex.value = c
    colorHexInput.value = c
    intensity.value = props.lighting.mouse.intensity
  },
)

watch(
  () => props.cubeColor,
  (c) => {
    if (!c) return
    cubeColorHex.value = c
    cubeColorHexInput.value = c
  },
)

function pushLighting() {
  const normalized = normalizeHexColor(colorHexInput.value) ?? colorHex.value
  colorHex.value = normalized
  colorHexInput.value = normalized
  emit('update:lighting', buildV4Lighting(intensity.value, normalized))
}

function onIntensityInput(event: Event) {
  intensity.value = Number((event.target as HTMLInputElement).value)
  pushLighting()
}

function onColorPicker(input: string) {
  colorHex.value = input
  colorHexInput.value = input
  pushLighting()
}

function onColorHexBlur() {
  const normalized = normalizeHexColor(colorHexInput.value)
  if (normalized) {
    colorHex.value = normalized
    pushLighting()
  } else {
    colorHexInput.value = colorHex.value
  }
}

function onCubeColorHexBlur() {
  const normalized = normalizeHexColor(cubeColorHexInput.value)
  if (normalized) {
    emitCubeColor(normalized)
  } else {
    cubeColorHexInput.value = cubeColorHex.value
  }
}

function setGridDensity(cols: number) {
  const rows = Math.round(cols * GRID_ASPECT)
  const clamped = clampGrid({ cols, rows })
  emit('update:grid', clamped)
  emit('applyGrid', clamped)
}

function bumpGrid(delta: number) {
  setGridDensity(props.grid.cols + delta)
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
  } else if (event.key === ']') {
    event.preventDefault()
    bumpGrid(1)
  }
}

onMounted(() => {
  window.addEventListener('keydown', onGlobalKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})
</script>

<template>
  <div class="light-dock-wrap" :class="{ 'light-dock-wrap--stacked': showCubeColor }">
    <div class="light-dock" :style="dockStyle" aria-label="Controles de luz">
      <span v-if="showCubeColor" class="light-dock__label">Luz</span>
      <label class="light-dock__color" title="Cor da luz">
        <span class="sr-only">Cor da luz</span>
        <input
          type="color"
          :value="colorHex"
          @input="onColorPicker(($event.target as HTMLInputElement).value)"
        />
      </label>

      <input
        v-model="colorHexInput"
        type="text"
        class="light-dock__hex"
        spellcheck="false"
        maxlength="7"
        aria-label="Cor em hexadecimal"
        @blur="onColorHexBlur"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />

      <label class="light-dock__slider">
        <span class="sr-only">Intensidade da luz</span>
        <input
          type="range"
          :min="V4_LIGHT_INTENSITY.min"
          :max="V4_LIGHT_INTENSITY.max"
          :step="V4_LIGHT_INTENSITY.step"
          :value="intensity"
          @input="onIntensityInput"
        />
        <output class="light-dock__value">{{ intensity.toFixed(2) }}</output>
      </label>

      <SceneReferenceBubble
        v-if="!showCubeColor"
        :scene-code="sceneCode"
        :ai-briefing="aiBriefing"
        :share-url="shareUrl"
      />
    </div>

    <div
      v-if="showCubeColor"
      class="light-dock light-dock--cube"
      :style="{ '--dock-accent': cubeColorHex }"
      aria-label="Cor dos quadrados"
    >
      <span class="light-dock__label">Quadrado</span>
      <label class="light-dock__color" title="Cor do quadrado">
        <span class="sr-only">Cor do quadrado</span>
        <input
          type="color"
          :value="cubeColorHex"
          @input="onCubeColorPicker"
          @change="onCubeColorPicker"
        />
      </label>

      <input
        :value="cubeColorHexInput"
        type="text"
        class="light-dock__hex"
        spellcheck="false"
        maxlength="7"
        aria-label="Cor do quadrado em hexadecimal"
        @input="onCubeColorHexInput"
        @blur="onCubeColorHexBlur"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />

      <SceneReferenceBubble
        :scene-code="sceneCode"
        :ai-briefing="aiBriefing"
        :share-url="shareUrl"
      />
    </div>
  </div>

  <p class="light-dock__hint" :class="{ 'light-dock__hint--stacked': showCubeColor }" aria-hidden>
    <kbd>[</kbd> menos cubos · <kbd>]</kbd> mais cubos
  </p>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.light-dock-wrap {
  position: fixed;
  left: 1.25rem;
  bottom: 1.35rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-width: min(420px, calc(100vw - 1.5rem));
  pointer-events: none;
}

.light-dock-wrap--stacked {
  max-width: min(460px, calc(100vw - 1.5rem));
}

.light-dock {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.45rem 0.55rem 0.45rem 0.5rem;
  border-radius: 999px;
  background: rgba(8, 8, 10, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.light-dock__label {
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
  padding-left: 0.15rem;
  flex-shrink: 0;
}

.light-dock__color input[type='color'] {
  display: block;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.light-dock__hex {
  width: 4.75rem;
  padding: 0.3rem 0.45rem;
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.light-dock__hex:focus {
  outline: none;
  border-color: var(--dock-accent, rgba(255, 255, 255, 0.35));
}

.light-dock__slider {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
}

.light-dock__slider input[type='range'] {
  flex: 1;
  min-width: 80px;
  height: 4px;
  accent-color: var(--dock-accent, #c4d0e8);
  cursor: pointer;
}

.light-dock__value {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  min-width: 2.2rem;
  text-align: right;
}

.light-dock__hint {
  position: fixed;
  left: 0.75rem;
  bottom: 3.35rem;
  z-index: 10000;
  margin: 0;
  font-size: 0.62rem;
  color: rgba(255, 255, 255, 0.28);
  pointer-events: none;
  user-select: none;
}

.light-dock__hint kbd {
  font-family: ui-monospace, monospace;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.light-dock__hint--stacked {
  bottom: 5.15rem;
}
</style>
