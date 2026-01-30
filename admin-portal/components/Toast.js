import { useState, useEffect } from 'react';

let toastId = 0;
const toastListeners = [];

export const toast = {
  success: (message) => addToast(message, 'success'),
  error: (message) => addToast(message, 'error'),
  info: (message) => addToast(message, 'info'),
  warning: (message) => addToast(message, 'warning')
};

function addToast(message, type) {
  const id = ++toastId;
  const newToast = { id, message, type };
  toastListeners.forEach(listener => listener(newToast));
  
  setTimeout(() => {
    toastListeners.forEach(listener => listener({ id, remove: true }));
  }, 4000);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      if (toast.remove) {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      } else {
        setToasts(prev => [...prev, toast]);
      }
    };
    
    toastListeners.push(listener);
    
    return () => {
      const index = toastListeners.indexOf(listener);
      if (index > -1) toastListeners.splice(index, 1);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const getToastStyles = (type) => {
    const styles = {
      success: 'bg-green-500 text-white',
      error: 'bg-red-500 text-white',
      warning: 'bg-yellow-500 text-white',
      info: 'bg-blue-500 text-white'
    };
    return styles[type] || styles.info;
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg flex items-center justify-between min-w-80 animate-slide-in ${getToastStyles(toast.type)}`}
        >
          <span className="text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-white hover:text-gray-200"
          >
            ×
          </button>
        </div>
      ))}
      
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(100%) translateX(-50%);
            opacity: 0;
          }
          to {
            transform: translateY(0) translateX(-50%);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}