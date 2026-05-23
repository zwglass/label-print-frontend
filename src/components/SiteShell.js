"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  createCompanyImageUpload,
  getCompanyInfo,
  loginCompany,
  normalizeEmail,
  registerCompany,
  resetCompanyPassword,
  sendEmailCode,
  updateCompanyInfo,
  verifyEmailCode,
} from "@/lib/authApi";
import { useI18n } from "@/lib/i18n";
import { localePath, stripLocaleFromPath } from "@/lib/locales";

const userStorageKey = "zwglass-label:user";
const tokenStorageKey = "zwglass-label:companyToken";
const navItems = [
  { path: "/", labelKey: "navCommon" },
  { path: "/lens/", labelKey: "navLens" },
  { path: "/guestbook/", labelKey: "navGuestbook" },
  { path: "/contact/", labelKey: "navHelp" },
];

function getInitials(name) {
  const value = name || "ZW";
  return value.slice(0, 2).toUpperCase();
}

function getNoticeClass(type) {
  if (type === "success") return "alert-success";
  if (type === "error") return "alert-error";
  if (type === "warning") return "alert-warning";
  return "alert-info";
}

function UserAvatar({ user, size = "w-10", textSize = "text-sm", tone = "header", avatarAlt = "User avatar" }) {
  if (user?.avatarUrl) {
    return (
      <div className="avatar">
        <div className={`${size} rounded-full bg-base-200`}>
          <img src={user.avatarUrl} alt={user.name || avatarAlt} />
        </div>
      </div>
    );
  }

  const toneClass = tone === "profile" ? "bg-primary text-primary-content" : "bg-primary-content text-primary";
  return (
    <div className="avatar avatar-placeholder">
      <div className={`${size} rounded-full ${toneClass}`}>
        <span className={`${textSize} font-bold`}>{user ? getInitials(user.name) : "?"}</span>
      </div>
    </div>
  );
}

