<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef } from 'vue'
import { createGlbViewer, type GlbViewerState } from '../three/glbViewer'

const props = withDefaults(
  defineProps<{
    /** GLB servido em /public (ex.: /models/cubo-magico-4.glb) */
    defaultModel?: string
    /** Cena Three.js sem fundo — integra com background da página. */
    transparent?: boolean
    /** Sem borda, sombra, toolbar nem animação de “caixa”. */
    chromeless?: boolean
  }>(),
  {
    defaultModel: '/models/cubo-magico-4.glb',
    transparent: false,
    chromeless: false,
  },
)

const host = ref<HTMLElement | null>(null)
const viewer = shallowRef<ReturnType<typeof createGlbViewer> | null>(null)
const state = ref<GlbViewerState | null>(null)
const hasModel = ref(false)

onMounted(async () => {
  if (!host.value) return
  viewer.value = createGlbViewer(
    host.value,
    (s) => {
      state.value = s
      hasModel.value = s.loaded
    },
    { transparent: props.transparent, showGrid: !props.transparent },
  )

  if (!props.defaultModel) return
  viewer.value.setHeroPresentation(true)
  try {
    await viewer.value.loadUrl(props.defaultModel, 'Cubo mágico 4')
  } catch {
    /* erro em state */
  }
})

onUnmounted(() => viewer.value?.dispose())

async function onPick(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file || !viewer.value) return
  try {
    viewer.value.setHeroPresentation(true)
    await viewer.value.loadFile(file)
  } catch {
    /* erro em state */
  }
}

function onDragOver(ev: DragEvent) {
  if (!props.chromeless) ev.preventDefault()
}

function onDrop(ev: DragEvent) {
  if (props.chromeless) return
  ev.preventDefault()
  const file = ev.dataTransfer?.files?.[0]
  if (!file || !/\.(glb|gltf)$/i.test(file.name)) return
  viewer.value?.setHeroPresentation(true)
  void viewer.value?.loadFile(file)
}
</script>

<template>
  <div
    class="hero-glb"
    :class="{ 'hero-glb--chromeless': chromeless }"
    @dragover="onDragOver"
    @drop="onDrop"
  >
    <div
      class="hero-glb__frame"
      :class="{ 'has-model': hasModel && !chromeless, 'hero-glb__frame--bare': chromeless }"
    >
      <div ref="host" class="hero-glb__canvas" />

      <div
        v-if="!chromeless && !hasModel && !state?.loading && !defaultModel"
        class="hero-glb__empty"
      >
        <div class="hero-glb__icon" aria-hidden>
          <span /><i /><span class="accent" /><span /><i /><span /><span /><i />
        </div>
        <p>Insira o modelo 3D da sua escolha</p>
        <label class="hero-glb__btn">
          Carregar .glb
          <input type="file" accept=".glb,.gltf" hidden @change="onPick" />
        </label>
        <span class="hero-glb__hint">ou arraste o arquivo aqui</span>
      </div>

      <div
        v-if="state?.loading"
        class="hero-glb__loading"
        :class="{ 'hero-glb__loading--minimal': chromeless }"
      >
        <div class="hero-glb__bar" :style="{ width: `${(state.progress || 0) * 100}%` }" />
        <span>{{ Math.round((state.progress || 0) * 100) }}%</span>
      </div>

      <div
        v-if="state?.error && !state.loading && !hasModel"
        class="hero-glb__error"
      >
        {{ state.error }}
      </div>

      <div v-if="hasModel && !chromeless" class="hero-glb__toolbar">
        <label class="hero-glb__mini">
          Exposição
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.05"
            :value="state?.exposure ?? 1"
            @input="viewer?.setExposure(Number(($event.target as HTMLInputElement).value))"
          />
        </label>
        <label class="hero-glb__check">
          <input
            type="checkbox"
            :checked="state?.autoRotate ?? false"
            @change="viewer?.setAutoRotate(($event.target as HTMLInputElement).checked)"
          />
          Auto-rotate
        </label>
        <label class="hero-glb__mini hero-glb__replace">
          Trocar
          <input type="file" accept=".glb,.gltf" hidden @change="onPick" />
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-glb {
  width: 100%;
  height: 100%;
  min-height: 420px;
}

.hero-glb__frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  border-radius: 16px;
  border: 1px dashed rgba(255, 255, 255, 0.12);
  background: rgba(12, 12, 12, 0.6);
  overflow: hidden;
  animation: float 6s ease-in-out infinite;
}

.hero-glb__frame.has-model {
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(245, 94, 29, 0.08);
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.hero-glb__canvas {
  position: absolute;
  inset: 0;
}

.hero-glb__canvas :deep(canvas) {
  width: 100% !important;
  height: 100% !important;
  display: block;
}

.hero-glb__empty {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.85rem;
  padding: 2rem;
  text-align: center;
}

.hero-glb__icon {
  display: grid;
  grid-template-columns: repeat(3, 14px);
  gap: 5px;
  margin-bottom: 0.5rem;
}

.hero-glb__icon span {
  width: 14px;
  height: 14px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 2px;
}

.hero-glb__icon span.accent {
  background: var(--fracto-brand);
}

.hero-glb__icon i {
  width: 14px;
  height: 14px;
}

.hero-glb__empty p {
  margin: 0;
  color: #aaa;
  font-size: 0.95rem;
}

.hero-glb__btn {
  cursor: pointer;
  padding: 0.7rem 1.35rem;
  background: var(--fracto-brand);
  color: #0a0a0a;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 10px;
  transition: transform 0.15s ease, background 0.15s ease;
}

.hero-glb__btn:hover {
  background: var(--fracto-brand-hover);
  transform: translateY(-1px);
}

.hero-glb__btn input {
  display: none;
}

.hero-glb__hint {
  font-size: 0.75rem;
  color: #555;
}

.hero-glb__loading {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 5;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  padding: 0.65rem;
  font-size: 0.78rem;
  color: #888;
}

.hero-glb__bar {
  height: 3px;
  background: var(--fracto-brand);
  border-radius: 2px;
  margin-bottom: 0.35rem;
}

.hero-glb__error {
  position: absolute;
  bottom: 4rem;
  left: 1rem;
  right: 1rem;
  z-index: 5;
  padding: 0.65rem;
  background: rgba(60, 15, 8, 0.9);
  color: #ffaa99;
  border-radius: 8px;
  font-size: 0.8rem;
  text-align: center;
}

.hero-glb__toolbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 4;
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  padding: 0.65rem 1rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.85));
  font-size: 0.72rem;
  color: #888;
}

.hero-glb__mini {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.hero-glb__mini input[type='range'] {
  width: 80px;
  accent-color: var(--fracto-brand);
}

.hero-glb__check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
}

.hero-glb__replace {
  cursor: pointer;
  margin-left: auto;
  color: var(--fracto-brand-soft);
}

.hero-glb__replace input {
  display: none;
}

/* v2 — modelo flutuando sobre o background, sem “caixa” */
.hero-glb--chromeless {
  min-height: 100%;
}

.hero-glb--chromeless .hero-glb__frame--bare {
  min-height: 100%;
  border: none;
  border-radius: 0;
  background: transparent;
  animation: none;
  box-shadow: none;
}

.hero-glb--chromeless .hero-glb__frame--bare.has-model {
  border: none;
  box-shadow: none;
}

.hero-glb__loading--minimal {
  top: 0;
  left: 0;
  right: 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
}

.hero-glb__loading--minimal span {
  display: none;
}

.hero-glb__loading--minimal .hero-glb__bar {
  height: 2px;
  margin: 0;
  border-radius: 0;
}
</style>
