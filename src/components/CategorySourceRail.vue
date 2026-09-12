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
            v-for="source in orderedSources"
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

    <draggable
      v-model="orderedSources"
      class="category-source-rail__main"
      item-key="name"
      handle=".category-source-section__drag"
      :animation="180"
      ghost-class="category-source-section--ghost"
      chosen-class="category-source-section--chosen"
      @end="handleSourceDragEnd"
    >
      <template #item="{ element: source }">
          <section
            :id="sectionId(source.name)"
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
            <div v-if="sourceSubtypeOptions(source.name).length > 1" class="category-source-section__subtypes" :aria-label="sourceLabel(source)">
              <button
                v-for="item in sourceSubtypeOptions(source.name)"
                :key="item.value"
                type="button"
                class="category-source-section__subtype"
                :class="{ active: sourceSubtype(source.name) === item.value }"
                :aria-pressed="sourceSubtype(source.name) === item.value"
                @click.stop="changeSourceSubtype(source, item.value)"
              >
                {{ item.label }}
              </button>
            </div>
            <div class="category-source-section__tools">
              <div class="category-source-section__freshness">
                <span class="category-source-section__time">{{ sourceUpdateTime(source.name) || copy.updateFailed }}</span>
                <button type="button" class="category-source-section__tool" :class="{ loading: sourceStates[source.name] === 'loading' }" :title="copy.refreshLatest" :aria-label="copy.refreshLatest" @click.stop="loadSource(source, true)">
                  <Refresh />
                </button>
              </div>
              <button type="button" class="category-source-section__tool category-source-section__drag" :title="copy.dragSort" :aria-label="copy.dragSort">
                <Drag />
              </button>
              <router-link class="category-source-section__more" :to="sourcePath(source)">
                {{ copy.viewRanking }} <span aria-hidden="true">→</span>
              </router-link>
            </div>
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
              :class="[{ 'has-cover': Boolean(entry.cover) }, rankClass(entry.rank)]"
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
              <span class="category-story-card__rank">{{ entry.rank }}</span>
              <RankingBadgeGroup
                v-if="entry.suffixBadges.length"
                class="category-story-card__badges"
                :badges="entry.suffixBadges"
              />
              <div class="category-story-card__content">
                <div class="category-story-card__title">{{ entry.title }}</div>
                <p v-if="entry.description">{{ entry.description }}</p>
                <div class="category-story-card__meta">
                  <span>{{ entry.hot ? `${copy.heat} ${formatCompactMetric(entry.hot, locale)}` : entry.sourceLabel }}</span>
                  <span v-if="entry.author">{{ entry.author }}</span>
                </div>
              </div>
            </a>
          </div>
        </section>
      </template>
    </draggable>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import draggable from 'vuedraggable';
import { Drag, Refresh } from '@icon-park/vue-next';
import RankingBadgeGroup from '@/components/RankingBadgeGroup.vue';
import { mainStore } from '@/store';
import { getSharedRanking } from '@/utils/rankingCollection';
import {
  buildSourceSubtypeParams,
  getDefaultSourceSubtype,
  getSourceSubtypeGroups,
  getSourceSubtypeOptions,
  persistSourceSubtype,
  readSourceSubtype,
  resolveSourceSubtype,
} from '@/utils/sourceSubtypes';
import { getSourceDisplayLabel, getSourceSubtitleLabel, localizeSubtypeGroups } from '@/utils/sourceLabels';
import { buildRankPath, getLocaleFromRoute, normalizeLocale } from '@/utils/locale';
import { getSourceLogo, getSourceLogoFallback } from '@/utils/sourceLogos';
import { getCoverDisplaySrc } from '@/utils/imageProxy';
import { normalizeRankingBadges } from '@/utils/rankingBadges';
import { useTrendsCatalogRevision } from '@/composables/useTrendsCatalogRevision';
import { DATA_REFRESH_EVENT } from '@/utils/dataRefresh';
import { formatTime } from '@/utils/getTime';
import { formatCompactMetric } from '@/utils/compactMetric';

const props = defineProps({
  sources: { type: Array, default: () => [] },
});
const emit = defineEmits(['reorder']);

