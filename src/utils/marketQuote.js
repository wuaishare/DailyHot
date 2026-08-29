import { normalizeLocale } from "@/utils/locale";

const MARKET_QUOTE_SOURCES = new Set(["sse", "szse"]);

const MARKET_LABELS = {
  "zh-CN": { close: "收盘", turnover: "成交额" },
  "zh-TW": { close: "收盤", turnover: "成交額" },
  en: { close: "Close", turnover: "Turnover" },
  ja: { close: "終値", turnover: "売買代金" },
  ko: { close: "종가", turnover: "거래대금" },
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

  return {
    code: String(extra.code),
    price: formatNumber(extra.last, targetLocale, 3),
    change: `${changePrefix}${formatNumber(validChangeRate, targetLocale, 2)}%`,
    turnover: formatCompact(extra.amount, targetLocale),
    closeLabel: labels.close,
    turnoverLabel: labels.turnover,
    tone: validChangeRate > 0 ? "up" : validChangeRate < 0 ? "down" : "flat",
  };
};
