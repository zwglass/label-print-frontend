import { appConfig } from "./config";

function buildUrl(path) {
  if (/^https?:\/\//.test(path)) return path;
  const baseUrl = appConfig.apiBaseUrl.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

function normalizeMessage(message) {
  if (!message) return "";
  const text = String(message).trim();
  return /^Error\.{0,3}$/i.test(text) ? "" : text;
}

function getErrorMessage(data, fallback) {
  if (!data) return fallback;
  if (typeof data === "string") return normalizeMessage(data) || fallback;
  const directMessage = normalizeMessage(data.msg) || normalizeMessage(data.detail) || normalizeMessage(data.error);
  if (directMessage) return directMessage;
  const firstKey = Object.keys(data).find((key) => key !== "code" && key !== "msg" && key !== "detail" && key !== "error");
  const firstValue = firstKey ? data[firstKey] : null;
  if (Array.isArray(firstValue)) return firstValue.join("，");
  const firstMessage = normalizeMessage(firstValue);
  if (firstMessage) return firstMessage;
  return fallback;
}

export async function apiRequest(path, options = {}) {
  const { token, headers: customHeaders, businessErrorMessage, ...fetchOptions } = options;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: token } : {}),
    ...(customHeaders || {}),
  };

  const response = await fetch(buildUrl(path), {
    ...fetchOptions,
    headers,
    body: options.body && typeof options.body !== "string" ? JSON.stringify(options.body) : options.body,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(getErrorMessage(data, `请求失败(${response.status})`));
  }

  if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "code") && Number(data.code) !== 1000) {
    throw new Error(getErrorMessage(data, businessErrorMessage || "接口返回错误"));
  }

  return data;
}
