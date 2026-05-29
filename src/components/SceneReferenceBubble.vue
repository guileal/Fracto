<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  sceneCode: string
  aiBriefing: string
  shareUrl: string
}>()

const open = ref(false)
const copied = ref<'code' | 'brief' | 'link' | null>(null)
let copyTimer = 0

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

async function copy(kind: 'code' | 'brief' | 'link', text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = kind
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copied.value = null
    }, 2000)
  } catch {
    /* silencioso */
  }
}

function onDocClick(event: MouseEvent) {
  const el = event.target
  if (!(el instanceof Node)) return
  const root = document.getElementById('scene-ref-bubble')
  if (root && !root.contains(el)) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick, true)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick, true)
  document.removeEventListener('keydown', onKeydown)
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <div id="scene-ref-bubble" class="ref-bubble">
    <button
      type="button"
      class="ref-bubble__dot"
      :class="{ 'ref-bubble__dot--open': open }"
      aria-label="Referência da cena"
      :aria-expanded="open"
      @click.stop="toggle"
    />

    <div v-if="open" class="ref-bubble__panel" role="dialog" aria-label="Copiar referência">
      <p class="ref-bubble__lead">
        Estado atual da cena — cole no código ou envie para uma IA.
      </p>

      <button
        type="button"
        class="ref-bubble__action"
        @click="copy('code', props.sceneCode)"
      >
        {{ copied === 'code' ? 'Código copiado' : 'Copiar código TypeScript' }}
      </button>

      <button
        type="button"
        class="ref-bubble__action"
        @click="copy('brief', props.aiBriefing)"
      >
        {{ copied === 'brief' ? 'Briefing copiado' : 'Copiar briefing para IA' }}
      </button>

      <button
        type="button"
        class="ref-bubble__action ref-bubble__action--muted"
        @click="copy('link', props.shareUrl)"
      >
        {{ copied === 'link' ? 'Link copiado' : 'Copiar link com parâmetros' }}
      </button>

      <pre class="ref-bubble__preview">{{ props.sceneCode }}</pre>
    </div>
  </div>
</template>

<style scoped>
.ref-bubble {
  position: relative;
  flex-shrink: 0;
}

.ref-bubble__dot {
  width: 14px;
  height: 14px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.22);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    box-shadow 0.15s ease;
}

.ref-bubble__dot:hover,
.ref-bubble__dot--open {
  transform: scale(1.12);
  background: rgba(255, 255, 255, 0.42);
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.08);
}

.ref-bubble__panel {
  position: absolute;
  bottom: calc(100% + 0.65rem);
  left: 0;
  width: min(300px, calc(100vw - 2rem));
  padding: 0.85rem;
  border-radius: 12px;
  background: rgba(12, 12, 14, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  z-index: 10002;
}

.ref-bubble__lead {
  margin: 0 0 0.65rem;
  font-size: 0.7rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.55);
}

.ref-bubble__action {
  display: block;
  width: 100%;
  margin-bottom: 0.4rem;
  padding: 0.5rem 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.72rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.ref-bubble__action:hover {
  background: rgba(255, 255, 255, 0.1);
}

.ref-bubble__action--muted {
  color: rgba(255, 255, 255, 0.6);
}

.ref-bubble__preview {
  margin: 0.65rem 0 0;
  padding: 0.5rem;
  max-height: 120px;
  overflow: auto;
  font-family: ui-monospace, monospace;
  font-size: 0.58rem;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.5);
  background: rgba(0, 0, 0, 0.35);
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
