<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { normalizeHexColor } from '../lib/colorHex'
import {
  DEFAULT_FRACTO_LOGO_CONFIG,
  FRACTO_LOGO_BEVEL,
  FRACTO_LOGO_MATERIAL,
  type FractoLogoConfig,
  type FractoLogoMaterialConfig,
} from '../lib/fractoLogoConfig'
import { formatFractoLogoCopyPayload } from '../lib/fractoLogoReference'

const EDGE_HIDE_THRESHOLD = 44
const DRAG_CLICK_THRESHOLD = 6

const props = withDefaults(
  defineProps<{
    config?: FractoLogoConfig
    apply?: (partial: Partial<FractoLogoConfig>) => void
  }>(),
  {
    config: () => ({ ...DEFAULT_FRACTO_LOGO_CONFIG }),
    apply: () => {},
  },
)

const cubeHexInput = ref(props.config.cubeColor)
const accentHexInput = ref(props.config.accentColor)
const panelOpen = ref(false)
const materialEditorExpanded = ref(true)
const dockRef = ref<HTMLElement | null>(null)
const dockPos = ref<{ x: number; y: number } | null>(null)
const isDragging = ref(false)
const copyFeedback = ref('')
let copyTimer = 0

const copyPayload = computed(() => formatFractoLogoCopyPayload(props.config))

const dockStyle = computed(() => {
  if (!panelOpen.value || !dockPos.value) return undefined
  return {
    left: `${dockPos.value.x}px`,
    top: `${dockPos.value.y}px`,
    bottom: 'auto',
    transform: 'none',
  }
})

function clampDockPosition(x: number, y: number): { x: number; y: number } {
  const el = dockRef.value
  if (!el) return { x, y }

  const margin = 8
  const maxX = window.innerWidth - el.offsetWidth - margin
  const maxY = window.innerHeight - el.offsetHeight - margin

  return {
    x: Math.min(Math.max(margin, x), Math.max(margin, maxX)),
    y: Math.min(Math.max(margin, y), Math.max(margin, maxY)),
  }
}

function shouldHideAtEdge(x: number, y: number, width: number, height: number): boolean {
  return (
    x <= EDGE_HIDE_THRESHOLD
    || y <= EDGE_HIDE_THRESHOLD
    || x + width >= window.innerWidth - EDGE_HIDE_THRESHOLD
    || y + height >= window.innerHeight - EDGE_HIDE_THRESHOLD
  )
}

function openPanel() {
  panelOpen.value = true
}

function hidePanel() {
  panelOpen.value = false
  dockPos.value = null
  isDragging.value = false
}

function onHeaderPointerDown(event: PointerEvent) {
  if ((event.target as HTMLElement).closest('.logo-dock__toggle')) return

  const el = dockRef.value
  if (!el) return

  event.preventDefault()

  const startX = event.clientX
  const startY = event.clientY

  if (!panelOpen.value) {
    const onOpen = (endEvent: PointerEvent) => {
      el.removeEventListener('pointerup', onOpen)
      el.removeEventListener('pointercancel', onOpen)
      const moved = Math.hypot(endEvent.clientX - startX, endEvent.clientY - startY)
      if (moved <= DRAG_CLICK_THRESHOLD) openPanel()
    }

    el.addEventListener('pointerup', onOpen)
    el.addEventListener('pointercancel', onOpen)
    return
  }

  const rect = el.getBoundingClientRect()
  if (!dockPos.value) {
    dockPos.value = clampDockPosition(rect.left, rect.top)
  }

  const originX = dockPos.value.x
  const originY = dockPos.value.y

  isDragging.value = true
  el.setPointerCapture(event.pointerId)

  const onMove = (moveEvent: PointerEvent) => {
    if (moveEvent.pointerId !== event.pointerId) return
    dockPos.value = {
      x: originX + moveEvent.clientX - startX,
      y: originY + moveEvent.clientY - startY,
    }
  }

  const onEnd = (endEvent: PointerEvent) => {
    if (endEvent.pointerId !== event.pointerId) return
    isDragging.value = false
    el.releasePointerCapture(endEvent.pointerId)
    el.removeEventListener('pointermove', onMove)
    el.removeEventListener('pointerup', onEnd)
    el.removeEventListener('pointercancel', onEnd)

    if (!dockPos.value) return

    const width = el.offsetWidth
    const height = el.offsetHeight
    const { x, y } = dockPos.value

    if (shouldHideAtEdge(x, y, width, height)) {
      hidePanel()
      return
    }

    dockPos.value = clampDockPosition(x, y)
  }

  el.addEventListener('pointermove', onMove)
  el.addEventListener('pointerup', onEnd)
  el.addEventListener('pointercancel', onEnd)
}

