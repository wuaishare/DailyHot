const SERIOUS_EVENT_PATTERN = /(去世|逝世|病逝|离世|辞世|身亡|遇难|罹难|讣告|死亡|passed away|died|death|obituary|訃報|死去|死亡|사망|별세|부고)/i;

const FUNERAL_EVENT_PATTERN = new RegExp([
  String.raw`遗体[^，。；;]{0,12}(?:告别|送别|瞻仰|火化|安葬)`,
  String.raw`(?:追悼仪式|追悼会|葬礼|出殡|吊唁|灵堂|挽联|敬献花圈|痛悼|哀悼|沉痛悼念)`,
  String.raw`(?:八宝山|殡仪馆|陵园|墓园)[^，。；;]{0,18}(?:告别|送别|举行|花圈|吊唁|安葬)`,
  String.raw`(?:亲友|家属|众人|好友|同行)[^，。；;]{0,12}(?:送别|吊唁)`,
].join('|'), 'i');

const FAREWELL_CEREMONY_PATTERN = /告别仪式/i;
const NON_FUNERAL_FAREWELL_PATTERN = /(?:毕业|退役|离职|赛事|演出|巡演)[^，。；;]{0,8}告别仪式|告别(?:信|赛|演出|舞台|巡演|单身)/i;

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
  if (!text) return false;
  const directDeathSignal = SERIOUS_EVENT_PATTERN.test(text);
  const funeralSignal = FUNERAL_EVENT_PATTERN.test(text);
  const contextualFarewellSignal =
    FAREWELL_CEREMONY_PATTERN.test(text) &&
    !NON_FUNERAL_FAREWELL_PATTERN.test(text);
  if (!directDeathSignal && !funeralSignal && !contextualFarewellSignal) return false;
  return !RETROSPECTIVE_EVENT_PATTERN.test(text);
};

const seriousEventContext = (item) => {
  const confirmations = item?.extra?.hotEvent?.confirmations;
  const evidenceTitles = Array.isArray(confirmations)
    ? confirmations.map((entry) => entry?.title || '').filter(Boolean)
    : [];
  return [item?.title || '', item?.desc || '', ...evidenceTitles].filter(Boolean).join(' ');
};

export const isSeriousEvent = (item) =>
  isSeriousEventText(seriousEventContext(item));
