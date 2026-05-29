<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import GlbViewerPanel from '../components/GlbViewerPanel.vue'
import { progressFromScroll, type ScrollSection } from '../lib/scrollTimeline'
import type { GlbViewerState } from '../three/glbViewer'

/** keyframe = posição 0–1 na timeline Summary (todas as keyframes). */
const sections: ScrollSection[] = [
  {
    id: 'intro',
    keyframe: 0,
  },
  {
    id: 'step-1',
    keyframe: 0.2,
  },
  {
    id: 'step-2',
    keyframe: 0.45,
  },
  {
    id: 'step-3',
    keyframe: 0.7,
  },
  {
    id: 'outro',
    keyframe: 1,
  },
]

const sectionMeta = [
  { id: 'intro', title: 'Início', body: '0% da timeline Summary — todas as keyframes do export.' },
  { id: 'step-1', title: 'Etapa 1', body: '~20% — o scroll interpola entre os keyframes das seções.' },
  { id: 'step-2', title: 'Etapa 2', body: '~45% — uma timeline só, sem trocar clip por clip.' },
  { id: 'step-3', title: 'Etapa 3', body: '~70% — no Blender use a action Summary ou exporte tudo.' },
  { id: 'outro', title: 'Fim', body: '100%. Ajuste keyframe em HomePage.vue conforme seu Summary.' },
]

const scrollRoot = ref<HTMLElement | null>(null)
const sectionEls = ref<HTMLElement[]>([])
const viewerPanel = ref<InstanceType<typeof GlbViewerPanel> | null>(null)
const viewerState = ref<GlbViewerState | null>(null)
const timelineProgress = ref(0)

const hasTimeline = computed(() => !!viewerState.value?.timelineName)

let rafScroll = 0

function setSectionRef(el: unknown, index: number) {
  if (el instanceof HTMLElement) sectionEls.value[index] = el
}

function syncScrollToAnimation() {
  if (!scrollRoot.value || !hasTimeline.value) return
  const els = sectionEls.value.filter(Boolean)
  const progress = progressFromScroll(scrollRoot.value, els, sections)
  timelineProgress.value = progress
  viewerPanel.value?.setTimelineProgress(progress)
}

function onScroll() {
  if (rafScroll) return
  rafScroll = requestAnimationFrame(() => {
    rafScroll = 0
    syncScrollToAnimation()
  })
}

onMounted(async () => {
  await nextTick()
  scrollRoot.value?.addEventListener('scroll', onScroll, { passive: true })
  syncScrollToAnimation()
})

onUnmounted(() => {
  scrollRoot.value?.removeEventListener('scroll', onScroll)
  if (rafScroll) cancelAnimationFrame(rafScroll)
})

function onViewerState(s: GlbViewerState) {
  viewerState.value = s
  if (s.loaded && s.timelineName) syncScrollToAnimation()
}

function keyframePercent(k: number): string {
  return `${Math.round(k * 100)}%`
}
</script>

<template>
  <div class="home">
    <div class="home__columns">
      <div ref="scrollRoot" class="home__scroll">
        <div class="home__intro">
          <h1>Scroll → Summary</h1>
          <p>
            Timeline com <strong>todas as keyframes</strong> (action Summary no Blender). O scroll
            define o frame — interpolando entre os pontos de cada seção.
          </p>
        </div>

        <section
          v-for="(meta, i) in sectionMeta"
          :key="meta.id"
          :ref="(el) => setSectionRef(el, i)"
          class="home__section"
          :class="{
            'is-active':
              hasTimeline &&
              Math.abs(timelineProgress - sections[i]!.keyframe) < 0.12,
          }"
        >
          <span class="home__tag">Summary @ {{ keyframePercent(sections[i]!.keyframe) }}</span>
          <h2>{{ meta.title }}</h2>
          <p>{{ meta.body }}</p>
        </section>
      </div>

      <aside class="home__viewer">
        <GlbViewerPanel
          ref="viewerPanel"
          :timeline-progress="timelineProgress"
          @state="onViewerState"
        />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 52px);
}

.home__columns {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(400px, 1.15fr);
  min-height: calc(100vh - 52px);
}

.home__scroll {
  padding: 2rem clamp(1.25rem, 3vw, 2.5rem) 8rem;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  overflow-y: auto;
  max-height: calc(100vh - 52px);
}

.home__intro h1 {
  font-size: 1.65rem;
  margin: 0 0 0.75rem;
  letter-spacing: -0.03em;
}

.home__intro p {
  color: #888;
  line-height: 1.6;
  margin: 0 0 3rem;
  max-width: 28rem;
}

.home__section {
  min-height: 72vh;
  padding: 2.5rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  opacity: 0.35;
  transition: opacity 0.35s ease;
}

.home__section.is-active {
  opacity: 1;
}

.home__tag {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--fracto-brand);
}

.home__section h2 {
  font-size: 1.45rem;
  margin: 0.5rem 0;
}

.home__section p {
  color: #999;
  line-height: 1.65;
  max-width: 26rem;
}

.home__viewer {
  position: sticky;
  top: 52px;
  height: calc(100vh - 52px);
  display: flex;
  flex-direction: column;
}

.home__viewer :deep(.glb-panel) {
  height: 100%;
}

@media (max-width: 900px) {
  .home__columns {
    grid-template-columns: 1fr;
  }
  .home__viewer {
    position: relative;
    top: 0;
    height: min(80vh, 640px);
    order: -1;
  }
  .home__scroll {
    max-height: none;
  }
}
</style>
