"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createGuestbookMessage, getGuestbookMessages } from "@/lib/guestbookApi";
import { useI18n } from "@/lib/i18n";
import { Icon } from "./icons";

const pageSize = 10;
const userStorageKey = "zwglass-label:user";
const initialForm = {
  name: "",
  email: "",
  website: "",
  message: "",
};

function formatMessageTime(value, language) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function normalizeWebsite(value) {
  const text = value.trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function getStoredUserEmail() {
  if (typeof window === "undefined") return "";
  try {
    const value = window.localStorage.getItem(userStorageKey) || window.sessionStorage.getItem(userStorageKey);
    if (!value) return "";
    const user = JSON.parse(value);
    return String(user?.email || "").trim();
  } catch {
    return "";
  }
}

export default function GuestbookContent() {
  const { language, t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState("info");
  const [formNotice, setFormNotice] = useState("");
  const [formNoticeType, setFormNoticeType] = useState("info");
  const [form, setForm] = useState(initialForm);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  const loadMessages = useCallback(async (nextPage = page) => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await getGuestbookMessages({ page: nextPage, pageSize });
      setMessages(Array.isArray(data.results) ? data.results : []);
      setTotal(Number(data.count) || 0);
    } catch (error) {
      setLoadError(error.message || t("guestbookLoadFail"));
    } finally {
      setLoading(false);
    }
  }, [page, t]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadMessages(page);
  }, [loadMessages, mounted, page]);

  useEffect(() => {
    if (!isFormOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape" && !submitting) setIsFormOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isFormOpen, submitting]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submitMessage = async (event) => {
    event.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      website: normalizeWebsite(form.website),
      message: form.message.trim(),
    };

    if (!payload.name || !payload.message) {
      setFormNoticeType("warning");
      setFormNotice(t("guestbookRequired"));
      return;
    }

    setSubmitting(true);
    setNotice("");
    setFormNotice("");
    try {
      await createGuestbookMessage(payload);
      setForm(initialForm);
      setNoticeType("success");
      setNotice(t("guestbookSubmitted"));
      setIsFormOpen(false);
    } catch (error) {
      setNoticeType("error");
      setNotice(error.message || t("guestbookSubmitFail"));
      setIsFormOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const goToPage = (nextPage) => {
    const normalizedPage = Math.min(Math.max(1, nextPage), pageCount);
    if (normalizedPage !== page) setPage(normalizedPage);
  };

  const openForm = () => {
    setFormNotice("");
    const userEmail = getStoredUserEmail();
    if (userEmail) {
      setForm((current) => ({
        ...current,
        email: current.email.trim() ? current.email : userEmail,
      }));
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setIsFormOpen(false);
  };

  if (!mounted) {
    return (
      <main className="guestbook-page flex-1">
        <section className="guestbook-hero">
          <div className="guestbook-shell">
            <div className="guestbook-kicker">
              <span>{t("guestbookKicker")}</span>
            </div>
            <div className="guestbook-intro">
              <h1>{t("guestbookTitle")}</h1>
              <p>{t("guestbookIntro")}</p>
            </div>
          </div>
        </section>
        <section className="guestbook-shell guestbook-layout" aria-label={t("guestbookTitle")}>
          <div className="guestbook-messages guestbook-empty">{t("guestbookLoading")}</div>
        </section>
      </main>
    );
  }

  return (
    <main className="guestbook-page flex-1">
      <section className="guestbook-hero">
        <div className="guestbook-shell">
          <div className="guestbook-kicker">
            <span>{t("guestbookKicker")}</span>
          </div>
          <div className="guestbook-intro">
            <h1>{t("guestbookTitle")}</h1>
            <p>{t("guestbookIntro")}</p>
          </div>
        </div>
      </section>

      <section className="guestbook-shell guestbook-layout" aria-label={t("guestbookTitle")}>
        <div className="guestbook-messages">
          <div className="guestbook-section-title">
            <Icon name="book" />
            <h2>{t("guestbookMessages")}</h2>
            <span className="badge badge-soft badge-primary">{t("guestbookCount", total)}</span>
          </div>

          {notice ? <div className={`alert alert-soft alert-${noticeType} py-2 text-sm`}>{notice}</div> : null}

          {loadError ? (
            <div className="alert alert-soft alert-error">
              <span>{loadError}</span>
              <button className="btn btn-sm" type="button" onClick={() => loadMessages(page)}>{t("guestbookRetry")}</button>
            </div>
          ) : null}

          {loading ? (
            <div className="guestbook-empty">
              <span className="loading loading-spinner loading-md" />
              <span>{t("guestbookLoading")}</span>
            </div>
          ) : null}

          {!loading && !loadError && messages.length === 0 ? (
            <div className="guestbook-empty">{t("guestbookEmpty")}</div>
          ) : null}

          {!loading && !loadError ? (
            <ol className="guestbook-list">
              {messages.map((item) => (
                <li className="guestbook-entry" key={item.id}>
                  <div className="guestbook-entry-mark">#{item.id}</div>
                  <article>
                    <header>
                      <h3>
                        {item.website ? (
                          <a href={item.website} target="_blank" rel="noreferrer">{item.name}</a>
                        ) : (
                          item.name
                        )}
                      </h3>
                      <time dateTime={item.add_time}>{formatMessageTime(item.add_time, language)}</time>
                    </header>
                    <p>{item.message}</p>
                  </article>
                </li>
              ))}
            </ol>
          ) : null}

          <div className="join guestbook-pagination">
            <button className="btn join-item" type="button" disabled={page <= 1 || loading} onClick={() => goToPage(page - 1)}>
              {t("guestbookPrev")}
            </button>
            <span className="btn join-item btn-ghost no-animation">{t("guestbookPage", page, pageCount)}</span>
            <button className="btn join-item" type="button" disabled={page >= pageCount || loading} onClick={() => goToPage(page + 1)}>
              {t("guestbookNext")}
            </button>
          </div>
        </div>
      </section>

      <button className="btn btn-primary btn-circle guestbook-fab" type="button" aria-label={t("guestbookSignTitle")} onClick={openForm}>
        <Icon name="message" />
      </button>

      {isFormOpen ? (
        <div className="modal modal-open" role="dialog" aria-modal="true" aria-labelledby="guestbook-form-title">
          <form className="modal-box guestbook-form guestbook-modal" onSubmit={submitMessage}>
            <div className="guestbook-section-title">
              <Icon name="message" />
              <h2 id="guestbook-form-title">{t("guestbookSignTitle")}</h2>
              <button className="btn btn-sm btn-circle btn-ghost guestbook-modal-close" type="button" aria-label={t("close")} onClick={closeForm}>
                x
              </button>
            </div>

            {formNotice ? <div className={`alert alert-soft alert-${formNoticeType} py-2 text-sm`}>{formNotice}</div> : null}

            <label className="form-control">
              <span className="label-text font-bold">{t("guestbookName")} *</span>
              <input
                className="input input-bordered"
                maxLength={32}
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
              />
            </label>

            <label className="form-control">
              <span className="label-text font-bold">{t("guestbookEmail")}</span>
              <input
                className="input input-bordered"
                maxLength={128}
                type="email"
                value={form.email}
                onChange={(event) => updateForm("email", event.target.value)}
              />
              <span className="label-text-alt text-base-content/60">{t("guestbookEmailHint")}</span>
            </label>

            {/* <label className="form-control">
              <span className="label-text font-bold">{t("guestbookWebsite")}</span>
              <input
                className="input input-bordered"
                maxLength={255}
                placeholder="https://example.com"
                value={form.website}
                onChange={(event) => updateForm("website", event.target.value)}
              />
            </label> */}

            <label className="form-control">
              <span className="label-text font-bold">{t("guestbookMessage")} *</span>
              <textarea
                className="textarea textarea-bordered min-h-36"
                maxLength={200}
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
              />
              <span className="label-text-alt text-base-content/60">{t("guestbookCharCount", form.message.length)}</span>
            </label>

            <button className="btn btn-primary guestbook-submit" type="submit" disabled={submitting}>
              <Icon name="send" />
              {submitting ? t("guestbookSubmitting") : t("guestbookSubmit")}
            </button>
          </form>
          <button className="modal-backdrop" type="button" aria-label={t("close")} onClick={closeForm} />
        </div>
      ) : null}
    </main>
  );
}
