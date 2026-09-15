import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from "./tokenStorage.js";

const configuredBaseURL = import.meta.env.VITE_API_BASE_URL;
const baseURL = (() => {
  if (!import.meta.env.DEV || !configuredBaseURL) return configuredBaseURL;
  try {
    return new URL(configuredBaseURL).pathname.replace(/\/$/, "");
  } catch {
    return configuredBaseURL;
  }
})();
let refreshPromise = null;

export const apiClient = axios.create({
  baseURL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: 15000,
});

function configurationError() {
  const error = new Error("VITE_API_BASE_URL belum dikonfigurasi.");
  error.status = 0;
  error.errors = null;
  return error;
}

export function normalizeApiError(error) {
  if (error?.status !== undefined && !error?.isAxiosError) {
    return error;
  }
  const normalized = new Error(
    error.response?.data?.message ||
      (error.code === "ECONNABORTED"
        ? "Permintaan terlalu lama. Coba lagi."
        : "Tidak dapat terhubung ke server."),
  );
  normalized.status = error.response?.status || 0;
  normalized.errors = error.response?.data?.errors || null;
  return normalized;
}

function notifySessionExpired() {
  window.dispatchEvent(new CustomEvent("cashmate:session-expired"));
}

apiClient.interceptors.request.use((config) => {
  if (!configuredBaseURL) {
    return Promise.reject(configurationError());
  }
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isUnauthorized = error.response?.status === 401;
    const refreshToken = getRefreshToken();

    if (
      isUnauthorized &&
      refreshToken &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        refreshPromise = axios
          .post(
            `${baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" }, timeout: 15000 },
          )
          .then(({ data }) => {
            updateAccessToken(data.data.access_token);
            return data.data.access_token;
          })
          .catch((refreshError) => {
            clearTokens();
            notifySessionExpired();
            throw normalizeApiError(refreshError);
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      try {
        const accessToken = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function unwrap(response) {
  return response.data.data;
}