function toggleMaterialEditor() {
  materialEditorExpanded.value = !materialEditorExpanded.value
}

watch(
  () => props.config.cubeColor,
  (c) => {
    cubeHexInput.value = c
  },
)

watch(
  () => props.config.accentColor,
  (c) => {
    accentHexInput.value = c
  },
)

function patch(partial: Partial<FractoLogoConfig>) {
  props.apply(partial)
}

function onBevelInput(event: Event) {
  patch({ bevelRadius: Number((event.target as HTMLInputElement).value) })
}

function onCubeColorPicker(input: string) {
  const normalized = normalizeHexColor(input)
  if (normalized) patch({ cubeColor: normalized })
}

function onAccentColorPicker(input: string) {
  const normalized = normalizeHexColor(input)
  if (normalized) patch({ accentColor: normalized })
}

function onCubeHexInput(event: Event) {
  const normalized = normalizeHexColor((event.target as HTMLInputElement).value)
  if (normalized) patch({ cubeColor: normalized })
}

function onAccentHexInput(event: Event) {
  const normalized = normalizeHexColor((event.target as HTMLInputElement).value)
  if (normalized) patch({ accentColor: normalized })
}

function onCubeHexBlur() {
  const normalized = normalizeHexColor(cubeHexInput.value)
  if (normalized) {
    patch({ cubeColor: normalized })
  } else {
    cubeHexInput.value = props.config.cubeColor
  }
}

function onAccentHexBlur() {
  const normalized = normalizeHexColor(accentHexInput.value)
  if (normalized) {
    patch({ accentColor: normalized })
  } else {
    accentHexInput.value = props.config.accentColor
  }
}

