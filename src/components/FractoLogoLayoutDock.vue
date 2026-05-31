<script setup lang="ts">
import { ref } from 'vue'
import {
  DEFAULT_FRACTO_LOGO_CONFIG,
  FRACTO_LOGO_LAYOUT,
  type FractoLogoConfig,
} from '../lib/fractoLogoConfig'

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

const panelOpen = ref(false)

function patch(partial: Partial<FractoLogoConfig>) {
  props.apply(partial)
}

function onScaleInput(event: Event) {
  patch({ scale: Number((event.target as HTMLInputElement).value) })
}

function onOffsetXInput(event: Event) {
  patch({ offsetX: Number((event.target as HTMLInputElement).value) })
}

function onOffsetYInput(event: Event) {
  patch({ offsetY: Number((event.target as HTMLInputElement).value) })
}

function resetLayout() {
  patch({
    scale: DEFAULT_FRACTO_LOGO_CONFIG.scale,
    offsetX: DEFAULT_FRACTO_LOGO_CONFIG.offsetX,
    offsetY: DEFAULT_FRACTO_LOGO_CONFIG.offsetY,
  })
}

function togglePanel() {
  panelOpen.value = !panelOpen.value
}
</script>

<template>
  <aside
    class="layout-dock"
    :class="{ 'layout-dock--hidden': !panelOpen }"
    aria-label="Alinhamento e tamanho do isotipo"
  >
    <button
      type="button"
      class="layout-dock__header"
      :aria-expanded="panelOpen"
      aria-controls="layout-dock-body"
      @click="togglePanel"
    >
      <span class="layout-dock__title">Alinhamento e tamanho</span>
      <span class="layout-dock__toggle-label">{{ panelOpen ? 'Fechar' : 'Abrir' }}</span>
    </button>

    <div v-show="panelOpen" id="layout-dock-body" class="layout-dock__body">
      <label class="layout-dock__row">
        <span class="layout-dock__label">Tamanho</span>
        <input
          type="range"
          :min="FRACTO_LOGO_LAYOUT.scale.min"
          :max="FRACTO_LOGO_LAYOUT.scale.max"
          :step="FRACTO_LOGO_LAYOUT.scale.step"
          :value="config.scale"
          @input="onScaleInput"
        />
        <output class="layout-dock__value">{{ config.scale.toFixed(2) }}</output>
      </label>

      <label class="layout-dock__row">
        <span class="layout-dock__label">Horizontal</span>
        <input
          type="range"
          :min="FRACTO_LOGO_LAYOUT.offsetX.min"
          :max="FRACTO_LOGO_LAYOUT.offsetX.max"
          :step="FRACTO_LOGO_LAYOUT.offsetX.step"
          :value="config.offsetX"
          @input="onOffsetXInput"
        />
        <output class="layout-dock__value">{{ config.offsetX.toFixed(2) }}</output>
      </label>

      <label class="layout-dock__row">
        <span class="layout-dock__label">Vertical</span>
        <input
          type="range"
          :min="FRACTO_LOGO_LAYOUT.offsetY.min"
          :max="FRACTO_LOGO_LAYOUT.offsetY.max"
          :step="FRACTO_LOGO_LAYOUT.offsetY.step"
          :value="config.offsetY"
          @input="onOffsetYInput"
        />
        <output class="layout-dock__value">{{ config.offsetY.toFixed(2) }}</output>
      </label>

      <button type="button" class="layout-dock__reset" @click="resetLayout">
        Repor posição e tamanho
      </button>
    </div>
  </aside>
</template>

<style scoped>
.layout-dock {
  position: fixed;
  top: clamp(1rem, 3vw, 1.5rem);
  left: clamp(1.25rem, 4vw, 2.5rem);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  width: min(280px, calc(100vw - 2.5rem));
  padding: 0.75rem 0.9rem;
  border-radius: 14px;
  background: rgba(8, 8, 10, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.layout-dock--hidden {
  width: auto;
  max-width: min(280px, calc(100vw - 2.5rem));
  padding: 0.55rem 0.85rem;
}

.layout-dock__header {
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

.layout-dock__title {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.layout-dock__toggle-label {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}

.layout-dock__body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding-top: 0.35rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.layout-dock__row {
  display: grid;
  grid-template-columns: 5.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

.layout-dock__label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.72);
}

.layout-dock__row input[type='range'] {
  width: 100%;
  height: 4px;
  accent-color: var(--fracto-brand);
  cursor: pointer;
}

.layout-dock__value {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  min-width: 2.6rem;
  text-align: right;
}

.layout-dock__reset {
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

.layout-dock__reset:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}

@media (max-width: 899px) {
  .layout-dock:not(.layout-dock--hidden) {
    top: clamp(3.5rem, 8vw, 4.25rem);
    right: clamp(1rem, 4vw, 1.5rem);
    left: auto;
    bottom: auto;
    transform: none;
  }
}
</style>
