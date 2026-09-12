<template>
  <section ref="rootEl" class="category-source-rail" :class="{ 'is-dark': store.siteTheme === 'dark' }">
    <aside class="category-source-rail__toc" :aria-label="copy.sourceDirectory">
      <div class="category-source-rail__toc-card">
        <div class="category-source-rail__toc-title">
          <strong>{{ copy.sourceDirectory }}</strong>
          <span>{{ props.sources.length }}</span>
        </div>
        <nav>
          <button
            v-for="source in props.sources"
            :key="source.name"
            type="button"
            class="category-source-rail__toc-item"
            :class="{ active: activeSource === source.name }"
            :aria-current="activeSource === source.name ? 'true' : undefined"
            @click="scrollToSource(source.name)"
          >
            <img :src="getSourceLogo(source.name)" alt="" @error="handleLogoError" />
            <span>{{ sourceLabel(source) }}</span>
            <i :class="sourceStates[source.name] || 'idle'" aria-hidden="true"></i>
          </button>
        </nav>
      </div>
    </aside>

    <div class="category-source-rail__main">
      <section
        v-for="source in props.sources"
        :id="sectionId(source.name)"
        :key="source.name"
        :ref="(el) => setSectionRef(source.name, el)"
        class="category-source-section"
        :data-source="source.name"
      >
        <header class="category-source-section__header">
          <div class="category-source-section__identity">
            <img :src="getSourceLogo(source.name)" alt="" @error="handleLogoError" />
            <div>
              <strong>{{ sourceLabel(source) }}</strong>
              <span v-if="sourceSubtitle(source.name)">{{ sourceSubtitle(source.name) }}</span>
            </div>
          </div>
          <router-link class="category-source-section__more" :to="sourcePath(source)">
            {{ copy.viewRanking }} <span aria-hidden="true">→</span>
          </router-link>
        </header>

        <div v-if="!sourceStates[source.name] || sourceStates[source.name] === 'idle' || sourceStates[source.name] === 'loading'" class="category-source-section__rail is-loading">
          <div v-for="index in 4" :key="index" class="category-story-card skeleton"></div>
        </div>
        <div v-else-if="sourceStates[source.name] === 'failed'" class="category-source-section__error">
          <span>{{ copy.loadFailed }}</span>
          <button type="button" @click="loadSource(source, true)">{{ copy.retry }}</button>
        </div>
        <div v-else-if="!sourceEntries(source.name).length" class="category-source-section__error">
          <span>{{ queryText ? copy.noSearchResults : copy.noContent }}</span>
        </div>
        <div v-else class="category-source-section__rail" tabindex="0">
          <a
            v-for="entry in sourceEntries(source.name)"
            :key="entry.key"
            class="category-story-card"
            :class="{ 'has-cover': Boolean(entry.cover) }"
            :href="entry.href"
            :target="linkTarget"
            rel="noopener noreferrer nofollow"
          >
            <img
              v-if="entry.cover"
              class="category-story-card__cover"
              :src="coverSrc(entry.cover)"
              alt=""
              loading="lazy"
              @error="hideBrokenCover"
            />
            <div class="category-story-card__scrim"></div>
            <span class="category-story-card__rank">#{{ entry.rank }}</span>
            <div class="category-story-card__content">
              <div class="category-story-card__title">{{ entry.title }}</div>
              <p v-if="entry.description">{{ entry.description }}</p>
              <div class="category-story-card__meta">
                <span>{{ entry.hot ? `${copy.heat} ${entry.hot}` : entry.sourceLabel }}</span>
                <span v-if="entry.author">{{ entry.author }}</span>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { mainStore } from '@/store';
import { getSharedRanking } from '@/utils/rankingCollection';
import {
  buildSourceSubtypeParams,
  getDefaultSourceSubtype,
  getSourceSubtypeOptions,
  resolveSourceSubtype,
} from '@/utils/sourceSubtypes';
import { getSourceDisplayLabel, getSourceSubtitleLabel } from '@/utils/sourceLabels';
import { buildRankPath, getLocaleFromRoute, normalizeLocale } from '@/utils/locale';
import { getSourceLogo, getSourceLogoFallback } from '@/utils/sourceLogos';
import { getCoverDisplaySrc } from '@/utils/imageProxy';
import { normalizeRankingBadges } from '@/utils/rankingBadges';
import { useTrendsCatalogRevision } from '@/composables/useTrendsCatalogRevision';
import { DATA_REFRESH_EVENT } from '@/utils/dataRefresh';

