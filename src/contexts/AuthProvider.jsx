import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  loginOwner,
  logoutCurrentUser,
  registerOwner,
} from "../api/auth.js";
import {
  clearTokens,
  hasStoredSession,
  storeTokens,
} from "../api/tokenStorage.js";
import { AuthContext } from "./authContext.js";

const OWNER_ROLE = "OWNER";
const authDebugEnabled =
  import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === "true";

function authDebug(event, details = {}) {
  if (!authDebugEnabled) return;
  console.info(`[DEBUG-cashmate-auth] ${event}`, details);
}

export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [bootstrapError, setBootstrapError] = useState("");
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  const setGuest = useCallback(() => {
    clearTokens();
    setBootstrapError("");
    setUser(null);
    setBusiness(null);
    setStatus("guest");
  }, []);

  const setForbidden = useCallback(() => {
    clearTokens();
    setBootstrapError("");
    setUser(null);
    setBusiness(null);
    setStatus("forbidden");
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrap() {
      if (!hasStoredSession()) {
        if (active) {
          setBootstrapError("");
          setStatus("guest");
        }
        return;
      }
      try {
        const session = await getCurrentUser();
        if (!active) return;
        if (session.user?.role !== OWNER_ROLE) {
          setForbidden();
          return;
        }
        setBootstrapError("");
        setUser(session.user);
        setBusiness(session.business);
        setStatus("authenticated");
      } catch (requestError) {
        if (!active) return;
        if (requestError.status === 401) {
          setGuest();
          return;
        }
        setBootstrapError(requestError.message || "Sesi belum dapat diperiksa.");
        setStatus("error");
      }
    }

    bootstrap();
    return () => {
      active = false;
    };
  }, [bootstrapAttempt, setForbidden, setGuest]);

  useEffect(() => {
    function handleSessionExpired() {
      setGuest();
    }
    window.addEventListener("cashmate:session-expired", handleSessionExpired);
    return () =>
      window.removeEventListener(
        "cashmate:session-expired",
        handleSessionExpired,
      );
  }, [setGuest]);

  const login = useCallback(
    async (credentials, remember) => {
      const session = await loginOwner(credentials);
      authDebug("session", {
        hasAccessToken: Boolean(session?.access_token),
        hasRefreshToken: Boolean(session?.refresh_token),
        role: session?.user?.role || null,
        hasUser: Boolean(session?.user),
        hasBusiness: Boolean(session?.business),
      });
      if (session.user?.role !== OWNER_ROLE) {
        authDebug("forbidden", { role: session?.user?.role || null });
        setForbidden();
        return { forbidden: true };
      }
      storeTokens(session, remember);
      authDebug("stored", {
        remember,
        hasAccessToken: Boolean(session?.access_token),
        hasRefreshToken: Boolean(session?.refresh_token),
      });
      setUser(session.user);
      setBusiness(session.business);
      setStatus("authenticated");
      return { forbidden: false };
    },
    [setForbidden],
  );

  const register = useCallback((payload) => registerOwner(payload), []);

  const logout = useCallback(async () => {
    try {
      if (hasStoredSession()) {
        await logoutCurrentUser();
      }
    } finally {
      setGuest();
    }
  }, [setGuest]);

  const resetForbidden = useCallback(() => setGuest(), [setGuest]);

  const retryBootstrap = useCallback(() => {
    setBootstrapError("");
    setStatus("loading");
    setBootstrapAttempt((attempt) => attempt + 1);
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      business,
      login,
      register,
      logout,
      resetForbidden,
      authError: bootstrapError,
      retryBootstrap,
    }),
    [
      status,
      user,
      business,
      login,
      register,
      logout,
      resetForbidden,
      bootstrapError,
      retryBootstrap,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
