import { useNotifications } from "@/app/providers/notification-provider";

export const ToastViewport = () => {
  const { dismiss, toasts } = useNotifications();

  return (
    <aside aria-label="Notifications" className="toast-viewport">
      {toasts.map((toast) => (
        <article
          aria-live={toast.severity === "error" ? "assertive" : "polite"}
          className={`toast toast--${toast.severity}`}
          key={toast.id}
          role={toast.severity === "error" ? "alert" : "status"}
        >
          <div>
            <h3 className="toast__title">{toast.title}</h3>
            <p className="toast__message">{toast.message}</p>
          </div>
          <button
            aria-label={`Dismiss ${toast.title} notification`}
            className="toast__dismiss"
            onClick={() => dismiss(toast.id)}
            type="button"
          >
            Dismiss
          </button>
        </article>
      ))}
    </aside>
  );
};
