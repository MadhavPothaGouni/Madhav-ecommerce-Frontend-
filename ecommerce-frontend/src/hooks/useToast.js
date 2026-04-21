import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = useCallback((message, type = 'default') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastComponent = toast ? (
    <div className={`toast ${toast.type}`}>{toast.message}</div>
  ) : null;

  return { show, ToastComponent };
}
 