const props = defineProps({
  sources: { type: Array, default: () => [] },
});

const route = useRoute();
const store = mainStore();
const { locale: i18nLocale } = useI18n({ useScope: 'global' });
const catalogRevision = useTrendsCatalogRevision();
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route) || i18nLocale.value));
const COPY = {
  'zh-CN': { sourceDirectory: '来源目录', viewRanking: '查看榜单', loadFailed: '该来源暂时加载失败', retry: '重试', noSearchResults: '没有匹配当前搜索的条目', noContent: '暂无内容', heat: '热度' },
  en: { sourceDirectory: 'Sources', viewRanking: 'View ranking', loadFailed: 'This source is temporarily unavailable', retry: 'Retry', noSearchResults: 'No items match the current search', noContent: 'No content', heat: 'Heat' },
  'zh-TW': { sourceDirectory: '來源目錄', viewRanking: '查看榜單', loadFailed: '此來源暫時載入失敗', retry: '重試', noSearchResults: '沒有符合目前搜尋的項目', noContent: '暫無內容', heat: '熱度' },
  ja: { sourceDirectory: 'ソース目次', viewRanking: 'ランキングを見る', loadFailed: 'このソースは一時的に読み込めません', retry: '再試行', noSearchResults: '検索に一致する項目がありません', noContent: 'コンテンツがありません', heat: '注目度' },
  ko: { sourceDirectory: '출처 목차', viewRanking: '랭킹 보기', loadFailed: '이 출처를 일시적으로 불러올 수 없습니다', retry: '다시 시도', noSearchResults: '검색과 일치하는 항목이 없습니다', noContent: '콘텐츠 없음', heat: '인기도' },
};
const copy = computed(() => COPY[locale.value] || COPY['zh-CN']);
const sourceResults = reactive({});
const sourceStates = reactive({});
const sectionRefs = new Map();
const activeSource = ref(props.sources[0]?.name || '');
const rootEl = ref(null);
let scrollHost = null;
let sourceLoadObserver = null;
const INITIAL_SOURCE_LOAD_COUNT = 5;
const linkTarget = computed(() => store.linkOpenType === 'open' ? '_blank' : '_self');
const queryText = computed(() => String(route.query.q || '').trim().toLowerCase());
let scrollFrame = 0;

const stripText = (value = '') => String(value || '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&quot;/gi, '"')
  .replace(/&#39;/gi, "'")
  .replace(/\s+/g, ' ')
  .trim();

const sourceLabel = (source) => getSourceDisplayLabel(
  source.name,
  locale.value,
  source.label || source.name,
);
const sourceSubtype = (sourceName) => resolveSourceSubtype(
  getSourceSubtypeOptions(sourceName),
  getDefaultSourceSubtype(sourceName),
);
const sourcePath = (source) => buildRankPath(locale.value, source.name, sourceSubtype(source.name) || '');
const sourceSubtitle = (sourceName) => getSourceSubtitleLabel(
  sourceResults[sourceName]?.subtitle || sourceResults[sourceName]?.type || '',
  locale.value,
);
const sectionId = (sourceName) => `category-source-${sourceName}`;
const setSectionRef = (sourceName, el) => {
  const previous = sectionRefs.get(sourceName);
  if (previous && sourceLoadObserver) sourceLoadObserver.unobserve(previous);
  if (el) {
    sectionRefs.set(sourceName, el);
    sourceLoadObserver?.observe(el);
  } else {
    sectionRefs.delete(sourceName);
  }
};
const handleLogoError = (event) => {
  if (event.target) event.target.src = getSourceLogoFallback();
};
const coverSrc = (cover) => getCoverDisplaySrc(cover);
const hideBrokenCover = (event) => {
  const card = event.target?.closest?.('.category-story-card');
  event.target?.remove?.();
  card?.classList.remove('has-cover');
};

const buildParams = (sourceName) => buildSourceSubtypeParams(sourceName, sourceSubtype(sourceName));
const loadSource = async (source, force = false) => {
  if (!force && sourceResults[source.name]) return;
  sourceStates[source.name] = 'loading';
  const useApi2 = source?.useApi2 || source?.api === 2 || source?.api === 'api2';
  try {
    const response = await getSharedRanking(source.name, force, buildParams(source.name), {
      useApi2,
      forceNoCache: force,
    });
    if (response?.usedFallback && response?.fallbackSuccess && !useApi2) {
      store.setSourceApi2(source.name, true);
    }
    if (response?.result?.code !== 200) throw new Error('source failed');
    sourceResults[source.name] = response.result;
    sourceStates[source.name] = 'loaded';
    store.markAvailable(source.name);
  } catch {
    sourceStates[source.name] = 'failed';
    store.markUnavailable(source.name);
  }
};

const loadSources = async (force = false, targets = props.sources) => {
  const queue = targets.filter((source) => force || !sourceResults[source.name]);
  let cursor = 0;
  const worker = async () => {
    while (cursor < queue.length) {
      const source = queue[cursor++];
      await loadSource(source, force);
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, Math.max(1, queue.length)) }, () => worker()));
};

