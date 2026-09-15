const ACCESS_TOKEN_KEY = "cashmate_access_token";
const REFRESH_TOKEN_KEY = "cashmate_refresh_token";
const STORAGE_MODE_KEY = "cashmate_storage_mode";

function availableStorage() {
  if (localStorage.getItem(STORAGE_MODE_KEY) === "local") {
    return localStorage;
  }
  if (sessionStorage.getItem(STORAGE_MODE_KEY) === "session") {
    return sessionStorage;
  }
  if (localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return localStorage;
  }
  return sessionStorage;
}

export function getAccessToken() {
  return availableStorage().getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return availableStorage().getItem(REFRESH_TOKEN_KEY);
}

export function hasStoredSession() {
  return Boolean(getAccessToken() || getRefreshToken());
}

export function storeTokens(
  { access_token: accessToken, refresh_token: refreshToken },
  remember,
) {
  clearTokens();
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(STORAGE_MODE_KEY, remember ? "local" : "session");
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
  storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function updateAccessToken(accessToken) {
  const storage = availableStorage();
  storage.setItem(ACCESS_TOKEN_KEY, accessToken);
}

export function clearTokens() {
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem(ACCESS_TOKEN_KEY);
    storage.removeItem(REFRESH_TOKEN_KEY);
    storage.removeItem(STORAGE_MODE_KEY);
  }
}
