import { useState } from 'react';

const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info', duration = 5000) => {
    setToast({ message, type });
    
    const timer = setTimeout(() => {
      setToast(null);
      clearTimeout(timer);
    }, duration);
  };

  const ToastComponent = () => {
    if (!toast) return null;

    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    }[toast.type] || 'bg-blue-500';

    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg`}>
          {toast.message}
        </div>
      </div>
    );
  };

  return { showToast, ToastComponent };
};

export default useToast;