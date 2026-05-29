<script setup lang="ts">
import { onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'
import { createGlbViewer, type GlbViewerState } from '../three/glbViewer'

const props = defineProps<{
  /** 0–1 vindo do scroll (HomePage). */
  timelineProgress?: number
}>()

const emit = defineEmits<{
  state: [GlbViewerState]
}>()

const host = ref<HTMLElement | null>(null)
const viewer = shallowRef<ReturnType<typeof createGlbViewer> | null>(null)
const viewerState = ref<GlbViewerState | null>(null)
const isDragging = ref(false)

onMounted(() => {
  if (!host.value) return
  viewer.value = createGlbViewer(host.value, (s) => {
    viewerState.value = s
    emit('state', s)
  })
})

onUnmounted(() => {
  viewer.value?.dispose()
})

watch(
  () => props.timelineProgress,
  (t) => {
    if (t !== undefined) viewer.value?.setTimelineProgress(t)
  },
)

defineExpose({
  setTimelineProgress: (t: number) => viewer.value?.setTimelineProgress(t),
})

async function loadFile(file: File) {
  if (!viewer.value) return
  try {
    await viewer.value.loadFile(file)
  } catch {
    /* erro no state */
  }
}

function onFileInput(ev: Event) {
  const f = (ev.target as HTMLInputElement).files?.[0]
  if (f) void loadFile(f)
}

function onDrop(ev: DragEvent) {
  ev.preventDefault()
  isDragging.value = false
  const f = ev.dataTransfer?.files?.[0]
  if (f && /\.(glb|gltf)$/i.test(f.name)) void loadFile(f)
}

function formatTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
</script>

<template>
  <div
    class="glb-panel"
    :class="{ 'is-dragging': isDragging, 'has-model': viewerState?.loaded }"
    @dragover.prevent="isDragging = true"
    @dragleave="isDragging = false"
    @drop="onDrop"
  >
    <div ref="host" class="glb-panel__canvas" />

    <div v-if="!viewerState?.loaded && !viewerState?.loading" class="glb-panel__overlay">
      <p>Arraste um <strong>.glb</strong> com keyframes <strong>Summary</strong></p>
      <label class="glb-panel__btn">
        Escolher arquivo
        <input type="file" accept=".glb,.gltf" @change="onFileInput" />
      </label>
    </div>

    <div v-if="viewerState?.loading" class="glb-panel__loading">
      <div class="glb-panel__bar" :style="{ width: `${(viewerState.progress || 0) * 100}%` }" />
      <span>{{ Math.round((viewerState.progress || 0) * 100) }}%</span>
    </div>

    <div v-if="viewerState?.error" class="glb-panel__error">{{ viewerState.error }}</div>

    <footer v-if="viewerState?.loaded" class="glb-panel__controls">
      <div class="glb-panel__row">
        <span class="glb-panel__filename">{{ viewerState.fileName }}</span>
      </div>

      <div v-if="viewerState.timelineName" class="glb-panel__row glb-panel__main">
        <span class="glb-panel__badge">Summary</span>
        <span class="glb-panel__scroll-hint">{{ viewerState.timelineName }}</span>
      </div>

      <div v-if="viewerState.timelineName" class="glb-panel__row glb-panel__timeline-row">
        <div class="glb-panel__timeline-track">
          <div
            class="glb-panel__timeline-fill"
            :style="{ width: `${viewerState.timelineProgress * 100}%` }"
          />
          <div
            class="glb-panel__timeline-head"
            :style="{ left: `${viewerState.timelineProgress * 100}%` }"
          />
        </div>
        <span class="glb-panel__time">
          {{ formatTime(viewerState.time) }} / {{ formatTime(viewerState.duration) }}
          · {{ Math.round(viewerState.timelineProgress * 100) }}%
        </span>
      </div>

      <div class="glb-panel__row glb-panel__sliders">
        <label class="glb-panel__label">
          Exposição <span>{{ viewerState.exposure.toFixed(2) }}</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.05"
          :value="viewerState.exposure"
          @input="viewer?.setExposure(Number(($event.target as HTMLInputElement).value))"
        />
      </div>

      <div class="glb-panel__row glb-panel__toggles">
        <label class="glb-panel__check">
          <input
            type="checkbox"
            :checked="viewerState.autoRotate"
            @change="viewer?.setAutoRotate(($event.target as HTMLInputElement).checked)"
          />
          Auto-rotate
        </label>
        <label class="glb-panel__btn glb-panel__btn--ghost">
          Trocar GLB
          <input type="file" accept=".glb,.gltf" hidden @change="onFileInput" />
        </label>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.glb-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 360px;
  background: #111;
}

