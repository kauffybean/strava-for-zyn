import { useState, useEffect, useCallback, createContext, useContext } from 'react';

type ToastVariant = 'default' | 'destructive';

type ToastProps = {
  id?: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

type ToastContextType = {
  toasts: ToastProps[];
  toast: (props: ToastProps) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...props, id };
    setToasts((toasts) => [...toasts, newToast]);
    
    // Auto dismiss after duration
    if (props.duration !== 0) {
      setTimeout(() => {
        dismiss(id);
      }, props.duration || 3000);
    }
    
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
}
