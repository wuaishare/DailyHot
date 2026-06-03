const ADMIN_TOKEN_KEY = "dailyhot:analytics-admin-token";

const canUseStorage = () => typeof localStorage !== "undefined";

export const getAdminToken = () => {
  if (!canUseStorage()) return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
};

export const setAdminToken = (token) => {
  if (!canUseStorage()) return;
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    return;
  }
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};