.glb-panel.is-dragging {
  outline: 2px dashed var(--fracto-brand);
  outline-offset: -6px;
}

.glb-panel__canvas {
  flex: 1;
  min-height: 220px;
}

.glb-panel__canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.glb-panel__overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  background: rgba(8, 8, 8, 0.9);
  color: #888;
  z-index: 2;
  text-align: center;
  padding: 1.5rem;
}

.glb-panel.has-model .glb-panel__overlay {
  display: none;
}

.glb-panel__btn {
  cursor: pointer;
  padding: 0.55rem 1rem;
  background: var(--fracto-brand);
  color: #0a0a0a;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
}

.glb-panel__btn input {
  display: none;
}

.glb-panel__btn--ghost {
  background: transparent;
  color: #aaa;
  border: 1px solid rgba(255, 255, 255, 0.15);
  font-weight: 500;
}

.glb-panel__loading {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 5;
  background: rgba(0, 0, 0, 0.85);
  border-radius: 8px;
  padding: 0.65rem;
  font-size: 0.78rem;
  color: #aaa;
}

.glb-panel__bar {
  height: 3px;
  background: var(--fracto-brand);
  margin-bottom: 0.35rem;
}

.glb-panel__error {
  position: absolute;
  top: 50%;
  left: 1rem;
  right: 1rem;
  transform: translateY(-50%);
  z-index: 6;
  padding: 0.75rem;
  background: rgba(60, 15, 8, 0.95);
  color: #ffaa99;
  border-radius: 8px;
  font-size: 0.82rem;
  text-align: center;
}

.glb-panel__controls {
  flex-shrink: 0;
  padding: 0.75rem 1rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: #0c0c0c;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.glb-panel__row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.glb-panel__filename {
  font-size: 0.72rem;
  color: #555;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
}

.glb-panel__main {
  justify-content: space-between;
}

.glb-panel__badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--fracto-brand);
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--fracto-brand-border);
  border-radius: 4px;
}

.glb-panel__scroll-hint {
  font-size: 0.72rem;
  color: #666;
}

.glb-panel__timeline-row {
  flex-direction: column;
  align-items: stretch;
}

.glb-panel__timeline-track {
  position: relative;
  height: 6px;
  background: #2a2a2a;
  border-radius: 3px;
  overflow: visible;
}

.glb-panel__timeline-fill {
  height: 100%;
  background: linear-gradient(90deg, #c44a12, var(--fracto-brand));
  border-radius: 3px;
  transition: width 0.08s linear;
}

.glb-panel__timeline-head {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  background: #fff;
  border: 2px solid var(--fracto-brand);
  border-radius: 50%;
  transform: translateY(-50%);
  transition: left 0.08s linear;
  pointer-events: none;
}

.glb-panel__time {
  font-size: 0.72rem;
  color: #888;
  font-variant-numeric: tabular-nums;
}

.glb-panel__label {
  width: 100%;
  font-size: 0.72rem;
  color: #888;
  display: flex;
  justify-content: space-between;
}

.glb-panel__sliders input[type='range'] {
  width: 100%;
  accent-color: var(--fracto-brand);
}

.glb-panel__toggles {
  justify-content: space-between;
}

.glb-panel__check {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #aaa;
  cursor: pointer;
}
</style>