function onMaterialInput(
  target: 'cubeMaterial' | 'accentMaterial',
  key: keyof FractoLogoMaterialConfig,
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

onBeforeUnmount(() => {
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <aside
    ref="dockRef"
    class="logo-dock"
    :class="{
      'logo-dock--hidden': !panelOpen,
      'logo-dock--materials-collapsed': !materialEditorExpanded,
      'logo-dock--dragged': panelOpen && dockPos !== null,
      'logo-dock--dragging': isDragging,
    }"
    :style="dockStyle"
    aria-label="Editor de Materiais"
  >
    <div
      class="logo-dock__header"
      :class="{ 'logo-dock__header--peek': !panelOpen }"
      @pointerdown="onHeaderPointerDown"
    >
      <p class="logo-dock__title">Editor de Materiais</p>
      <button
        v-if="panelOpen"
        type="button"
        class="logo-dock__toggle"
        :aria-expanded="materialEditorExpanded"
        aria-controls="logo-dock-materials"
        @click="toggleMaterialEditor"
      >
        {{ materialEditorExpanded ? 'Minimizar' : 'Materiais' }}
      </button>
      <span v-else class="logo-dock__peek-hint" aria-hidden="true">Abrir</span>
    </div>

    <div v-show="panelOpen" class="logo-dock__body">
      <label class="logo-dock__row">
        <span class="logo-dock__label">Bevel</span>
        <input
          type="range"
          :min="FRACTO_LOGO_BEVEL.min"
          :max="FRACTO_LOGO_BEVEL.max"
          :step="FRACTO_LOGO_BEVEL.step"
          :value="config.bevelRadius"
          @input="onBevelInput"
        />
        <output class="logo-dock__value">{{ config.bevelRadius.toFixed(3) }}</output>
      </label>

      <div class="logo-dock__row logo-dock__row--color">
        <span class="logo-dock__label">Cor cubos</span>
        <label class="logo-dock__swatch">
          <span class="sr-only">Cor dos cubos</span>
          <input
            type="color"
            :value="config.cubeColor"
            @input="onCubeColorPicker(($event.target as HTMLInputElement).value)"
          />
        </label>
        <input
          v-model="cubeHexInput"
          type="text"
          class="logo-dock__hex"
          spellcheck="false"
          maxlength="7"
          aria-label="Cor dos cubos em hexadecimal"
          @input="onCubeHexInput"
          @blur="onCubeHexBlur"
          @keydown.enter="($event.target as HTMLInputElement).blur()"
        />
      </div>

      <div
        v-show="materialEditorExpanded"
        id="logo-dock-materials"
        class="logo-dock__materials"
      >
        <p class="logo-dock__section">Material preto</p>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Rugosidade</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.roughness.min"
            :max="FRACTO_LOGO_MATERIAL.roughness.max"
            :step="FRACTO_LOGO_MATERIAL.roughness.step"
            :value="config.cubeMaterial.roughness"
            @input="onMaterialInput('cubeMaterial', 'roughness', $event)"
          />
          <output class="logo-dock__value">{{ config.cubeMaterial.roughness.toFixed(2) }}</output>
        </label>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Verniz</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.clearcoat.min"
            :max="FRACTO_LOGO_MATERIAL.clearcoat.max"
            :step="FRACTO_LOGO_MATERIAL.clearcoat.step"
            :value="config.cubeMaterial.clearcoat"
            @input="onMaterialInput('cubeMaterial', 'clearcoat', $event)"
          />
          <output class="logo-dock__value">{{ config.cubeMaterial.clearcoat.toFixed(2) }}</output>
        </label>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Reflexo</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.envMapIntensity.min"
            :max="FRACTO_LOGO_MATERIAL.envMapIntensity.max"
            :step="FRACTO_LOGO_MATERIAL.envMapIntensity.step"
            :value="config.cubeMaterial.envMapIntensity"
            @input="onMaterialInput('cubeMaterial', 'envMapIntensity', $event)"
          />
          <output class="logo-dock__value">{{ config.cubeMaterial.envMapIntensity.toFixed(2) }}</output>
        </label>

        <div class="logo-dock__row logo-dock__row--color">
          <span class="logo-dock__label">Cor destaque</span>
          <label class="logo-dock__swatch">
            <span class="sr-only">Cor do cubo de destaque</span>
            <input
              type="color"
              :value="config.accentColor"
              @input="onAccentColorPicker(($event.target as HTMLInputElement).value)"
            />
          </label>
          <input
            v-model="accentHexInput"
            type="text"
            class="logo-dock__hex"
            spellcheck="false"
            maxlength="7"
            aria-label="Cor do destaque em hexadecimal"
            @input="onAccentHexInput"
            @blur="onAccentHexBlur"
            @keydown.enter="($event.target as HTMLInputElement).blur()"
          />
        </div>

        <p class="logo-dock__section">Material laranja</p>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Rugosidade</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.roughness.min"
            :max="FRACTO_LOGO_MATERIAL.roughness.max"
            :step="FRACTO_LOGO_MATERIAL.roughness.step"
            :value="config.accentMaterial.roughness"
            @input="onMaterialInput('accentMaterial', 'roughness', $event)"
          />
          <output class="logo-dock__value">{{ config.accentMaterial.roughness.toFixed(2) }}</output>
        </label>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Verniz</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.clearcoat.min"
            :max="FRACTO_LOGO_MATERIAL.clearcoat.max"
            :step="FRACTO_LOGO_MATERIAL.clearcoat.step"
            :value="config.accentMaterial.clearcoat"
            @input="onMaterialInput('accentMaterial', 'clearcoat', $event)"
          />
          <output class="logo-dock__value">{{ config.accentMaterial.clearcoat.toFixed(2) }}</output>
        </label>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Reflexo</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.envMapIntensity.min"
            :max="FRACTO_LOGO_MATERIAL.envMapIntensity.max"
            :step="FRACTO_LOGO_MATERIAL.envMapIntensity.step"
            :value="config.accentMaterial.envMapIntensity"
            @input="onMaterialInput('accentMaterial', 'envMapIntensity', $event)"
          />
          <output class="logo-dock__value">{{ config.accentMaterial.envMapIntensity.toFixed(2) }}</output>
        </label>

        <label class="logo-dock__row">
          <span class="logo-dock__label">Emissão</span>
          <input
            type="range"
            :min="FRACTO_LOGO_MATERIAL.emissiveIntensity.min"
            :max="FRACTO_LOGO_MATERIAL.emissiveIntensity.max"
            :step="FRACTO_LOGO_MATERIAL.emissiveIntensity.step"
            :value="config.accentMaterial.emissiveIntensity"
            @input="onMaterialInput('accentMaterial', 'emissiveIntensity', $event)"
          />
          <output class="logo-dock__value">{{ config.accentMaterial.emissiveIntensity.toFixed(2) }}</output>
        </label>
      </div>

      <div class="logo-dock__export">
        <p class="logo-dock__export-hint">
          Copie os materiais aprovados para colar no Cursor, fixar os defaults e depois gerar o embed WP Bakery (como grid-background).
        </p>
        <button type="button" class="logo-dock__copy" @click="copyDefaultsReference">
          {{ copyFeedback || 'Copiar defaults dos materiais' }}
        </button>
      </div>
    </div>
  </aside>
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

.logo-dock {
  position: fixed;
  left: 1.25rem;
  bottom: 1.35rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: min(300px, calc(100vw - 2.5rem));
  max-height: min(78vh, 640px);
  overflow-y: auto;
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  background: rgba(8, 8, 10, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
  touch-action: pan-y;
  transition:
    transform 0.28s ease,
    left 0.28s ease,
    top 0.28s ease,
    bottom 0.28s ease,
    border-radius 0.28s ease,
    padding 0.28s ease;
}

.logo-dock--hidden {
  left: 50%;
  bottom: 0;
  width: min(280px, calc(100vw - 2rem));
  max-height: none;
  overflow: hidden;
  padding: 0.55rem 0.95rem 0.65rem;
  border-radius: 14px 14px 0 0;
  border-bottom: none;
  transform: translateX(-50%);
  touch-action: auto;
}

.logo-dock--hidden:not(.logo-dock--dragging) {
  transform: translate(-50%, calc(100% - 2.35rem));
}

@media (max-width: 899px) {
  .logo-dock:not(.logo-dock--hidden):not(.logo-dock--dragged) {
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    width: min(300px, calc(100vw - 2rem));
  }
}

.logo-dock--dragged {
  touch-action: none;
}

.logo-dock--dragging {
  transition: none;
}

.logo-dock--materials-collapsed {
  max-height: none;
}

.logo-dock__body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.logo-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: -0.15rem -0.2rem 0;
  padding: 0.15rem 0.2rem 0.35rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: grab;
  touch-action: none;
  user-select: none;
}

.logo-dock__header--peek {
  margin: 0;
  padding: 0;
  border-bottom: none;
  cursor: pointer;
}

.logo-dock--dragging .logo-dock__header {
  cursor: grabbing;
}

.logo-dock__title {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.logo-dock__peek-hint {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}

.logo-dock__toggle {
  flex-shrink: 0;
  padding: 0.28rem 0.55rem;
  font-size: 0.62rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.78);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  cursor: pointer;
  touch-action: auto;
}

.logo-dock__toggle:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.22);
}

.logo-dock__materials {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.logo-dock__section {
  margin: 0.35rem 0 0;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
}

.logo-dock__row {
  display: grid;
  grid-template-columns: 5.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

.logo-dock__row--color {
  grid-template-columns: 5.5rem auto 1fr;
}

.logo-dock__label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.72);
}

.logo-dock__row input[type='range'] {
  width: 100%;
  height: 4px;
  accent-color: var(--fracto-brand);
  cursor: pointer;
}

.logo-dock__value {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  min-width: 2.6rem;
  text-align: right;
}

.logo-dock__swatch input[type='color'] {
  display: block;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.logo-dock__hex {
  width: 100%;
  padding: 0.3rem 0.45rem;
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.logo-dock__hex:focus {
  outline: none;
  border-color: var(--fracto-brand-border);
}

.logo-dock__export {
  margin-top: 0.35rem;
  padding-top: 0.65rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.logo-dock__export-hint {
  margin: 0;
  font-size: 0.62rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.42);
}

.logo-dock__copy {
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

.logo-dock__copy:hover {
  background: rgba(245, 94, 29, 0.28);
  border-color: rgba(245, 94, 29, 0.5);
}
</style>
