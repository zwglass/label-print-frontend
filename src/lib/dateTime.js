function toDate(value = new Date()) {
  return value instanceof Date ? value : new Date(value);
}

function padNumber(value, length = 2) {
  return String(value).padStart(length, "0");
}

export function formatDate(value = new Date()) {
  const date = toDate(value);
  return [
    date.getFullYear(),
    padNumber(date.getMonth() + 1),
    padNumber(date.getDate()),
  ].join("-");
}

export function formatTime(value = new Date()) {
  const date = toDate(value);
  return [
    padNumber(date.getHours()),
    padNumber(date.getMinutes()),
    padNumber(date.getSeconds()),
  ].join(":");
}

export function formatDateTime(value = new Date()) {
  return `${formatDate(value)} ${formatTime(value)}`;
}

export function formatMonth(value = new Date()) {
  const date = toDate(value);
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}`;
}

export function formatYear(value = new Date()) {
  return String(toDate(value).getFullYear());
}

export function getIsoWeek(value = new Date()) {
  const date = toDate(value);
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);

  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);

  return {
    year: utcDate.getUTCFullYear(),
    week,
  };
}

export function formatIsoWeek(value = new Date()) {
  const { year, week } = getIsoWeek(value);
  return `${year}-W${padNumber(week)}`;
}

export const dateTimeFormatTokens = [
  { token: "$date", label: "YYYY-MM-DD", format: formatDate },
  { token: "$datetime", label: "YYYY-MM-DD HH:mm:ss", format: formatDateTime },
  { token: "$time", label: "HH:mm:ss", format: formatTime },
  { token: "$month", label: "YYYY-MM", format: formatMonth },
  { token: "$year", label: "YYYY", format: formatYear },
  { token: "$week", label: "YYYY-Www", format: formatIsoWeek },
];

export function getDateTimeFormatOptions(value = new Date()) {
  return dateTimeFormatTokens.map((item) => ({
    token: item.token,
    value: item.token,
    label: item.label,
    example: item.format(value),
  }));
}

export function formatDateTimeToken(token, value = new Date()) {
  const item = dateTimeFormatTokens.find((option) => option.token === token);
  return item ? item.format(value) : token;
}

export function getCurrentDateTimeFormats(value = new Date()) {
  return {
    date: formatDate(value),
    time: formatTime(value),
    dateTime: formatDateTime(value),
    month: formatMonth(value),
    year: formatYear(value),
    isoWeek: formatIsoWeek(value),
  };
}
