const SERIOUS_EVENT_PATTERN = /(去世|逝世|病逝|离世|辞世|身亡|遇难|罹难|讣告|死亡|passed away|died|death|obituary|訃報|死去|死亡|사망|별세|부고)/i;

const RETROSPECTIVE_EVENT_PATTERN = new RegExp([
  String.raw`(?:去世|逝世|离世|病逝|辞世)(?:已)?[^，。；;]{0,8}(?:[一二三四五六七八九十百两\d]+(?:年|周年)|纪念|忌日)`,
  String.raw`[一二三四五六七八九十百两\d]+年(?:前|后)?[^，。；;]{0,6}(?:去世|逝世|离世|病逝|辞世)`,
  String.raw`(?:周年祭|周年纪念|逝世纪念|去世纪念|离世纪念|忌日)`,
  String.raw`\b\d+\s+years?\s+(?:since|after)\b.{0,24}\b(?:death|died|passed away)\b`,
  String.raw`\b(?:death|died|passed away)\b.{0,24}\b(?:anniversary|\d+\s+years?\s+ago)\b`,
  String.raw`(?:死去|逝去|死亡)から\d+年|没後\d+年|命日`,
  String.raw`(?:사망|별세)\s*\d+주년|(?:사망|별세)한\s*지\s*\d+년`,
].join('|'), 'i');

export const isSeriousEventText = (value = '') => {
  const text = String(value || '').trim();
  if (!text || !SERIOUS_EVENT_PATTERN.test(text)) return false;
  return !RETROSPECTIVE_EVENT_PATTERN.test(text);
};

export const isSeriousEvent = (item) =>
  isSeriousEventText(`${item?.title || ''} ${item?.desc || ''}`);