const route = useRoute();
const store = mainStore();
const { locale: i18nLocale } = useI18n({ useScope: 'global' });
const catalogRevision = useTrendsCatalogRevision();
const locale = computed(() => normalizeLocale(getLocaleFromRoute(route) || i18nLocale.value));
const COPY = {
  'zh-CN': { sourceDirectory: '来源目录', viewRanking: '查看榜单', loadFailed: '该来源暂时加载失败', retry: '重试', noSearchResults: '没有匹配当前搜索的条目', noContent: '暂无内容', heat: '热度', dragSort: '拖拽排序', refreshLatest: '更新', updateFailed: '更新时间未知' },
  en: { sourceDirectory: 'Sources', viewRanking: 'View ranking', loadFailed: 'This source is temporarily unavailable', retry: 'Retry', noSearchResults: 'No items match the current search', noContent: 'No content', heat: 'Heat', dragSort: 'Drag to reorder', refreshLatest: 'Refresh', updateFailed: 'Update time unavailable' },
  'zh-TW': { sourceDirectory: '來源目錄', viewRanking: '查看榜單', loadFailed: '此來源暫時載入失敗', retry: '重試', noSearchResults: '沒有符合目前搜尋的項目', noContent: '暫無內容', heat: '熱度', dragSort: '拖曳排序', refreshLatest: '更新', updateFailed: '更新時間未知' },
  ja: { sourceDirectory: 'ソース目次', viewRanking: 'ランキングを見る', loadFailed: 'このソースは一時的に読み込めません', retry: '再試行', noSearchResults: '検索に一致する項目がありません', noContent: 'コンテンツがありません', heat: '注目度', dragSort: 'ドラッグで並べ替え', refreshLatest: '更新', updateFailed: '更新時刻不明' },
  ko: { sourceDirectory: '출처 목차', viewRanking: '랭킹 보기', loadFailed: '이 출처를 일시적으로 불러올 수 없습니다', retry: '다시 시도', noSearchResults: '검색과 일치하는 항목이 없습니다', noContent: '콘텐츠 없음', heat: '인기도', dragSort: '드래그하여 정렬', refreshLatest: '새로고침', updateFailed: '업데이트 시간 없음' },
};
const copy = computed(() => COPY[locale.value] || COPY['zh-CN']);
const sourceResults = reactive({});
const sourceSubtypes = reactive({});
const orderedSources = ref(props.sources.slice());
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
  sourceSubtypes[sourceName] || readSourceSubtype(sourceName) || getDefaultSourceSubtype(sourceName),
);
const sourceSubtypeGroups = (sourceName) =>
  localizeSubtypeGroups(getSourceSubtypeGroups(sourceName), locale.value);
const sourceSubtypeOptions = (sourceName) =>
  sourceSubtypeGroups(sourceName).flatMap((group) => group.items || []);