const sourceEntries = (sourceName) => {
  const result = sourceResults[sourceName];
  const data = Array.isArray(result?.data) ? result.data : [];
  const query = queryText.value;
  let rank = 1;
  return data
    .filter((item) => {
      if (store.showPinnedRankings) return true;
      return !normalizeRankingBadges(item?.badges).some((badge) => badge.kind === 'pinned');
    })
    .map((item) => {
      const title = stripText(item?.title || item?.originalTitle || '');
      const description = stripText(item?.desc || item?.originalDesc || '');
      const entry = {
        key: `${sourceName}:${item?.id || item?.url || item?.mobileUrl || title}:${rank}`,
        rank: rank++,
        title,
        description,
        hot: stripText(item?.hot || ''),
        author: stripText(item?.author || ''),
        cover: item?.cover || '',
        href: item?.url || item?.mobileUrl || '',
        sourceLabel: getSourceDisplayLabel(sourceName, locale.value, result?.title || sourceName),
      };
      return entry;
    })
    .filter((entry) => entry.title && entry.href)
    .filter((entry) => !query || [entry.title, entry.description, entry.hot, entry.author].some((value) => value.toLowerCase().includes(query)))
    .slice(0, 15);
};

const syncActiveSource = () => {
  scrollFrame = 0;
  if (!props.sources.length) return;
  const anchor = Math.max(120, Math.min(window.innerHeight * 0.28, 240));
  let candidate = props.sources[0]?.name || '';
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const source of props.sources) {
    const el = sectionRefs.get(source.name);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    if (rect.bottom < anchor) {
      candidate = source.name;
      continue;
    }
    const distance = Math.abs(rect.top - anchor);
    if (rect.top <= anchor && rect.bottom >= anchor) {
      candidate = source.name;
      bestDistance = -1;
      break;
    }
    if (bestDistance !== -1 && distance < bestDistance) {
      bestDistance = distance;
      candidate = source.name;
    }
  }
  activeSource.value = candidate;
};
const queueActiveSync = () => {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(syncActiveSource);
};
const scrollToSource = (sourceName) => {
  const el = sectionRefs.get(sourceName);
  if (!el) return;
  activeSource.value = sourceName;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

watch(() => props.sources.map((source) => source.name).join('|'), () => {
  activeSource.value = props.sources[0]?.name || '';
  for (const source of props.sources) {
    if (!sourceStates[source.name]) sourceStates[source.name] = 'idle';
  }
  void loadSources(false, props.sources.slice(0, INITIAL_SOURCE_LOAD_COUNT));
  nextTick(() => {
    for (const el of sectionRefs.values()) sourceLoadObserver?.observe(el);
    queueActiveSync();
  });
}, { immediate: true });
watch(() => catalogRevision.value, () => {
  for (const source of props.sources) {
    delete sourceResults[source.name];
    sourceStates[source.name] = 'idle';
  }
  void loadSources(false, props.sources.slice(0, INITIAL_SOURCE_LOAD_COUNT));
});

const handleRefresh = () => {
  const loaded = props.sources.filter((source) => sourceResults[source.name]);
  void loadSources(true, loaded.length ? loaded : props.sources.slice(0, INITIAL_SOURCE_LOAD_COUNT));
};
onMounted(() => {
  scrollHost = rootEl.value?.closest?.('.n-scrollbar-container') || window;
  scrollHost.addEventListener('scroll', queueActiveSync, { passive: true });
  if (typeof IntersectionObserver !== 'undefined') {
    sourceLoadObserver = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const sourceName = entry.target?.dataset?.source;
        const source = props.sources.find((item) => item.name === sourceName);
        if (source) void loadSource(source);
      }
    }, {
      root: scrollHost === window ? null : scrollHost,
      rootMargin: '800px 0px 800px 0px',
      threshold: 0.01,
    });
    for (const el of sectionRefs.values()) sourceLoadObserver.observe(el);
  } else {
    void loadSources();
  }
  window.addEventListener('resize', queueActiveSync, { passive: true });
  window.addEventListener(DATA_REFRESH_EVENT, handleRefresh);
  nextTick(queueActiveSync);
});
onBeforeUnmount(() => {
  scrollHost?.removeEventListener?.('scroll', queueActiveSync);
  sourceLoadObserver?.disconnect();
  sourceLoadObserver = null;
  window.removeEventListener('resize', queueActiveSync);
  window.removeEventListener(DATA_REFRESH_EVENT, handleRefresh);
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
  scrollHost = null;
});
</script>

