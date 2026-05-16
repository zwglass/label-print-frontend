import { apiRequest } from "./api";

export function getGuestbookMessages({ page = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  return apiRequest(`/guestbook/v1/messages?${params.toString()}`);
}

export function createGuestbookMessage({ name, email, website, message }) {
  return apiRequest("/guestbook/v1/messages", {
    method: "POST",
    body: {
      name,
      email: email || undefined,
      website: website || undefined,
      message,
    },
    businessErrorMessage: "留言提交失败。",
  });
}