function SiteShellContent({ children }) {
  const { language, setLanguage, t } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const [authNotice, setAuthNotice] = useState("");
  const [authNoticeType, setAuthNoticeType] = useState("info");
  const [authBusy, setAuthBusy] = useState(false);
  const closeTimerRef = useRef(null);
  const profileFileInputRef = useRef(null);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", remember: true, showPassword: false });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", code: "", password: "", showPassword: false, countdown: 0 });
  const [forgotForm, setForgotForm] = useState({ email: "", code: "", password: "", showPassword: false, countdown: 0, verified: false });
  const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "", showPassword: false, avatarFile: null, avatarPreview: "" });

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem(userStorageKey) || window.sessionStorage.getItem(userStorageKey);
      if (savedUser) setUser(JSON.parse(savedUser));
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (registerForm.countdown < 1) return undefined;
    const timer = window.setTimeout(() => {
      setRegisterForm((current) => ({ ...current, countdown: current.countdown - 1 }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [registerForm.countdown]);

  useEffect(() => {
    if (forgotForm.countdown < 1) return undefined;
    const timer = window.setTimeout(() => {
      setForgotForm((current) => ({ ...current, countdown: current.countdown - 1 }));
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [forgotForm.countdown]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (authView !== "profile" || !user) return undefined;
    setProfileForm((current) => ({
      ...current,
      name: user.name || "",
      email: user.email || "",
      password: "",
      avatarFile: null,
      avatarPreview: "",
    }));
    return undefined;
  }, [authView, user]);

  useEffect(() => {
    return () => {
      if (profileForm.avatarPreview) URL.revokeObjectURL(profileForm.avatarPreview);
    };
  }, [profileForm.avatarPreview]);

  const showAuthNotice = (message, type = "info") => {
    setAuthNotice(message);
    setAuthNoticeType(type);
  };

  const saveUser = (nextUser, remember = true) => {
    window.localStorage.removeItem(userStorageKey);
    window.localStorage.removeItem(tokenStorageKey);
    window.sessionStorage.removeItem(userStorageKey);
    window.sessionStorage.removeItem(tokenStorageKey);
    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(userStorageKey, JSON.stringify(nextUser));
    storage.setItem(tokenStorageKey, nextUser.token);
    setUser(nextUser);
  };

  const updateStoredUser = (nextUser) => {
    const useLocalStorage = Boolean(window.localStorage.getItem(userStorageKey) || window.localStorage.getItem(tokenStorageKey));
    const storage = useLocalStorage ? window.localStorage : window.sessionStorage;
    storage.setItem(userStorageKey, JSON.stringify(nextUser));
    if (nextUser.token) storage.setItem(tokenStorageKey, nextUser.token);
    setUser(nextUser);
  };

  const buildUser = async (loginData, email) => {
    const token = loginData.token;
    if (!token) {
      throw new Error(t("tokenMissing"));
    }
    let company = null;

    try {
      company = await getCompanyInfo(loginData.company_id, token);
    } catch {
      company = null;
    }

    return {
      id: company?.id || loginData.company_id,
      name: company?.name || email.split("@")[0] || "ZWGlass",
      email: company?.email || email,
      mobile: company?.mobile || "",
      avatar: company?.avatar || "",
      avatarUrl: company?.avatar_url || "",
      role: t("user"),
      token,
    };
  };

  const loginAndSave = async (email, password, remember = true) => {
    const cleanEmail = normalizeEmail(email);
    const loginData = await loginCompany({ email: cleanEmail, password });
    const nextUser = await buildUser(loginData, cleanEmail);
    saveUser(nextUser, remember);
    return nextUser;
  };

  const openAuth = (view) => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setAuthView(view);
    setAuthNotice("");
    setAuthNoticeType("info");
    setAuthOpen(true);
  };

  const closeAuth = () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
    setAuthOpen(false);
    setAuthNotice("");
    setAuthNoticeType("info");
  };

  const logout = () => {
    window.localStorage.removeItem(userStorageKey);
    window.localStorage.removeItem(tokenStorageKey);
    window.sessionStorage.removeItem(userStorageKey);
    window.sessionStorage.removeItem(tokenStorageKey);
    setUser(null);
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    const email = normalizeEmail(loginForm.email);
    setLoginForm((current) => ({ ...current, email }));
    if (!email || !loginForm.password) {
      showAuthNotice(t("requiredLogin"), "warning");
      return;
    }
    setAuthBusy(true);
    setAuthNotice("");
    try {
      await loginAndSave(email, loginForm.password, loginForm.remember);
      showAuthNotice(t("loginSuccess"), "success");
      closeTimerRef.current = window.setTimeout(closeAuth, 700);
    } catch (error) {
      showAuthNotice(error.message || t("loginFail"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const sendRegisterCode = async () => {
    const email = normalizeEmail(registerForm.email);
    setRegisterForm((current) => ({ ...current, email }));
    if (!email) {
      showAuthNotice(t("emailRequired"), "warning");
      return;
    }
    setAuthBusy(true);
    setAuthNotice("");
    try {
      await sendEmailCode(email);
      setRegisterForm((current) => ({ ...current, countdown: 120 }));
      showAuthNotice(t("codeSent"), "success");
    } catch (error) {
      showAuthNotice(error.message || t("codeSendFail"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    const email = normalizeEmail(registerForm.email);
    setRegisterForm((current) => ({ ...current, email }));
    if (!registerForm.name || !email || !registerForm.code || !registerForm.password) {
      showAuthNotice(t("registerRequired"), "warning");
      return;
    }
    setAuthBusy(true);
    setAuthNotice("");
    try {
      await registerCompany({
        name: registerForm.name,
        email,
        password: registerForm.password,
        verificationCode: registerForm.code,
        companyCategory: 1,
      });
      await loginAndSave(email, registerForm.password, true);
      showAuthNotice(t("registerSuccess"), "success");
      closeTimerRef.current = window.setTimeout(closeAuth, 700);
    } catch (error) {
      showAuthNotice(error.message || t("registerFail"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const sendForgotCode = async () => {
    const email = normalizeEmail(forgotForm.email);
    setForgotForm((current) => ({ ...current, email }));
    if (!email) {
      showAuthNotice(t("emailRequired"), "warning");
      return;
    }
    setAuthBusy(true);
    setAuthNotice("");
    try {
      await sendEmailCode(email);
      setForgotForm((current) => ({ ...current, countdown: 120 }));
      showAuthNotice(t("codeSent"), "success");
    } catch (error) {
      showAuthNotice(error.message || t("codeSendFail"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const verifyForgotCode = async (event) => {
    event.preventDefault();
    const email = normalizeEmail(forgotForm.email);
    setForgotForm((current) => ({ ...current, email }));
    if (!email || !forgotForm.code) {
      showAuthNotice(t("emailCodeRequired"), "warning");
      return;
    }
    setAuthBusy(true);
    setAuthNotice("");
    try {
      await verifyEmailCode(email, forgotForm.code);
      setForgotForm((current) => ({ ...current, verified: true }));
      showAuthNotice(t("codeVerified"), "success");
    } catch (error) {
      showAuthNotice(error.message || t("codeInvalid"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const submitNewPassword = async (event) => {
    event.preventDefault();
    const email = normalizeEmail(forgotForm.email);
    setForgotForm((current) => ({ ...current, email }));
    if (!forgotForm.password) {
      showAuthNotice(t("newPasswordRequired"), "warning");
      return;
    }
    setAuthBusy(true);
    setAuthNotice("");
    try {
      await resetCompanyPassword({
        email,
        password: forgotForm.password,
        verificationCode: forgotForm.code,
      });
      await loginAndSave(email, forgotForm.password, true);
      showAuthNotice(t("passwordUpdated"), "success");
      closeTimerRef.current = window.setTimeout(closeAuth, 700);
    } catch (error) {
      showAuthNotice(error.message || t("passwordUpdateFail"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const selectProfileAvatar = (event) => {
    const file = event.target.files?.[0] || null;
    setProfileForm((current) => {
      if (current.avatarPreview) URL.revokeObjectURL(current.avatarPreview);
      return {
        ...current,
        avatarFile: file,
        avatarPreview: file ? URL.createObjectURL(file) : "",
      };
    });
  };

  const submitProfile = async (event) => {
    event.preventDefault();
    if (!user?.token) {
      showAuthNotice(t("loginBeforeProfile"), "warning");
      return;
    }

    const name = profileForm.name.trim();
    const password = profileForm.password;
    if (!name) {
      showAuthNotice(t("usernameRequired"), "warning");
      return;
    }
    if (password && password.length < 6) {
      showAuthNotice(t("newPasswordMin"), "warning");
      return;
    }
    if (profileForm.avatarFile && !["image/jpeg", "image/png", "image/webp"].includes(profileForm.avatarFile.type)) {
      showAuthNotice(t("avatarTypeOnly"), "warning");
      return;
    }

    setAuthBusy(true);
    setAuthNotice("");
    try {
      const payload = { name };
      let uploadedAvatarUrl = "";

      if (password) payload.password = password;

      if (profileForm.avatarFile) {
        const uploadInfo = await createCompanyImageUpload(user.token, profileForm.avatarFile);
        const signObj = uploadInfo.r2_sign_obj;
        if (!signObj?.url || !signObj?.content_type || !uploadInfo.image_cos_name) {
          throw new Error(t("avatarInvalidSign"));
        }

        let uploadResponse = null;
        try {
          uploadResponse = await fetch(signObj.url, {
            method: "PUT",
            mode: "cors",
            headers: {
              "Content-Type": signObj.content_type,
            },
            body: profileForm.avatarFile,
          });
        } catch {
          throw new Error(t("avatarCors"));
        }

        if (!uploadResponse.ok) {
          throw new Error(t("avatarUploadFail", uploadResponse.status));
        }

        payload.avatar = uploadInfo.image_cos_name;
        uploadedAvatarUrl = uploadInfo.image_cos_name_url || "";
      }

      const updated = await updateCompanyInfo(user.id, user.token, payload);
      const nextUser = {
        ...user,
        name: updated.name || name,
        email: user.email,
        avatar: updated.avatar || payload.avatar || user.avatar || "",
        avatarUrl: updated.avatar_url || uploadedAvatarUrl || user.avatarUrl || "",
      };
      updateStoredUser(nextUser);
      setProfileForm((current) => ({ ...current, password: "", avatarFile: null, avatarPreview: "" }));
      if (profileFileInputRef.current) profileFileInputRef.current.value = "";
      showAuthNotice(t("profileUpdated"), "success");
    } catch (error) {
      showAuthNotice(error.message || t("profileUpdateFail"), "error");
    } finally {
      setAuthBusy(false);
    }
  };

  const drawerTitle = authView === "register" ? t("registerTitle") : authView === "forgot" ? t("forgotTitle") : t("loginTitle");
  const changeLanguage = (event) => {
    const nextLanguage = event.target.value;
    setLanguage(nextLanguage);
    router.push(localePath(nextLanguage, stripLocaleFromPath(pathname || "/")));
  };

  return (
    <div className="drawer">
      <input className="drawer-toggle" type="checkbox" checked={authOpen} readOnly />
      <div className="drawer-content min-h-screen flex flex-col bg-base-100 text-base-content">
      <header className="navbar min-h-20 bg-primary px-4 text-primary-content shadow-md sm:px-6">
        <div className="navbar-start">
          <div className="dropdown lg:hidden">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
            <ul tabIndex={-1} className="menu menu-sm dropdown-content z-50 mt-3 w-48 rounded-box bg-base-100 p-2 text-base-content shadow">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link href={localePath(language, item.path)}>{t(item.labelKey)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <Link href={localePath(language, "/")} className="btn btn-ghost gap-3 px-2 text-primary-content">
            <img className="size-10 rounded-full border-2 border-primary-content/70 bg-base-100" src="/favicon-32x32.png" alt="ZWGlass" />
            <span className="hidden font-mono text-xl font-bold sm:inline">ZWGlass</span>
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-1 text-lg font-bold">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link className="rounded-btn text-primary-content hover:bg-primary-content/15" href={localePath(language, item.path)}>{t(item.labelKey)}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end gap-3 pr-2 sm:pr-4">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <span className="hidden opacity-80 sm:inline">{t("language")}</span>
            <select
              className="select select-sm w-24 bg-primary-content text-primary"
              value={language}
              onChange={changeLanguage}
              aria-label={t("language")}
            >
              <option value="zh">{t("chinese")}</option>
              <option value="en">{t("english")}</option>
            </select>
          </label>
          <span className="hidden text-sm font-semibold opacity-80 md:inline">{user ? user.name : t("notLoggedIn")}</span>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost h-12 w-12 rounded-full p-1">
              <UserAvatar user={user} avatarAlt={t("userAvatar")} />
            </div>
            <ul tabIndex={-1} className="menu menu-sm dropdown-content z-50 mt-3 w-56 rounded-box bg-base-100 p-2 text-base-content shadow">
              {user ? (
                <>
                  <li className="menu-title px-3 py-2">
                    <span>{user.name}</span>
                  </li>
                  <li>
                    <button className="justify-between" type="button" onClick={() => openAuth("profile")}>
                      {t("details")}
                      <span className="badge badge-soft badge-primary">{user.role || t("user")}</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={logout}>{t("logout")}</button>
                  </li>
                </>
              ) : (
                <>
                  <li className="menu-title px-3 py-2">
                    <span>{t("notLoggedIn")}</span>
                  </li>
                  <li>
                    <button className="justify-between" type="button" onClick={() => openAuth("login")}>
                      {t("login")}
                      <span className="badge badge-soft badge-info">Account</span>
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => openAuth("register")}>{t("register")}</button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </header>
      {children}
      <footer className="footer footer-center bg-base-200 p-6 text-base-content">
        <aside>
          <p className="font-bold">ZWGlass Industries Ltd.</p>
          <p>Providing reliable tech since 2006</p>
          <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
        </aside>
      </footer>
      </div>
      <div className="drawer-side z-[100]">
        <button className="drawer-overlay" type="button" aria-label={t("closeAuthPanel")} onClick={closeAuth} />
        <aside className="auth-drawer min-h-full w-[min(100vw,420px)] bg-base-100 text-base-content">
          <div className="auth-drawer-title">
            <h2>{authView === "profile" ? t("profileTitle") : drawerTitle}</h2>
            <button className="btn btn-ghost btn-sm" type="button" onClick={closeAuth}>×</button>
          </div>
          <div className="auth-drawer-body">
            {authNotice ? <div className={`alert alert-soft ${getNoticeClass(authNoticeType)} mb-5 py-2 text-sm`}>{authNotice}</div> : null}

            {authView === "profile" && user ? (
              <form className="auth-form auth-profile-form" onSubmit={submitProfile}>
                <div className="auth-profile-avatar">
                  {profileForm.avatarPreview ? (
                    <div className="avatar">
                      <div className="w-20 rounded-full bg-base-200">
                        <img src={profileForm.avatarPreview} alt={t("newAvatarPreview")} />
                      </div>
                    </div>
                  ) : (
                    <UserAvatar user={user} size="w-20" textSize="text-xl" tone="profile" avatarAlt={t("userAvatar")} />
                  )}
                  <input ref={profileFileInputRef} className="hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={selectProfileAvatar} />
                  <button className="btn btn-outline btn-sm" type="button" disabled={authBusy} onClick={() => profileFileInputRef.current?.click()}>{t("changeAvatar")}</button>
                </div>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> {t("username")}</legend>
                  <input className="input input-bordered" value={profileForm.name} onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))} />
                </fieldset>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend">{t("email")}</legend>
                  <input className="input input-bordered" type="email" value={profileForm.email} placeholder={t("emailPlaceholder")} readOnly />
                  <p className="label">{t("emailReadonly")}</p>
                </fieldset>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend">{t("newPassword")}</legend>
                  <div className="auth-password">
                    <input className="input input-bordered" type={profileForm.showPassword ? "text" : "password"} value={profileForm.password} placeholder={t("blankPasswordHint")} onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))} />
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setProfileForm((current) => ({ ...current, showPassword: !current.showPassword }))}>{profileForm.showPassword ? t("hide") : t("show")}</button>
                  </div>
                  <p className="label">{t("minPassword")}</p>
                </fieldset>
                <div className="auth-actions">
                  <button className="btn" type="button" disabled={authBusy} onClick={closeAuth}>{t("cancel")}</button>
                  <button className="btn btn-primary" type="submit" disabled={authBusy}>{authBusy ? t("saving") : t("saveProfile")}</button>
                </div>
              </form>
            ) : null}

            {authView === "login" ? (
              <form className="auth-form" onSubmit={submitLogin}>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> E-mail</legend>
                  <input className="input input-bordered" type="email" value={loginForm.email} onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))} />
                  <p className="label">{t("emailUsage")}</p>
                </fieldset>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> Password</legend>
                  <div className="auth-password">
                    <input className="input input-bordered" type={loginForm.showPassword ? "text" : "password"} value={loginForm.password} onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))} />
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setLoginForm((current) => ({ ...current, showPassword: !current.showPassword }))}>{loginForm.showPassword ? t("hide") : t("show")}</button>
                  </div>
                </fieldset>
                <label className="auth-check">
                  <input className="checkbox checkbox-primary" type="checkbox" checked={loginForm.remember} onChange={(event) => setLoginForm((current) => ({ ...current, remember: event.target.checked }))} />
                  Remember me
                </label>
                <button className="btn btn-primary auth-submit" type="submit" disabled={authBusy}>
                  {authBusy ? t("loggingIn") : t("loginButton")}
                </button>
                <button className="link link-primary auth-link" type="button" onClick={() => openAuth("register")}>{t("noAccountRegister")}</button>
                <button className="link link-primary auth-link" type="button" onClick={() => openAuth("forgot")}>{t("forgotPassword")}</button>
              </form>
            ) : null}

            {authView === "register" ? (
              <form className="auth-form" onSubmit={submitRegister}>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> {t("companyName")}</legend>
                  <input className="input input-bordered" value={registerForm.name} onChange={(event) => setRegisterForm((current) => ({ ...current, name: event.target.value }))} />
                </fieldset>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> {t("email")}</legend>
                  <div className="join w-full">
                    <input className="input input-bordered join-item flex-1" type="email" value={registerForm.email} onChange={(event) => setRegisterForm((current) => ({ ...current, email: event.target.value }))} />
                    <button className="btn btn-primary join-item" type="button" disabled={authBusy || registerForm.countdown > 0} onClick={sendRegisterCode}>{registerForm.countdown > 0 ? t("seconds", registerForm.countdown) : t("sendCode")}</button>
                  </div>
                </fieldset>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> {t("verificationCode")}</legend>
                  <input className="input input-bordered" value={registerForm.code} onChange={(event) => setRegisterForm((current) => ({ ...current, code: event.target.value }))} />
                </fieldset>
                <fieldset className="fieldset auth-fieldset">
                  <legend className="fieldset-legend"><b>*</b> {t("password")}</legend>
                  <div className="auth-password">
                    <input className="input input-bordered" type={registerForm.showPassword ? "text" : "password"} value={registerForm.password} onChange={(event) => setRegisterForm((current) => ({ ...current, password: event.target.value }))} />
                    <button className="btn btn-ghost btn-sm" type="button" onClick={() => setRegisterForm((current) => ({ ...current, showPassword: !current.showPassword }))}>{registerForm.showPassword ? t("hide") : t("show")}</button>
                  </div>
                  <p className="label">{t("minPassword")}</p>
                </fieldset>
                <button className="btn btn-primary auth-submit" type="submit" disabled={authBusy}>
                  {authBusy ? t("registering") : t("registerButton")}
                </button>
                <button className="link link-primary auth-link" type="button" onClick={() => openAuth("login")}>{t("haveAccountLogin")}</button>
              </form>
            ) : null}

            {authView === "forgot" ? (
              forgotForm.verified ? (
                <form className="auth-form" onSubmit={submitNewPassword}>
                  <fieldset className="fieldset auth-fieldset">
                    <legend className="fieldset-legend"><b>*</b> {t("newPassword")}</legend>
                    <div className="auth-password">
                      <input className="input input-bordered" type={forgotForm.showPassword ? "text" : "password"} value={forgotForm.password} onChange={(event) => setForgotForm((current) => ({ ...current, password: event.target.value }))} />
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setForgotForm((current) => ({ ...current, showPassword: !current.showPassword }))}>{forgotForm.showPassword ? t("hide") : t("show")}</button>
                    </div>
                    <p className="label">{t("autoLoginAfterReset")}</p>
                  </fieldset>
                  <div className="auth-actions">
                    <button className="btn" type="button" disabled={authBusy} onClick={() => setForgotForm((current) => ({ ...current, verified: false }))}>{t("previousStep")}</button>
                    <button className="btn btn-primary" type="submit" disabled={authBusy}>{authBusy ? t("updating") : t("updatePassword")}</button>
                  </div>
                </form>
              ) : (
                <form className="auth-form" onSubmit={verifyForgotCode}>
                  <fieldset className="fieldset auth-fieldset">
                    <legend className="fieldset-legend"><b>*</b> {t("email")}</legend>
                    <div className="join w-full">
                      <input className="input input-bordered join-item flex-1" type="email" value={forgotForm.email} onChange={(event) => setForgotForm((current) => ({ ...current, email: event.target.value }))} />
                      <button className="btn btn-primary join-item" type="button" disabled={authBusy || forgotForm.countdown > 0} onClick={sendForgotCode}>{forgotForm.countdown > 0 ? t("seconds", forgotForm.countdown) : t("sendCode")}</button>
                    </div>
                  </fieldset>
                  <fieldset className="fieldset auth-fieldset">
                    <legend className="fieldset-legend"><b>*</b> {t("verificationCode")}</legend>
                    <input className="input input-bordered" value={forgotForm.code} onChange={(event) => setForgotForm((current) => ({ ...current, code: event.target.value }))} />
                  </fieldset>
                  <button className="btn btn-primary auth-submit" type="submit" disabled={authBusy}>{authBusy ? t("verifying") : t("nextStep")}</button>
                  <button className="link link-primary auth-link" type="button" onClick={() => openAuth("login")}>{t("goLogin")}</button>
                </form>
              )
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function SiteShell({ children }) {
  return <SiteShellContent>{children}</SiteShellContent>;
}
