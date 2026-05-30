<script setup lang="ts">
import { ref, watch } from 'vue'
import { normalizeHexColor } from '../lib/colorHex'
import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  MAGIC_CUBE_BEVEL,
  type MagicCubeConfig,
} from '../lib/magicCubeConfig'

const config = defineModel<MagicCubeConfig>('config', {
  default: () => ({ ...DEFAULT_MAGIC_CUBE_CONFIG }),
})

const cubeHexInput = ref(config.value.cubeColor)
const accentHexInput = ref(config.value.accentColor)

watch(
  () => config.value.cubeColor,
  (c) => {
    cubeHexInput.value = c
  },
)

watch(
  () => config.value.accentColor,
  (c) => {
    accentHexInput.value = c
  },
)

function patch(partial: Partial<MagicCubeConfig>) {
  config.value = { ...config.value, ...partial }
}

function onBevelInput(event: Event) {
  patch({ bevelRadius: Number((event.target as HTMLInputElement).value) })
}

function onCubeColorPicker(input: string) {
  patch({ cubeColor: input })
}

function onAccentColorPicker(input: string) {
  patch({ accentColor: input })
}

function onCubeHexBlur() {
  const normalized = normalizeHexColor(cubeHexInput.value)
  if (normalized) {
    patch({ cubeColor: normalized })
  } else {
    cubeHexInput.value = config.value.cubeColor
  }
}

function onAccentHexBlur() {
  const normalized = normalizeHexColor(accentHexInput.value)
  if (normalized) {
    patch({ accentColor: normalized })
  } else {
    accentHexInput.value = config.value.accentColor
  }
}
</script>

<template>
  <aside class="cube-dock" aria-label="Controles do cubo mágico">
    <p class="cube-dock__title">Cubo mágico</p>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Bevel</span>
      <input
        type="range"
        :min="MAGIC_CUBE_BEVEL.min"
        :max="MAGIC_CUBE_BEVEL.max"
        :step="MAGIC_CUBE_BEVEL.step"
        :value="config.bevelRadius"
        @input="onBevelInput"
      />
      <output class="cube-dock__value">{{ config.bevelRadius.toFixed(3) }}</output>
    </label>

    <div class="cube-dock__row cube-dock__row--color">
      <span class="cube-dock__label">Cor cubos</span>
      <label class="cube-dock__swatch">
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
        class="cube-dock__hex"
        spellcheck="false"
        maxlength="7"
        aria-label="Cor dos cubos em hexadecimal"
        @blur="onCubeHexBlur"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
    </div>

    <div class="cube-dock__row cube-dock__row--color">
      <span class="cube-dock__label">Cor destaque</span>
      <label class="cube-dock__swatch">
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
        class="cube-dock__hex"
        spellcheck="false"
        maxlength="7"
        aria-label="Cor do destaque em hexadecimal"
        @blur="onAccentHexBlur"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
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

.cube-dock {
  position: fixed;
  left: 1.25rem;
  bottom: 1.35rem;
  z-index: 10001;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  width: min(280px, calc(100vw - 2.5rem));
  padding: 0.85rem 0.95rem;
  border-radius: 14px;
  background: rgba(8, 8, 10, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  pointer-events: auto;
}

.cube-dock__title {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.cube-dock__row {
  display: grid;
  grid-template-columns: 5.5rem 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

.cube-dock__row--color {
  grid-template-columns: 5.5rem auto 1fr;
}

.cube-dock__label {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.72);
}

.cube-dock__row input[type='range'] {
  width: 100%;
  height: 4px;
  accent-color: var(--fracto-brand);
  cursor: pointer;
}

.cube-dock__value {
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.55);
  min-width: 2.6rem;
  text-align: right;
}

.cube-dock__swatch input[type='color'] {
  display: block;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.cube-dock__hex {
  width: 100%;
  padding: 0.3rem 0.45rem;
  font-family: ui-monospace, monospace;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

.cube-dock__hex:focus {
  outline: none;
  border-color: var(--fracto-brand-border);
}
</style>