<style scoped>
.category-source-rail {
  --csr-primary: #ea444d;
  --csr-panel: #fff;
  --csr-panel-soft: #f7f7f8;
  --csr-border: rgba(31, 34, 37, 0.12);
  --csr-text: rgba(31, 34, 37, 0.94);
  --csr-text-2: rgba(31, 34, 37, 0.7);
  --csr-text-3: rgba(31, 34, 37, 0.54);
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: start;
  gap: 24px;
  width: 100%;
}
.category-source-rail.is-dark {
  --csr-primary: #ff737a;
  --csr-panel: #18181c;
  --csr-panel-soft: #202024;
  --csr-border: rgba(255,255,255,.13);
  --csr-text: rgba(255,255,255,.92);
  --csr-text-2: rgba(255,255,255,.72);
  --csr-text-3: rgba(255,255,255,.54);
}
.category-source-rail__toc {
  position: sticky;
  top: 82px;
}
.category-source-rail__toc-card {
  max-height: calc(100vh - 108px);
  overflow: auto;
  padding: 10px;
  border: 1px solid var(--csr-border);
  border-radius: 14px;
  background: var(--csr-panel);
}
.category-source-rail__toc-title {
  display: flex;
  justify-content: space-between;
  padding: 3px 7px 9px;
  color: var(--csr-text);
  font-size: 12px;
}
.category-source-rail__toc-title span { color: var(--csr-text-3); }
.category-source-rail__toc nav { display: grid; gap: 2px; }
.category-source-rail__toc-item {
  display: grid;
  grid-template-columns: 24px minmax(0,1fr) 8px;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 38px;
  padding: 5px 8px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--csr-text-2);
  cursor: pointer;
  font-size: 12px;
  text-align: left;
}
.category-source-rail__toc-item:hover { background: var(--csr-panel-soft); color: var(--csr-text); }
.category-source-rail__toc-item.active {
  background: color-mix(in srgb, var(--csr-primary) 11%, var(--csr-panel-soft));
  color: var(--csr-primary);
  box-shadow: inset 2px 0 0 var(--csr-primary);
  font-weight: 700;
}
.category-source-rail__toc-item img { width: 24px; height: 24px; border-radius: 6px; object-fit: contain; }
.category-source-rail__toc-item span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.category-source-rail__toc-item i { width: 6px; height: 6px; border-radius: 50%; background: var(--csr-border); }
.category-source-rail__toc-item i.loaded { background: #18a058; }
.category-source-rail__toc-item i.loading { background: #f0a020; }
.category-source-rail__toc-item i.failed { background: #d03050; }
.category-source-rail__main { min-width: 0; display: grid; gap: 16px; }
.category-source-section {
  min-width: 0;
  scroll-margin-top: 92px;
  padding: 12px;
  border: 1px solid var(--csr-border);
  border-radius: 14px;
  background: var(--csr-panel);
}
.category-source-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 9px;
}
.category-source-section__identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
.category-source-section__identity > img { width: 32px; height: 32px; border-radius: 8px; object-fit: contain; }
.category-source-section__identity div { display: grid; min-width: 0; }
.category-source-section__identity strong { color: var(--csr-text); font-size: 15px; }
.category-source-section__identity span { color: var(--csr-text-3); font-size: 11px; }
.category-source-section__more { color: var(--csr-primary); font-size: 11px; font-weight: 650; text-decoration: none; white-space: nowrap; }
.category-source-section__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: clamp(244px, 22vw, 292px);
  gap: 11px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 1px 1px 9px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-behavior: smooth;
  overscroll-behavior-inline: contain;
}
.category-source-section__rail::-webkit-scrollbar { display: none; }
.category-source-section__rail.is-loading { min-height: 174px; }
.category-story-card {
  position: relative;
  box-sizing: border-box;
  display: block;
  min-width: 0;
  height: 174px;
  overflow: hidden;
  border: 1px solid var(--csr-border);
  border-radius: 13px;
  background: var(--csr-panel-soft);
  color: var(--csr-text);
  text-decoration: none;
  scroll-snap-align: start;
  isolation: isolate;
}
.category-story-card:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(0,0,0,.1); }
.category-story-card__cover { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: -3; }
.category-story-card__scrim {
  position: absolute;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(180deg, rgba(6,8,12,.02) 0%, rgba(6,8,12,.04) 32%, rgba(6,8,12,.36) 68%, rgba(6,8,12,.9) 100%),
    linear-gradient(90deg, rgba(6,8,12,.18) 0%, transparent 48%);
  opacity: 0;
}
.category-story-card.has-cover { color: #fff; border-color: rgba(255,255,255,.16); background: #202124; }
.category-story-card.has-cover .category-story-card__scrim { opacity: 1; }
.category-story-card__rank {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 3px 7px;
  border-radius: 999px;
  background: rgba(12,14,18,.58);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  backdrop-filter: blur(8px) saturate(1.15);
}
.category-story-card:not(.has-cover) {
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--csr-primary) 9%, transparent), transparent 34%),
    linear-gradient(145deg, var(--csr-panel), var(--csr-panel-soft));
}
.category-story-card:not(.has-cover) .category-story-card__rank { background: color-mix(in srgb, var(--csr-primary) 10%, var(--csr-panel)); color: var(--csr-primary); }
.category-story-card__content {
  position: absolute;
  inset: auto 0 0;
  display: grid;
  gap: 6px;
  padding: 12px 13px;
}
.category-story-card:not(.has-cover) .category-story-card__content {
  inset: 0;
  grid-template-rows: auto minmax(0, 1fr) auto;
  align-content: stretch;
  padding: 46px 14px 12px;
}
.category-story-card.has-cover .category-story-card__content {
  padding-top: 28px;
  text-shadow: 0 1px 2px rgba(0,0,0,.52), 0 2px 8px rgba(0,0,0,.34);
}
.category-story-card__title {
  display: -webkit-box;
  overflow: hidden;
  font-size: 14px;
  font-weight: 750;
  line-height: 1.36;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.category-story-card:not(.has-cover) .category-story-card__title {
  -webkit-line-clamp: 3;
}
.category-story-card p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: inherit;
  opacity: .76;
  font-size: 11px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.category-story-card:not(.has-cover) p {
  -webkit-line-clamp: 3;
}
.category-story-card__meta { display: flex; justify-content: space-between; gap: 8px; color: inherit; opacity: .74; font-size: 10px; }
.category-story-card.has-cover p { opacity: .82; }
.category-story-card.has-cover .category-story-card__meta { opacity: .84; }
.category-story-card.skeleton { background: linear-gradient(100deg,var(--csr-panel-soft) 20%,color-mix(in srgb,var(--csr-panel-soft) 55%,var(--csr-panel)) 45%,var(--csr-panel-soft) 70%); background-size: 200% 100%; animation: csr-shimmer 1.4s linear infinite; }
.category-source-section__error { display: flex; align-items: center; justify-content: space-between; min-height: 92px; padding: 14px; border-radius: 12px; background: var(--csr-panel-soft); color: var(--csr-text-3); font-size: 12px; }
.category-source-section__error button { border: 0; background: transparent; color: var(--csr-primary); cursor: pointer; font-weight: 650; }
@keyframes csr-shimmer { to { background-position: -200% 0; } }
@media (max-width: 900px) {
  .category-source-rail { grid-template-columns: 180px minmax(0,1fr); gap: 14px; }
  .category-source-section__rail { grid-auto-columns: min(78vw, 290px); }
}
@media (max-width: 680px) {
  .category-source-rail { grid-template-columns: minmax(0,1fr); }
  .category-source-rail__toc { position: sticky; top: 0; z-index: 4; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; background: var(--csr-panel); border-bottom: 1px solid var(--csr-border); }
  .category-source-rail__toc::-webkit-scrollbar { display: none; }
  .category-source-rail__toc-card { display: flex; max-height: none; overflow: visible; padding: 7px 0; border: 0; border-radius: 0; }
  .category-source-rail__toc-title { display: none; }
  .category-source-rail__toc nav { display: flex; gap: 4px; }
  .category-source-rail__toc-item { grid-template-columns: 20px max-content; min-height: 32px; width: auto; padding: 4px 8px; }
  .category-source-rail__toc-item img { width: 20px; height: 20px; }
  .category-source-rail__toc-item i { display: none; }
  .category-source-section { padding: 10px; border-radius: 12px; }
  .category-source-section__rail { grid-auto-columns: min(82vw, 286px); }
}
</style>
