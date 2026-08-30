import { normalizeLocale } from "@/utils/locale";

const MARKET_QUOTE_SOURCES = new Set([
  "xueqiu",
  "sse",
  "szse",
  "hkex",
  "nasdaq",
  "nyse",
  "twse",
  "nse",
  "global-indexes",
]);

const MARKET_LABELS = {
  "zh-CN": { close: "收盘", hkClose: "收市", current: "现价", index: "最新", turnover: "成交额", volume: "成交量", trades: "成交笔数", turnoverRate: "换手率", heat: "热度", previousClose: "昨收" },
  "zh-TW": { close: "收盤", hkClose: "收市", current: "現價", index: "最新", turnover: "成交額", volume: "成交量", trades: "成交筆數", turnoverRate: "換手率", heat: "熱度", previousClose: "昨收" },
  en: { close: "Close", hkClose: "Close", current: "Price", index: "Latest", turnover: "Turnover", volume: "Volume", trades: "Trades", turnoverRate: "Turnover rate", heat: "Heat", previousClose: "Prev Close" },
  ja: { close: "終値", hkClose: "終値", current: "現在値", index: "最新", turnover: "売買代金", volume: "出来高", trades: "約定件数", turnoverRate: "売買回転率", heat: "注目度", previousClose: "前日終値" },
  ko: { close: "종가", hkClose: "종가", current: "현재가", index: "현재", turnover: "거래대금", volume: "거래량", trades: "거래 건수", turnoverRate: "회전율", heat: "인기도", previousClose: "전일 종가" },
};

const FUND_LABELS = {
  "zh-CN": "年化(近5年)",
  "zh-TW": "年化(近5年)",
  en: "Annualized (5Y)",
  ja: "年率 (5年)",
  ko: "연환산 (5년)",
};

const REGION_LABELS = {
  "zh-CN": { CN: "中国大陆", HK: "中国香港", TW: "中国台湾", US: "美国", IN: "印度" },
  "zh-TW": { CN: "中國大陸", HK: "中國香港", TW: "中國臺灣", US: "美國", IN: "印度" },
  en: { CN: "Mainland China", HK: "Hong Kong, China", TW: "Taiwan, China", US: "United States", IN: "India" },
  ja: { CN: "中国本土", HK: "中国香港", TW: "中国台湾", US: "米国", IN: "インド" },
  ko: { CN: "중국 본토", HK: "중국 홍콩", TW: "중국 대만", US: "미국", IN: "인도" },
};

const CURRENCY_PREFIXES = {
  HKD: "HK$",
  USD: "$",
  CNY: "CN¥",
  TWD: "NT$",
  INR: "₹",
};

export const isMarketQuoteSource = (name) =>
  MARKET_QUOTE_SOURCES.has(String(name || "").trim());

const formatNumber = (value, locale, maximumFractionDigits = 3) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "-";
  try {
    return new Intl.NumberFormat(locale, {
      maximumFractionDigits,
    }).format(numericValue);
  } catch {
    return String(numericValue);
  }
};

const formatCompact = (value, locale) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return "-";
  try {
    return new Intl.NumberFormat(locale, {
      notation: "compact",
      maximumFractionDigits: 2,
    }).format(numericValue);
  } catch {
    return formatNumber(numericValue, locale, 2);
  }
};

export const getMarketQuoteView = (item, locale = "zh-CN") => {
  const extra = item?.extra;
  if (!extra || !extra.code) return null;

  const targetLocale = normalizeLocale(locale);
  const labels = MARKET_LABELS[targetLocale] || MARKET_LABELS["zh-CN"];
  const changeRate = Number(extra.changeRate);
  const validChangeRate = Number.isFinite(changeRate) ? changeRate : 0;
  const changePrefix = validChangeRate > 0 ? "+" : "";

  const currencyPrefix = CURRENCY_PREFIXES[String(extra.currency || "").toUpperCase()] || "";
  const price = `${currencyPrefix}${formatNumber(extra.last, targetLocale, 3)}`;

  const metricKind =
    extra.metricKind === "heat"
      ? "heat"
      : extra.metricKind === "previousClose"
        ? "previousClose"
        : extra.metricKind === "trades"
          ? "trades"
          : extra.metricKind === "turnoverRate"
            ? "turnoverRate"
            : extra.metric === "volume"
              ? "volume"
              : "turnover";
  const metricValue =
    metricKind === "heat"
      ? extra.metricValue
      : metricKind === "previousClose"
        ? extra.metricValue ?? extra.previousClose
        : metricKind === "trades"
          ? extra.metricValue ?? extra.tradeCount
          : metricKind === "turnoverRate"
            ? extra.metricValue ?? extra.turnoverRate
            : metricKind === "volume"
              ? extra.volume
              : extra.amount;
  const market = String(extra.market || "").toUpperCase();
  const colorConvention =
    extra.colorConvention === "greenUp" || market === "US" ? "western" : "cn";
  const closeLabel =
    extra.priceLabelKind === "current"
      ? labels.current
      : extra.priceLabelKind === "index"
        ? labels.index
        : market === "HK"
          ? labels.hkClose
          : labels.close;

  const regionLabels = REGION_LABELS[targetLocale] || REGION_LABELS["zh-CN"];
  const regionCode = String(extra.regionCode || market || "").toUpperCase();

  return {
    code: String(extra.code),
    region: String(regionLabels[regionCode] || extra.region || ""),
    price,
    change: `${changePrefix}${formatNumber(validChangeRate, targetLocale, 2)}%`,
    metric:
      metricKind === "previousClose"
        ? formatNumber(metricValue, targetLocale, 3)
        : metricKind === "turnoverRate"
          ? `${formatNumber(metricValue, targetLocale, 2)}%`
          : formatCompact(metricValue, targetLocale),
    metricLabel: labels[metricKind],
    closeLabel,
    tone: validChangeRate > 0 ? "up" : validChangeRate < 0 ? "down" : "flat",
    colorConvention,
  };
};

export const getFundMetricView = (item, locale = "zh-CN") => {
  const metric = item?.extra?.fundMetric;
  if (!metric || !Number.isFinite(Number(metric.value))) return null;
  const targetLocale = normalizeLocale(locale);
  const value = Number(metric.value);
  return {
    label: FUND_LABELS[targetLocale] || FUND_LABELS["zh-CN"],
    value: `${value > 0 ? "+" : ""}${formatNumber(value, targetLocale, 2)}%`,
    tone: value > 0 ? "up" : value < 0 ? "down" : "flat",
  };
};
