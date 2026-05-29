<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const emit = defineEmits<{
  applyUrl: [url: string]
  applyFile: [file: File]
  clear: []
}>()

const open = ref(false)
const urlInput = ref('')
const panelRef = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

function applyUrl() {
  if (!urlInput.value.trim()) return
  emit('applyUrl', urlInput.value.trim())
  open.value = false
}

function onFile(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (!file) return
  emit('applyFile', file)
  open.value = false
  ;(ev.target as HTMLInputElement).value = ''
}

function onClear() {
  urlInput.value = ''
  emit('clear')
  open.value = false
}

function onDocClick(ev: MouseEvent) {
  if (!open.value || !panelRef.value) return
  if (!panelRef.value.contains(ev.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div ref="panelRef" class="bg-picker">
    <button type="button" class="bg-picker__trigger" @click.stop="toggle">
      Background
    </button>

    <div v-if="open" class="bg-picker__panel" @click.stop>
      <p class="bg-picker__title">Fundo da página</p>

      <label class="bg-picker__field">
        <span>Link (YouTube, Vimeo, imagem ou vídeo)</span>
        <input
          v-model="urlInput"
          type="text"
          placeholder="https://youtube.com/watch?v=..."
          @keydown.enter.prevent="applyUrl"
        />
      </label>
      <p class="bg-picker__hint">
        YouTube e Vimeo são incorporados automaticamente. Imagens e .mp4 também funcionam.
      </p>
      <button type="button" class="bg-picker__apply" @click="applyUrl">Incorporar link</button>

      <div class="bg-picker__divider">ou</div>

      <label class="bg-picker__file">
        Arquivo do computador
        <input type="file" accept="image/*,video/*" hidden @change="onFile" />
      </label>

      <button type="button" class="bg-picker__clear" @click="onClear">Voltar ao vídeo padrão</button>
    </div>
  </div>
</template>

<style scoped>
.bg-picker {
  position: relative;
}

.bg-picker__trigger {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #e8e8e8;
  font-size: 0.82rem;
  font-weight: 500;
  backdrop-filter: blur(8px);
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.bg-picker__trigger:hover {
  border-color: var(--fracto-brand-border);
  background: var(--fracto-brand-dim);
}

.bg-picker__panel {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 50;
  width: min(320px, calc(100vw - 2rem));
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(14, 14, 14, 0.94);
  backdrop-filter: blur(16px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.45);
}

.bg-picker__title {
  margin: 0 0 0.85rem;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #888;
}

.bg-picker__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 0.65rem;
  font-size: 0.75rem;
  color: #aaa;
}

.bg-picker__field input {
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.35);
  color: #eee;
  font-size: 0.85rem;
}

.bg-picker__apply,
.bg-picker__file,
.bg-picker__clear {
  display: block;
  width: 100%;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  font-size: 0.82rem;
  cursor: pointer;
  text-align: center;
}

.bg-picker__hint {
  margin: -0.35rem 0 0.65rem;
  font-size: 0.7rem;
  line-height: 1.45;
  color: #666;
}

.bg-picker__apply {
  border: none;
  background: var(--fracto-brand);
  color: #0a0a0a;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.bg-picker__divider {
  text-align: center;
  font-size: 0.72rem;
  color: #555;
  margin-bottom: 0.75rem;
}

.bg-picker__file {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  color: #ccc;
  margin-bottom: 0.5rem;
}

.bg-picker__file input {
  display: none;
}

.bg-picker__clear {
  border: none;
  background: transparent;
  color: #777;
}

.bg-picker__clear:hover {
  color: #ffaa99;
}
</style>
