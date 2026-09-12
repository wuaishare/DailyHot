<template>
  <span v-if="badges.length" class="ranking-badges notranslate" translate="no">
    <span
      v-for="(badge, badgeIndex) in badges"
      :key="`${badge.kind}-${badge.sourceCode || badge.label}-${badgeIndex}`"
      class="ranking-badge"
      :class="[
        `is-${badge.kind}`,
        {
          'is-strong': badge.prominence === 'strong',
          'is-animated': badge.animated,
          'has-icon': Boolean(iconUrl(badge)),
        },
      ]"
      role="img"
      :title="badge.label"
      :aria-label="badge.label"
    >
      <img
        v-if="iconUrl(badge)"
        class="ranking-badge-icon"
        :src="iconUrl(badge)"
        alt=""
        loading="lazy"
        @error="handleImageError(badge)"
      />
      <span v-else class="ranking-badge-label" aria-hidden="true">{{ badge.label }}</span>
    </span>
  </span>
</template>

<script setup>
import { reactive } from 'vue';
import { resolveRankingBadgeIconUrl } from '@/utils/rankingBadges';

const props = defineProps({
  badges: { type: Array, default: () => [] },
});

const failedUrls = reactive({});
const iconUrl = (badge) => resolveRankingBadgeIconUrl(badge, failedUrls);
const handleImageError = (badge) => {
  const failed = iconUrl(badge);
  if (failed) failedUrls[failed] = true;
};
</script>

<style scoped>
.ranking-badges {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  line-height: 1;
}
.ranking-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 4px;
  box-sizing: border-box;
  color: #fff;
  background: #ff3852;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  vertical-align: middle;
}
.ranking-badge.is-hot,
.ranking-badge.is-boiling { background: #ff9406; }
.ranking-badge.is-new,
.ranking-badge.is-first-release,
.ranking-badge.is-discussion { background: #ff3852; }
.ranking-badge.is-explosive {
  position: relative;
  isolation: isolate;
  min-width: 20px;
  height: 20px;
  padding: 0 4px;
  border: 1px solid rgba(164, 16, 10, .48);
  background: linear-gradient(180deg, #d52a1f 0%, #b8150d 100%);
  box-shadow: 0 1px 2px rgba(111,8,4,.28), 0 3px 9px rgba(211,36,27,.32), 0 0 13px rgba(255,74,58,.18);
  font-size: 12px;
  font-weight: 850;
  line-height: 18px;
  text-shadow: 0 1px 1px rgba(96,5,0,.28);
  transform: translateY(-1px);
}
.ranking-badge.is-explosive::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: -4px;
  border-radius: 7px;
  background: rgba(245,52,39,.18);
  filter: blur(5px);
  pointer-events: none;
}
.ranking-badge.is-interpretation,
.ranking-badge.is-depth { background: linear-gradient(135deg, #4d7cff, #6d5ce7); }
.ranking-badge.is-rumor { background: #2788f5; }
.ranking-badge.is-challenge { background: #ff4b7d; }
.ranking-badge.is-live,
.ranking-badge.is-hot-live { background: #ff3852; }
.ranking-badge.is-commercial { background: #00a6d9; }
.ranking-badge.is-category,
.ranking-badge.is-source { background: color-mix(in srgb, var(--n-text-color, #606770) 68%, transparent); }
.ranking-badge.has-icon {
  width: auto;
  min-width: 18px;
  padding: 0;
  background: transparent;
  box-shadow: none;
  transform: none;
}
.ranking-badge-icon {
  display: block;
  width: auto;
  max-width: 34px;
  height: 18px;
  object-fit: contain;
}
.ranking-badge.is-hot-live .ranking-badge-icon {
  width: 20px;
  max-width: 20px;
  height: 20px;
}
.ranking-badge.is-animated .ranking-badge-icon {
  animation: ranking-badge-live 1.25s ease-in-out infinite;
  transform-origin: 50% 80%;
}
@keyframes ranking-badge-live {
  0%, 100% { transform: translateY(0) scale(1); }
  45% { transform: translateY(-2px) scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .ranking-badge.is-animated .ranking-badge-icon { animation: none !important; }
}
</style>
