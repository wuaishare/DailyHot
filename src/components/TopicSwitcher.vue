<template>
  <nav class="topic-switcher" :aria-label="navLabel">
    <span class="topic-switcher__label">{{ navLabel }}</span>
    <div class="topic-switcher__rail">
      <router-link
        v-for="topic in TOPIC_REGISTRY"
        :key="topic.id"
        :to="buildTopicPath(topic, locale)"
        class="topic-switcher__item"
        :class="{ 'is-active': topic.id === activeTopic }"
        :aria-current="topic.id === activeTopic ? 'page' : undefined"
      >
        {{ getTopicLabel(topic, locale) }}
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import {
  TOPIC_REGISTRY,
  buildTopicPath,
  getTopicLabel,
  getTopicNavLabel,
} from "@/config/topics";

const props = defineProps({
  activeTopic: { type: String, required: true },
  locale: { type: String, default: "zh-CN" },
});
const navLabel = computed(() => getTopicNavLabel(props.locale));
</script>
<style scoped>
.topic-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 7px 9px;
  border: 1px solid var(--n-border-color, rgba(127, 127, 127, 0.18));
  border-radius: 10px;
  background: var(--n-action-color, rgba(127, 127, 127, 0.06));
}
.topic-switcher__label {
  flex: 0 0 auto;
  padding: 4px 7px;
  border-radius: 6px;
  color: var(--n-text-color);
  background: var(--n-color, #fff);
  box-shadow: inset 0 0 0 1px var(--n-border-color, rgba(127, 127, 127, 0.18));
  font-size: 11px;
  font-weight: 700;
}
.topic-switcher__rail {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
}
.topic-switcher__rail::-webkit-scrollbar {
  display: none;
}
.topic-switcher__item {
  flex: 0 0 auto;
  padding: 6px 11px;
  border-radius: 7px;
  color: var(--n-text-color-2);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.2;
  text-decoration: none;
  transition:
    color 0.16s ease,
    background 0.16s ease,
    box-shadow 0.16s ease;
}
.topic-switcher__item:hover,
.topic-switcher__item:focus-visible {
  color: var(--n-text-color);
  background: var(--n-action-color);
  outline: none;
}
.topic-switcher__item.is-active {
  color: var(--n-primary-color, #d03050);
  background: var(--n-color, #fff);
  box-shadow: inset 0 0 0 1px currentColor;
}
@media (max-width: 720px) {
  .topic-switcher {
    gap: 7px;
  }
  .topic-switcher__label {
    font-size: 10px;
  }
  .topic-switcher__rail {
    margin-right: -2px;
    padding-right: 2px;
  }
  .topic-switcher__item {
    padding: 5px 8px;
    font-size: 11px;
  }
}
</style>
