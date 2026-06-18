import LunarCalendar from "lunar-calendar";

const normalizeLocale = (locale = "zh-CN") => {
  const value = String(locale).toLowerCase();
  if (value.startsWith("zh-tw")) return "zh-TW";
  if (value.startsWith("en")) return "en";
  if (value.startsWith("ja")) return "ja";
  if (value.startsWith("ko")) return "ko";
  return "zh-CN";
};

const RELATIVE_TIME_FORMATTERS = {
  "zh-CN": {
    justNow: () => "刚刚更新",
    minutes: (minutes) => `${minutes}分钟前更新`,
    hours: (hours) => `${hours}小时前更新`,
    date: (date) => `${date.getMonth() + 1}月${date.getDate()}日`,
  },
  en: {
    justNow: () => "Updated just now",
    minutes: (minutes) => `Updated ${minutes} minute${minutes > 1 ? "s" : ""} ago`,
    hours: (hours) => `Updated ${hours} hour${hours > 1 ? "s" : ""} ago`,
    date: (date) =>
      new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
      }).format(date),
  },
  "zh-TW": {
    justNow: () => "剛剛更新",
    minutes: (minutes) => `${minutes}分鐘前更新`,
    hours: (hours) => `${hours}小時前更新`,
    date: (date) => `${date.getMonth() + 1}月${date.getDate()}日`,
  },
  ja: {
    justNow: () => "たった今更新",
    minutes: (minutes) => `${minutes}分前に更新`,
    hours: (hours) => `${hours}時間前に更新`,
    date: (date) =>
      new Intl.DateTimeFormat("ja", {
        month: "numeric",
        day: "numeric",
      }).format(date),
  },
  ko: {
    justNow: () => "방금 업데이트됨",
    minutes: (minutes) => `${minutes}분 전 업데이트`,
    hours: (hours) => `${hours}시간 전 업데이트`,
    date: (date) =>
      new Intl.DateTimeFormat("ko", {
        month: "numeric",
        day: "numeric",
      }).format(date),
  },
};

export const formatTime = (timestamp, locale = "zh-CN") => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = (now.getTime() - date.getTime()) / 1000;
  const diffInMinutes = diffInSeconds / 60;
  const diffInHours = diffInMinutes / 60;
  const formatter =
    RELATIVE_TIME_FORMATTERS[normalizeLocale(locale)] ||
    RELATIVE_TIME_FORMATTERS["zh-CN"];

  if (diffInSeconds < 60) {
    return formatter.justNow();
  } else if (diffInMinutes < 60) {
    const minutes = Math.floor(diffInMinutes);
    return formatter.minutes(minutes);
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours);
    return formatter.hours(hours);
  } else {
    return formatter.date(date);
  }
};

export const getCurrentTime = () => {
  const time = new Date();
  const year = time.getFullYear();
  const month =
    time.getMonth() + 1 < 10
      ? "0" + (time.getMonth() + 1)
      : time.getMonth() + 1;
  const day = time.getDate() < 10 ? "0" + time.getDate() : time.getDate();
  const hour = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
  const minute =
    time.getMinutes() < 10 ? "0" + time.getMinutes() : time.getMinutes();
  const second =
    time.getSeconds() < 10 ? "0" + time.getSeconds() : time.getSeconds();
  const weekday = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六",
  ];
  // 获取农历
  const lunar = LunarCalendar.solarToLunar(
    time.getFullYear(),
    time.getMonth() + 1,
    time.getDate()
  );
  const currentTime = {
    time: {
      year,
      month,
      day,
      hour,
      minute,
      second,
      weekday: weekday[time.getDay()],
      text:
        year +
        "-" +
        month +
        "-" +
        day +
        " " +
        hour +
        ":" +
        minute +
        ":" +
        second,
    },
    lunar: {
      data: lunar,
      year: lunar.lunarYear,
      month: lunar.lunarMonthName,
      day: lunar.lunarDayName,
      GanZhiYear: lunar.GanZhiYear,
      GanZhiMonth: lunar.GanZhiMonth,
      GanZhiDay: lunar.GanZhiDay,
      text: lunar.lunarMonthName + lunar.lunarDayName,
    },
  };
  return currentTime;
};
