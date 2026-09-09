import { useCallback, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { ToastContext, type ToastAction } from './toastContextInstance';
import styles from './Toast.module.css';

interface ToastEntry {
  id: number;
  message: string;
  action?: ToastAction;
}

const TOAST_DURATION_MS = 5000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, action?: ToastAction) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, message, action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className={styles.host}>
          {toasts.map((toast) => (
            <div key={toast.id} className={styles.toast} role="status">
              <span className={styles.message}>{toast.message}</span>
              {toast.action && (
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => {
                    toast.action?.onAction();
                    dismiss(toast.id);
                  }}
                >
                  {toast.action.label}
                </button>
              )}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
