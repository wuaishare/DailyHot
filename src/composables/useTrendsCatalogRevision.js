import { onBeforeUnmount, onMounted, ref } from "vue";
import { subscribeTrendsSourceCatalog } from "@/utils/sourceSubtypes";

export const useTrendsCatalogRevision = () => {
  const revision = ref(0);
  let unsubscribe = null;

  onMounted(() => {
    unsubscribe = subscribeTrendsSourceCatalog(() => {
      revision.value += 1;
    });
  });

  onBeforeUnmount(() => {
    unsubscribe?.();
    unsubscribe = null;
  });

  return revision;
};
