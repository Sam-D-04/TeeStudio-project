import type { AuthSession, AuthUser } from "@/types/auth";

export const ACCESS_TOKEN_KEY = "access_token";
export const AUTH_USER_KEY = "auth_user";
export const AUTH_ROLE_COOKIE = "auth_role";

// Refresh token không còn lưu ở localStorage — backend đặt nó thành cookie
// HttpOnly (không đọc được từ JS) để giảm rủi ro bị đánh cắp qua XSS. Vì cookie
// không lộ thời điểm hết hạn cho JS đọc, dùng thời hạn access token cộng thêm
// một khoảng đệm để ước lượng thời hạn cookie `auth_role` (chỉ phục vụ UX
// định tuyến, không phải ranh giới bảo mật).
const AUTH_ROLE_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const isBrowser = () => typeof window !== "undefined";

const setCookie = (name: string, value: string, maxAge: number) => {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
};

const removeCookie = (name: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
};

export const saveAuthSession = (session: AuthSession) => {
  if (!isBrowser()) return;

  localStorage.setItem(ACCESS_TOKEN_KEY, session.accessToken);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(session.user));
  setCookie(AUTH_ROLE_COOKIE, session.user.role, AUTH_ROLE_COOKIE_MAX_AGE_SECONDS);
};

export const clearAuthSession = () => {
  if (!isBrowser()) return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  removeCookie(AUTH_ROLE_COOKIE);
};

export const getStoredAccessToken = () => {
  return isBrowser() ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;
};

export const getStoredUser = (): AuthUser | null => {
  if (!isBrowser()) return null;

  try {
    const value = localStorage.getItem(AUTH_USER_KEY);
    return value ? (JSON.parse(value) as AuthUser) : null;
  } catch {
    clearAuthSession();
    return null;
  }
};

export const syncStoredUser = (user: AuthUser) => {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};
