<template>
  <svg class="ui-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <template v-if="name === 'monitor'">
      <rect x="3.5" y="4" width="17" height="12" rx="2.2" />
      <path d="M8.5 20h7" />
      <path d="M12 16v4" />
    </template>
    <template v-else-if="name === 'sun'">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M18.72 5.28 17.3 6.7M6.7 17.3l-1.42 1.42" />
    </template>
    <template v-else-if="name === 'moon'">
      <path d="M20.4 15.1A8.5 8.5 0 0 1 8.9 3.6 8.6 8.6 0 1 0 20.4 15.1Z" />
    </template>
    <template v-else-if="name === 'pin'">
      <path d="M7 3h10" />
      <path d="M8 3v5.2L5.5 12h13L16 8.2V3" />
      <path d="M12 12v9" />
    </template>
    <template v-else-if="name === 'fire'">
      <path d="M13.4 2.8c.8 3.2-1.8 4.7-1.8 7.1 0 1.5.9 2.5 2.2 2.5 2 0 3.4-1.8 3.4-4.2 2.1 2 3.3 4.3 3.3 6.8 0 4-3.4 7-8.3 7S3.8 19 3.8 14.8c0-3.2 1.8-5.7 5-8.4-.3 3.3 1.1 4.7 2.5 4.7.7 0 1.2-.4 1.5-1.1.7-2.3-.2-4.5.6-7.2Z" />
    </template>
  </svg>
</template>

<script setup>
defineProps({
  name: { type: String, required: true },
});
</script>

<style scoped>
.ui-glyph { display: block; width: 1em; height: 1em; }
</style>
