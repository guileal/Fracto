<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <span class="section-badge">{{ label }}</span>
</template>

<style scoped>
.section-badge {
  display: inline-block;
  width: fit-content;
  padding: 0.4rem 1rem;
  border: 1px solid var(--fracto-brand-border);
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.02em;
  color: var(--fracto-brand);
  background: var(--fracto-brand-dim);
}
</style>
