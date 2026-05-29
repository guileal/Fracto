<script setup lang="ts">
defineProps<{
  href: string
  variant?: 'primary' | 'outline'
}>()
</script>

<template>
  <a
    :href="href"
    class="landing-btn"
    :class="variant === 'outline' ? 'landing-btn--outline' : 'landing-btn--primary'"
  >
    <span class="landing-btn__text"><slot /></span>
    <span class="landing-btn__icon" aria-hidden>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M3 11L11 3M11 3H5M11 3V9"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </a>
</template>

<style scoped>
.landing-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.55rem 0.55rem 1.35rem;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 600;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.landing-btn:hover {
  transform: translateY(-2px);
}

.landing-btn--primary {
  background: var(--fracto-brand);
  color: #fff;
}

.landing-btn--primary .landing-btn__icon {
  background: #fff;
  color: #1a1a1a;
}

.landing-btn--primary:hover {
  background: var(--fracto-brand-hover);
}

.landing-btn--outline {
  border: 1.5px solid var(--fracto-brand);
  color: var(--fracto-brand);
  background: transparent;
}

.landing-btn--outline .landing-btn__icon {
  background: var(--fracto-brand);
  color: #fff;
}

.landing-btn--outline:hover {
  border-color: var(--fracto-brand-hover);
  color: var(--fracto-brand-hover);
}

.landing-btn__icon {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
