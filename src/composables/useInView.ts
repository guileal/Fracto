import { onMounted, onUnmounted, ref, type Ref } from 'vue'

export function useInView(
  target: Ref<HTMLElement | null>,
  options: IntersectionObserverInit = { rootMargin: '160px 0px', threshold: 0.08 },
) {
  const inView = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return

    observer = new IntersectionObserver(([entry]) => {
      inView.value = entry.isIntersecting
    }, options)

    observer.observe(target.value)
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = null
  })

  return { inView }
}
