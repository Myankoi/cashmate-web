import { useCallback, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { ToastContext } from "./toastContext.js";

const styles = {
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    border: "border-emerald-100",
  },
  error: {
    icon: AlertCircle,
    color: "text-rose-600",
    border: "border-rose-100",
  },
  info: { icon: Info, color: "text-brand-600", border: "border-brand-100" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = "success") => {
      const id = ++nextId.current;
      setToasts((items) => [...items, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 4200);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 left-4 z-[100] flex max-w-sm flex-col gap-2 sm:left-auto sm:w-full"
        aria-live="polite"
      >
        {toasts.map((toast) => {
          const config = styles[toast.type] || styles.info;
          const Icon = config.icon;
          return (
            <div
              key={toast.id}
              className={`toast-enter pointer-events-auto flex items-start gap-3 rounded-2xl border ${config.border} bg-white p-4 shadow-xl shadow-slate-900/10`}
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
              <p className="flex-1 text-sm font-semibold text-slate-700">
                {toast.message}
              </p>
              <button
                type="button"
                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => dismiss(toast.id)}
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
