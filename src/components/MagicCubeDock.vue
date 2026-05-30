<script setup lang="ts">
import { ref, watch } from 'vue'
import { normalizeHexColor } from '../lib/colorHex'
import {
  DEFAULT_MAGIC_CUBE_CONFIG,
  MAGIC_CUBE_BEVEL,
  MAGIC_CUBE_MATERIAL,
  type MagicCubeConfig,
  type MagicCubeMaterialConfig,
} from '../lib/magicCubeConfig'

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

const cubeHexInput = ref(props.config.cubeColor)
const accentHexInput = ref(props.config.accentColor)
const materialEditorExpanded = ref(true)

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

function patch(partial: Partial<MagicCubeConfig>) {
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
</script>

<template>
  <aside
    class="cube-dock"
    :class="{ 'cube-dock--collapsed': !materialEditorExpanded }"
    aria-label="Controles do cubo mágico"
  >
    <div class="cube-dock__header">
      <p class="cube-dock__title">Cubo mágico</p>
      <button
        type="button"
        class="cube-dock__toggle"
        :aria-expanded="materialEditorExpanded"
        aria-controls="cube-dock-materials"
        @click="toggleMaterialEditor"
      >
        {{ materialEditorExpanded ? 'Minimizar' : 'Materiais' }}
      </button>
    </div>

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
        @input="onCubeHexInput"
        @blur="onCubeHexBlur"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
    </div>

    <div
      v-show="materialEditorExpanded"
      id="cube-dock-materials"
      class="cube-dock__materials"
    >
    <p class="cube-dock__section">Material preto</p>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Rugosidade</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.roughness.min"
        :max="MAGIC_CUBE_MATERIAL.roughness.max"
        :step="MAGIC_CUBE_MATERIAL.roughness.step"
        :value="config.cubeMaterial.roughness"
        @input="onMaterialInput('cubeMaterial', 'roughness', $event)"
      />
      <output class="cube-dock__value">{{ config.cubeMaterial.roughness.toFixed(2) }}</output>
    </label>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Verniz</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.clearcoat.min"
        :max="MAGIC_CUBE_MATERIAL.clearcoat.max"
        :step="MAGIC_CUBE_MATERIAL.clearcoat.step"
        :value="config.cubeMaterial.clearcoat"
        @input="onMaterialInput('cubeMaterial', 'clearcoat', $event)"
      />
      <output class="cube-dock__value">{{ config.cubeMaterial.clearcoat.toFixed(2) }}</output>
    </label>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Reflexo</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.envMapIntensity.min"
        :max="MAGIC_CUBE_MATERIAL.envMapIntensity.max"
        :step="MAGIC_CUBE_MATERIAL.envMapIntensity.step"
        :value="config.cubeMaterial.envMapIntensity"
        @input="onMaterialInput('cubeMaterial', 'envMapIntensity', $event)"
      />
      <output class="cube-dock__value">{{ config.cubeMaterial.envMapIntensity.toFixed(2) }}</output>
    </label>

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
        @input="onAccentHexInput"
        @blur="onAccentHexBlur"
        @keydown.enter="($event.target as HTMLInputElement).blur()"
      />
    </div>

    <p class="cube-dock__section">Material laranja</p>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Rugosidade</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.roughness.min"
        :max="MAGIC_CUBE_MATERIAL.roughness.max"
        :step="MAGIC_CUBE_MATERIAL.roughness.step"
        :value="config.accentMaterial.roughness"
        @input="onMaterialInput('accentMaterial', 'roughness', $event)"
      />
      <output class="cube-dock__value">{{ config.accentMaterial.roughness.toFixed(2) }}</output>
    </label>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Verniz</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.clearcoat.min"
        :max="MAGIC_CUBE_MATERIAL.clearcoat.max"
        :step="MAGIC_CUBE_MATERIAL.clearcoat.step"
        :value="config.accentMaterial.clearcoat"
        @input="onMaterialInput('accentMaterial', 'clearcoat', $event)"
      />
      <output class="cube-dock__value">{{ config.accentMaterial.clearcoat.toFixed(2) }}</output>
    </label>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Reflexo</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.envMapIntensity.min"
        :max="MAGIC_CUBE_MATERIAL.envMapIntensity.max"
        :step="MAGIC_CUBE_MATERIAL.envMapIntensity.step"
        :value="config.accentMaterial.envMapIntensity"
        @input="onMaterialInput('accentMaterial', 'envMapIntensity', $event)"
      />
      <output class="cube-dock__value">{{ config.accentMaterial.envMapIntensity.toFixed(2) }}</output>
    </label>

    <label class="cube-dock__row">
      <span class="cube-dock__label">Emissão</span>
      <input
        type="range"
        :min="MAGIC_CUBE_MATERIAL.emissiveIntensity.min"
        :max="MAGIC_CUBE_MATERIAL.emissiveIntensity.max"
        :step="MAGIC_CUBE_MATERIAL.emissiveIntensity.step"
        :value="config.accentMaterial.emissiveIntensity"
        @input="onMaterialInput('accentMaterial', 'emissiveIntensity', $event)"
      />
      <output class="cube-dock__value">{{ config.accentMaterial.emissiveIntensity.toFixed(2) }}</output>
    </label>
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
}

@media (max-width: 900px) {
  .cube-dock {
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    width: min(300px, calc(100vw - 2rem));
  }
}

.cube-dock--collapsed {
  max-height: none;
  overflow: visible;
}

.cube-dock__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cube-dock__title {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
}

.cube-dock__toggle {
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
}

.cube-dock__toggle:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.22);
}

.cube-dock__materials {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.cube-dock__section {
  margin: 0.35rem 0 0;
  padding-top: 0.45rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.38);
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
