/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ToastSeverity = "success" | "warning" | "error" | "info";

export interface ToastMessage {
  readonly id: string;
  readonly severity: ToastSeverity;
  readonly title: string;
  readonly message: string;
  readonly durationMs: number;
}

export interface ToastInput {
  readonly severity: ToastSeverity;
  readonly title: string;
  readonly message: string;
  readonly durationMs?: number;
}

interface NotificationContextValue {
  readonly toasts: readonly ToastMessage[];
  readonly notify: (input: ToastInput) => void;
  readonly dismiss: (id: string) => void;
}

const DEFAULT_DURATION_MS = 4_500;

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const createToastId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<readonly ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback(
    (input: ToastInput) => {
      const nextToast: ToastMessage = {
        id: createToastId(),
        durationMs: input.durationMs ?? DEFAULT_DURATION_MS,
        message: input.message,
        severity: input.severity,
        title: input.title
      };

      setToasts((currentToasts) => [...currentToasts, nextToast]);
      window.setTimeout(() => {
        dismiss(nextToast.id);
      }, nextToast.durationMs);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      dismiss,
      notify,
      toasts
    }),
    [dismiss, notify, toasts]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
};
