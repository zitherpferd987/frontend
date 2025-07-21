'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ErrorToast } from './ErrorFeedback';
import { OfflineNotification } from './OfflineNotification';

interface ErrorToastData {
  id: string;
  error: unknown;
  timestamp: number;
}

interface GlobalErrorContextType {
  showError: (error: unknown) => void;
  dismissError: (id: string) => void;
  clearAllErrors: () => void;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | null>(null);

interface GlobalErrorProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function GlobalErrorProvider({ children, maxToasts = 3 }: GlobalErrorProviderProps) {
  const [errorToasts, setErrorToasts] = useState<ErrorToastData[]>([]);

  const showError = useCallback((error: unknown) => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ErrorToastData = {
      id,
      error,
      timestamp: Date.now(),
    };

    setErrorToasts(prev => {
      const updated = [newToast, ...prev];
      // Keep only the most recent toasts
      return updated.slice(0, maxToasts);
    });
  }, [maxToasts]);

  const dismissError = useCallback((id: string) => {
    setErrorToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrorToasts([]);
  }, []);

  return (
    <GlobalErrorContext.Provider value={{ showError, dismissError, clearAllErrors }}>
      {children}
      
      {/* Offline notification */}
      <OfflineNotification />
      
      {/* Error toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {errorToasts.map(toast => (
          <ErrorToast
            key={toast.id}
            error={toast.error}
            onDismiss={() => dismissError(toast.id)}
          />
        ))}
      </div>
    </GlobalErrorContext.Provider>
  );
}

export function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
}

// Hook for handling async operations with global error handling
export function useAsyncOperation() {
  const { showError } = useGlobalError();

  const execute = useCallback(async (
    operation: () => Promise<any>,
    options?: {
      onSuccess?: (result: any) => void;
      onError?: (error: unknown) => void;
      showErrorToast?: boolean;
    }
  ): Promise<any | null> => {
    try {
      const result = await operation();
      options?.onSuccess?.(result);
      return result;
    } catch (error) {
      options?.onError?.(error);
      
      if (options?.showErrorToast !== false) {
        showError(error);
      }
      
      return null;
    }
  }, [showError]);

  return { execute };
}

// Error boundary wrapper with global error context
interface GlobalErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function GlobalErrorBoundary({ children, fallback }: GlobalErrorBoundaryProps) {
  const { showError } = useGlobalError();

  return (
    <ErrorBoundary
      onError={(error) => showError(error)}
      fallback={fallback}
      level="global"
    >
      {children}
    </ErrorBoundary>
  );
}

// Import the existing ErrorBoundary
import { ErrorBoundary } from './ErrorBoundary';