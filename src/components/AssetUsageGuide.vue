<script setup lang="ts">
import type { WpAssetCatalogEntry } from '../lib/wpAssetsCatalog'

defineProps<{
  asset: WpAssetCatalogEntry
}>()
</script>

<template>
  <aside class="usage" aria-label="Como usar no WordPress">
    <h3 class="usage__heading">Como usar</h3>

    <dl class="usage__list">
      <div class="usage__row">
        <dt>Quando usar</dt>
        <dd>{{ asset.whenToUse }}</dd>
      </div>
      <div class="usage__row">
        <dt>Onde colocar</dt>
        <dd>{{ asset.placement }}</dd>
      </div>
      <div class="usage__row">
        <dt>WPBakery</dt>
        <dd>
          <ol class="usage__steps">
            <li v-for="(step, i) in asset.wpbakerySteps" :key="i">{{ step }}</li>
          </ol>
        </dd>
      </div>
      <div class="usage__row">
        <dt>Shortcode</dt>
        <dd><code class="usage__code">{{ asset.shortcode }}</code></dd>
      </div>
      <div v-if="asset.rowClass" class="usage__row">
        <dt>Classe na row</dt>
        <dd><code class="usage__code">{{ asset.rowClass }}</code></dd>
      </div>
    </dl>
  </aside>
</template>

<style scoped>
.usage {
  margin-top: clamp(1.25rem, 3vw, 1.75rem);
  padding: clamp(1rem, 2.5vw, 1.35rem);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.04);
}

.showcase--light .usage {
  border-color: rgba(0, 0, 0, 0.08);
  background: rgba(0, 0, 0, 0.03);
}

.usage__heading {
  margin: 0 0 0.85rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.55;
}

.usage__list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.usage__row {
  margin: 0;
}

.usage__row dt {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  font-weight: 600;
  opacity: 0.5;
}

.usage__row dd {
  margin: 0;
  font-size: 0.88rem;
  line-height: 1.55;
  opacity: 0.82;
}

.showcase--light .usage__row dd {
  opacity: 1;
  color: var(--fracto-muted, #5a5a5a);
}

.usage__steps {
  margin: 0;
  padding-left: 1.15rem;
}

.usage__steps li + li {
  margin-top: 0.35rem;
}

.usage__code {
  display: inline-block;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  word-break: break-all;
  background: rgba(0, 0, 0, 0.35);
}

.showcase--light .usage__code {
  background: rgba(0, 0, 0, 0.06);
  color: #1a1a1a;
}
</style>
