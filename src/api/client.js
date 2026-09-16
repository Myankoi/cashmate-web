import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  updateAccessToken,
} from "./tokenStorage.js";

const debugEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === "true";
const debugPrefix = "[DEBUG-cashmate-api]";
let debugRequestId = 0;

function debugLog(event, details = {}) {
  if (!debugEnabled) return;
  console.info(`${debugPrefix} ${event}`, details);
}

function responseSummary(data) {
  if (!data || typeof data !== "object") {
    return { dataType: typeof data };
  }

  return {
    message: data.message,
    dataKeys:
      data.data && typeof data.data === "object"
        ? Object.keys(data.data)
        : [],
    metaKeys:
      data.meta && typeof data.meta === "object" ? Object.keys(data.meta) : [],
    errorKeys:
      data.errors && typeof data.errors === "object"
        ? Object.keys(data.errors)
        : [],
  };
}

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

debugLog("config", {
  mode: import.meta.env.MODE,
  pageOrigin: window.location.origin,
  configuredBaseURL: configuredBaseURL || null,
  resolvedBaseURL: baseURL || null,
});

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

function expireSession() {
  clearTokens();
  notifySessionExpired();
}

apiClient.interceptors.request.use((config) => {
  if (!configuredBaseURL) {
    return Promise.reject(configurationError());
  }

  const requestId = ++debugRequestId;
  config._cashmateDebug = {
    requestId,
    startedAt: performance.now(),
  };

  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  // Saat body berupa FormData (upload file), serahkan penentuan
  // Content-Type beserta boundary-nya ke browser/axios sehingga header
  // default "application/json" tidak merusak payload multipart.
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  debugLog("request", {
    requestId,
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    hasAccessToken: Boolean(accessToken),
    skipAuthRefresh: Boolean(config.skipAuthRefresh),
  });

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const debug = response.config?._cashmateDebug;
    debugLog("response", {
      requestId: debug?.requestId,
      method: response.config?.method?.toUpperCase(),
      url: response.config?.url,
      status: response.status,
      durationMs: debug
        ? Math.round(performance.now() - debug.startedAt)
        : undefined,
      response: responseSummary(response.data),
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config || {};
    const isUnauthorized = error.response?.status === 401;
    const refreshToken = getRefreshToken();

    const debug = originalRequest._cashmateDebug;
    debugLog("error", {
      requestId: debug?.requestId,
      method: originalRequest.method?.toUpperCase(),
      url: originalRequest.url,
      status: error.response?.status || null,
      code: error.code || null,
      message: error.message,
      hasResponse: Boolean(error.response),
      response: responseSummary(error.response?.data),
      allowOrigin: error.response?.headers?.["access-control-allow-origin"] || null,
    });

    if (
      isUnauthorized &&
      refreshToken &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retry = true;
      if (!refreshPromise) {
        debugLog("refresh:start", {
          url: `${baseURL}/auth/refresh`,
        });
        refreshPromise = axios
          .post(
            `${baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
            { headers: { "Content-Type": "application/json" }, timeout: 15000 },
          )
          .then(({ data }) => {
            debugLog("refresh:success", {
              response: responseSummary(data),
            });
            updateAccessToken(data.data.access_token);
            return data.data.access_token;
          })
          .catch((refreshError) => {
            debugLog("refresh:error", {
              status: refreshError.response?.status || null,
              code: refreshError.code || null,
              message: refreshError.message,
              hasResponse: Boolean(refreshError.response),
              response: responseSummary(refreshError.response?.data),
            });
            expireSession();
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

    if (
      isUnauthorized &&
      !originalRequest.skipAuthRefresh &&
      (originalRequest._retry || getAccessToken())
    ) {
      debugLog("session:expired", {
        requestId: debug?.requestId,
        retried: Boolean(originalRequest._retry),
      });
      expireSession();
    }

    return Promise.reject(normalizeApiError(error));
  },
);

export function unwrap(response) {
  return response.data.data;
}
