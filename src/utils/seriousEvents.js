const SERIOUS_EVENT_PATTERN = /(去世|逝世|病逝|离世|辞世|身亡|遇难|罹难|讣告|死亡|passed away|died|death|obituary|訃報|死去|死亡|사망|별세|부고)/i;

const FUNERAL_EVENT_PATTERN = new RegExp([
  String.raw`遗体[^，。；;]{0,12}(?:告别|瞻仰|火化|安葬)`,
  String.raw`(?:追悼仪式|追悼会|葬礼|出殡|灵堂|挽联|敬献花圈)`,
  String.raw`(?:八宝山|殡仪馆|陵园|墓园)[^，。；;]{0,18}(?:举行|花圈|安葬)`,
].join('|'), 'i');

const FAREWELL_CEREMONY_PATTERN = /告别仪式/i;
const NON_FUNERAL_FAREWELL_PATTERN = /(?:毕业|退役|离职|赛事|演出|巡演)[^，。；;]{0,8}告别仪式|告别(?:信|赛|演出|舞台|巡演|单身)/i;
const OBSERVER_ACTION_PATTERN = /(?:现身|出席|参加|到场|亮相|露面|送别|吊唁|悼念|痛悼|哀悼|发文|撰文|写信|发声|回应|回忆|追忆|哽咽|落泪|痛哭|全黑打扮|身穿黑)/i;

const RETROSPECTIVE_EVENT_PATTERN = new RegExp([
  String.raw`(?:去世|逝世|离世|病逝|辞世)(?:已)?[^，。；;]{0,8}(?:[一二三四五六七八九十百两\d]+(?:年|周年)|纪念|忌日)`,
  String.raw`[一二三四五六七八九十百两\d]+年(?:前|后)?[^，。；;]{0,6}(?:去世|逝世|离世|病逝|辞世)`,
  String.raw`(?:周年祭|周年纪念|逝世纪念|去世纪念|离世纪念|忌日)`,
  String.raw`\b\d+\s+years?\s+(?:since|after)\b.{0,24}\b(?:death|died|passed away)\b`,
  String.raw`\b(?:death|died|passed away)\b.{0,24}\b(?:anniversary|\d+\s+years?\s+ago)\b`,
  String.raw`(?:死去|逝去|死亡)から\d+年|没後\d+年|命日`,
  String.raw`(?:사망|별세)\s*\d+주년|(?:사망|별세)한\s*지\s*\d+년`,
].join('|'), 'i');

const firstSignalIndex = (text) => {
  const indexes = [
    text.search(SERIOUS_EVENT_PATTERN),
    text.search(FUNERAL_EVENT_PATTERN),
    text.search(FAREWELL_CEREMONY_PATTERN),
  ].filter((index) => index >= 0);
  return indexes.length ? Math.min(...indexes) : -1;
};

export const isSeriousEventText = (value = '') => {
  const text = String(value || '').trim();
  if (!text) return false;
  const directDeathSignal = SERIOUS_EVENT_PATTERN.test(text);
  const funeralSignal = FUNERAL_EVENT_PATTERN.test(text);
  const contextualFarewellSignal =
    FAREWELL_CEREMONY_PATTERN.test(text) &&
    !NON_FUNERAL_FAREWELL_PATTERN.test(text);
  if (!directDeathSignal && !funeralSignal && !contextualFarewellSignal) return false;
  if (RETROSPECTIVE_EVENT_PATTERN.test(text)) return false;

  const signalIndex = firstSignalIndex(text);
  if (signalIndex > 0 && OBSERVER_ACTION_PATTERN.test(text.slice(0, signalIndex))) return false;
  return true;
};

export const isSeriousEvent = (item) =>
  isSeriousEventText(item?.title || '');
