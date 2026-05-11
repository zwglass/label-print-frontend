import { getDisplayTitleValue } from "./labelModels";

const prefix = "zwglass-label:";

export function getLabelKey(type, title) {
  if (!title) return `${prefix}${type}`;
  return `${prefix}${type}:${title}`;
}

function getLatestLabelKey(type) {
  return `${prefix}${type}:latest`;
}

function isSavedLabelKey(type, key) {
  return key.startsWith(`${prefix}${type}:`) && key !== getLatestLabelKey(type);
}

export function loadSavedLabel(type, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const latestKey = window.localStorage.getItem(getLatestLabelKey(type));
    const value = (latestKey ? window.localStorage.getItem(latestKey) : null) || window.localStorage.getItem(getLabelKey(type));
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function loadSavedLabelByKey(key) {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function saveLabel(type, label) {
  const key = getLabelKey(type, getDisplayTitleValue(label));
  window.localStorage.setItem(key, JSON.stringify(label));
  window.localStorage.setItem(getLatestLabelKey(type), key);
}

export function listSavedLabels(type) {
  if (typeof window === "undefined") return [];
  const keys = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key && isSavedLabelKey(type, key)) keys.push(key);
  }

  return keys.sort((left, right) => left.localeCompare(right, "zh-CN")).map((key) => ({
    key,
    title: key.slice(`${prefix}${type}:`.length),
  }));
}

export function deleteSavedLabel(type, key) {
  if (typeof window === "undefined" || !isSavedLabelKey(type, key)) return;
  window.localStorage.removeItem(key);
  if (window.localStorage.getItem(getLatestLabelKey(type)) === key) {
    window.localStorage.removeItem(getLatestLabelKey(type));
  }
}

export function downloadLabel(label) {
  const blob = new Blob([JSON.stringify(label, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${getDisplayTitleValue(label, label.name || "label")}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
