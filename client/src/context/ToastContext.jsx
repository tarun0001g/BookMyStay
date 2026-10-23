// React
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// External libraries

// Local files

const ToastContext = createContext(null);

// Shares a small status message with actions throughout the app.
export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const showToast = useCallback((nextMessage) => setMessage(nextMessage), []);
  const value = useMemo(() => ({ message, showToast }), [message, showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast" role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  );
}

// Reads toast actions in buttons and forms.
export function useToast() {
  return useContext(ToastContext);
}
