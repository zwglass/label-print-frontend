import { apiRequest } from "./api";

export function normalizeEmail(value) {
  let email = String(value || "").trim();

  for (let index = 0; index < 3; index += 1) {
    const first = email[0];
    const last = email[email.length - 1];
    const hasDoubleQuotes = first === '"' && last === '"';
    const hasSingleQuotes = first === "'" && last === "'";
    const hasCnDoubleQuotes = first === "“" && last === "”";
    const hasCnSingleQuotes = first === "‘" && last === "’";

    if (!email || (!hasDoubleQuotes && !hasSingleQuotes && !hasCnDoubleQuotes && !hasCnSingleQuotes)) break;
    email = email.slice(1, -1).trim();
  }

  return email.toLowerCase();
}

export function sendEmailCode(email) {
  return apiRequest("/message/v1/sendemailcode", {
    method: "POST",
    body: { email: normalizeEmail(email) },
  });
}

export function verifyEmailCode(email, verificationCode) {
  return apiRequest("/message/v1/verifycodevalid", {
    method: "POST",
    body: {
      email: normalizeEmail(email),
      verification_code: verificationCode,
    },
  });
}

export function registerCompany(values) {
  return apiRequest("/registlogin/v1/companyregist", {
    method: "POST",
    body: {
      name: values.name,
      email: normalizeEmail(values.email),
      password: values.password,
      company_category: values.companyCategory || 1,
      verification_code: values.verificationCode,
    },
  });
}

export function loginCompany(values) {
  return apiRequest("/registlogin/v1/companytoken", {
    method: "POST",
    businessErrorMessage: "登录失败，请检查账号和密码。",
    body: {
      email: normalizeEmail(values.email),
      password: values.password,
    },
  });
}

export function getCompanyInfo(companyId, token) {
  return apiRequest(`/registlogin/v1/company/${companyId || 0}`, {
    method: "GET",
    token,
  });
}

export function updateCompanyInfo(companyId, token, values) {
  return apiRequest(`/registlogin/v1/company/${companyId || 0}`, {
    method: "PUT",
    token,
    body: values,
  });
}

export function createCompanyImageUpload(token, file) {
  return apiRequest("/imageshandle/v1/images", {
    method: "POST",
    token,
    body: {
      image_name: file.name || "avatar.png",
      file_size: file.size,
      content_type: file.type,
      explains: "avatar",
    },
  });
}

export function resetCompanyPassword(values) {
  return apiRequest("/registlogin/v1/companyfindpassword/0", {
    method: "PUT",
    body: {
      email: normalizeEmail(values.email),
      password: values.password,
      verification_code: values.verificationCode,
    },
  });
}
