<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { BLOCK_DIVIDER_VARIANTS } from '../lib/blockDivider/patterns'
import { mountBlockDivider } from '../lib/blockDivider/mount'

const props = withDefaults(
  defineProps<{
    variant?: string
    completeAt?: number
    accentColor?: string
  }>(),
  {
    variant: 'default',
    completeAt: 0.4,
  },
)

const root = ref<HTMLElement | null>(null)
let dispose: (() => void) | null = null

function remount() {
  dispose?.()
  dispose = null
  if (!root.value) return
  dispose = mountBlockDivider(root.value, {
    variant: props.variant,
    completeAt: props.completeAt,
    accentColor: props.accentColor,
  })
}

onMounted(remount)
watch(() => [props.variant, props.completeAt, props.accentColor], remount)
onUnmounted(() => {
  dispose?.()
  dispose = null
})

defineExpose({ variants: BLOCK_DIVIDER_VARIANTS })
</script>

<template>
  <div
    ref="root"
    class="fracto-block-divider-host"
    :data-fracto-block-divider="variant"
    :data-complete-at="String(completeAt)"
    :data-accent-color="accentColor"
  />
</template>

<style scoped>
.fracto-block-divider-host {
  width: 100%;
}
</style>
