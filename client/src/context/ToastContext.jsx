// React
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { X } from 'lucide-react';

// External libraries

// Local files

const ToastContext = createContext(null);

// Shares a small status message with actions throughout the app.
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const dismissToast = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    setToast(null);
  }, []);
  const showToast = useCallback((message, options = {}) => {
    window.clearTimeout(timeoutRef.current);
    const { type = 'info', duration = 3500 } = options;
    setToast({ message, type });
    timeoutRef.current = window.setTimeout(() => setToast(null), duration);
  }, []);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div
          className={`toast toast--${toast.type}`}
          role={toast.type === 'error' ? 'alert' : 'status'}
          aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
          aria-atomic="true"
        >
          <span>{toast.message}</span>
          <button
            className="toast-dismiss"
            type="button"
            aria-label="Dismiss notification"
            onClick={dismissToast}
          >
            <X aria-hidden="true" size={17} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

// Reads toast actions in buttons and forms.
export function useToast() {
  return useContext(ToastContext);
}
