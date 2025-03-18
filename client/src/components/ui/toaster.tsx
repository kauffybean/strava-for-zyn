import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Toast } from './toast';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className="fixed top-0 right-0 p-4 z-50 w-full md:max-w-[420px] flex flex-col gap-2 items-end">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          title={toast.title}
          description={toast.description}
          variant={toast.variant}
          onClose={() => dismiss(toast.id || '')}
        />
      ))}
    </div>
  );
}
