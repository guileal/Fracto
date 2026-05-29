<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number | string
    title?: string
    decorative?: boolean
  }>(),
  {
    size: 32,
    title: 'Fracto',
    decorative: false,
  },
)
</script>

<template>
  <svg
    class="fracto-logo"
    :width="size"
    :height="size"
    viewBox="0 0 101.32 101.32"
    xmlns="http://www.w3.org/2000/svg"
    :role="decorative ? undefined : 'img'"
    :aria-hidden="decorative ? true : undefined"
    :aria-label="decorative ? undefined : title"
  >
    <rect fill="#f8f7f5" y="25.33" width="25.33" height="50.66" />
    <rect fill="#f8f7f5" x="25.33" y="76" width="50.66" height="25.33" />
    <rect fill="#f8f7f5" x="25.33" width="25.33" height="25.33" />
    <rect fill="#f8f7f5" x="75.99" y="50.66" width="25.33" height="25.33" />
    <rect fill="#f55e1d" x="75.99" width="25.33" height="25.33" />
  </svg>
</template>

<style scoped>
.fracto-logo {
  display: block;
  flex-shrink: 0;
}
</style>