const sourcePath = (source) => buildRankPath(locale.value, source.name, sourceSubtype(source.name) || '');
const sourceUpdateTime = (sourceName) => {
  void store.timeData;
  const value = sourceResults[sourceName]?.updateTime;
  return value ? formatTime(value, locale.value) : '';
};
const rankClass = (rank) => ({
  'is-one': rank === 1,
  'is-two': rank === 2,
  'is-three': rank === 3,
});
const changeSourceSubtype = async (source, subtype) => {
  if (!source?.name || !subtype || sourceSubtype(source.name) === subtype) return;
  sourceSubtypes[source.name] = subtype;
  persistSourceSubtype(source.name, subtype);
  delete sourceResults[source.name];
  sourceStates[source.name] = 'idle';
  await loadSource(source, true);
};
const handleSourceDragEnd = () => {
  emit('reorder', orderedSources.value.map((source) => source.name));
};
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
        suffixBadges: normalizeRankingBadges(item?.badges, 3).filter((badge) => badge.placement !== 'prefix'),
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
  if (!orderedSources.value.length) return;
  const anchor = Math.max(120, Math.min(window.innerHeight * 0.28, 240));
  let candidate = orderedSources.value[0]?.name || '';
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const source of orderedSources.value) {
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
  orderedSources.value = props.sources.slice();
  if (!props.sources.some((source) => source.name === activeSource.value)) {
    activeSource.value = props.sources[0]?.name || '';
  }
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
.category-source-section--ghost { opacity: .45; }
.category-source-section--chosen { cursor: grabbing; }
.category-source-section {
  min-width: 0;
  scroll-margin-top: 92px;
  padding: 12px;
  border: 1px solid var(--csr-border);
  border-radius: 14px;
  background: var(--csr-panel);
}
.category-source-section__header {
  display: grid;
  grid-template-columns: minmax(130px, auto) minmax(0, 1fr) auto;
  align-items: center;
  gap: 14px;
  margin-bottom: 9px;
}
.category-source-section__identity { display: flex; align-items: center; gap: 10px; min-width: 0; }
.category-source-section__identity > img { width: 32px; height: 32px; border-radius: 8px; object-fit: contain; }
.category-source-section__identity div { display: grid; min-width: 0; }
.category-source-section__identity strong { color: var(--csr-text); font-size: 15px; }
.category-source-section__identity span { color: var(--csr-text-3); font-size: 11px; }
.category-source-section__subtypes { display: flex; min-width: 0; gap: 4px; overflow-x: auto; scrollbar-width: none; }
.category-source-section__subtypes::-webkit-scrollbar { display: none; }
.category-source-section__subtype { flex: 0 0 auto; padding: 5px 8px; border: 0; border-radius: 7px; background: transparent; color: var(--csr-text-2); cursor: pointer; font: inherit; font-size: 11px; font-weight: 620; line-height: 1.1; }
.category-source-section__subtype:hover { background: var(--csr-panel-soft); color: var(--csr-text); }
.category-source-section__subtype.active { background: color-mix(in srgb, var(--csr-primary) 11%, var(--csr-panel-soft)); color: var(--csr-primary); font-weight: 730; }
.category-source-section__tools { display: flex; align-items: center; justify-content: flex-end; gap: 5px; min-width: 0; }
.category-source-section__freshness { display: inline-flex; align-items: center; gap: 2px; min-width: 0; }
.category-source-section__time { max-width: 92px; overflow: hidden; color: var(--csr-text-3); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
.category-source-section__tool { display: inline-flex; align-items: center; justify-content: center; width: 26px; height: 26px; padding: 0; border: 0; border-radius: 7px; background: transparent; color: var(--csr-text-3); cursor: pointer; }
.category-source-section__tool:hover { background: var(--csr-panel-soft); color: var(--csr-text); }
.category-source-section__tool svg { width: 15px; height: 15px; }
.category-source-section__drag { cursor: grab; }
.category-source-section__drag:active { cursor: grabbing; }
.category-source-section__tool.loading svg { animation: csr-spin .8s linear infinite; }
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
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--csr-text-3) 46%, transparent) transparent;
  scroll-behavior: smooth;
  overscroll-behavior-inline: contain;
}
.category-source-section__rail::-webkit-scrollbar { height: 7px; }
.category-source-section__rail::-webkit-scrollbar-track { background: transparent; }
.category-source-section__rail::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: color-mix(in srgb, var(--csr-text-3) 46%, transparent);
  background-clip: padding-box;
}
.category-source-section__rail::-webkit-scrollbar-thumb:hover {
  background: color-mix(in srgb, var(--csr-text-2) 66%, transparent);
  background-clip: padding-box;
}
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
  border: 1px solid rgba(255,255,255,.18);
  background: rgba(12,14,18,.48);
  box-shadow: 0 3px 10px rgba(0,0,0,.16);
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
}
.category-story-card:not(.has-cover) {
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--csr-primary) 9%, transparent), transparent 34%),
    linear-gradient(145deg, var(--csr-panel), var(--csr-panel-soft));
}
.category-story-card:not(.has-cover) .category-story-card__rank { border-color: color-mix(in srgb, var(--csr-primary) 22%, transparent); background: color-mix(in srgb, var(--csr-primary) 12%, transparent); color: var(--csr-primary); }
.category-story-card.is-one .category-story-card__rank { background: rgba(234,68,77,.84); color: #fff; }
.category-story-card.is-two .category-story-card__rank { background: rgba(237,112,45,.84); color: #fff; }
.category-story-card.is-three .category-story-card__rank { background: rgba(238,173,63,.84); color: #fff; }
.category-story-card__badges { position: absolute; top: 10px; right: 10px; z-index: 2; max-width: calc(100% - 68px); }
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
@keyframes csr-spin { to { transform: rotate(360deg); } }
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
  .category-source-section__header { grid-template-columns: minmax(0, 1fr) auto; gap: 8px; }
  .category-source-section__subtypes { grid-column: 1 / -1; grid-row: 2; }
  .category-source-section__time { display: none; }
  .category-source-section__more { display: none; }
  .category-source-section__rail { grid-auto-columns: min(82vw, 286px); }
}
</style>
