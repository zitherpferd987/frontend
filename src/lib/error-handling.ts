import { APIError } from '@/types';

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition?: (error: APIError) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
  retryCondition: (error: APIError) => {
    // Retry on network errors, server errors, and timeout
    return error.status >= 500 || error.status === 0 || error.name === 'NetworkError';
  },
};

export class RetryableError extends Error {
  constructor(
    public originalError: APIError,
    public attempt: number,
    public maxRetries: number
  ) {
    super(`Retry attempt ${attempt}/${maxRetries}: ${originalError.message}`);
    this.name = 'RetryableError';
  }
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: APIError;
  
  for (let attempt = 1; attempt <= finalConfig.maxRetries + 1; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as APIError;
      
      // Don't retry if this is the last attempt
      if (attempt > finalConfig.maxRetries) {
        break;
      }
      
      // Don't retry if the error doesn't meet retry conditions
      if (!finalConfig.retryCondition!(lastError)) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, attempt - 1),
        finalConfig.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000;
      
      console.warn(`API call failed (attempt ${attempt}/${finalConfig.maxRetries + 1}), retrying in ${Math.round(jitteredDelay)}ms:`, lastError);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw new RetryableError(lastError!, finalConfig.maxRetries + 1, finalConfig.maxRetries);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof RetryableError) {
    return `Failed after ${error.maxRetries} retries: ${error.originalError.message}`;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as Error).message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
}

export function getErrorType(error: unknown): 'network' | 'server' | 'client' | 'unknown' {
  if (error instanceof RetryableError) {
    error = error.originalError;
  }
  
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as APIError).status;
    if (status === 0 || status === undefined) return 'network';
    if (status >= 500) return 'server';
    if (status >= 400) return 'client';
  }
  
  return 'unknown';
}

export function shouldShowRetryButton(error: unknown): boolean {
  const errorType = getErrorType(error);
  return errorType === 'network' || errorType === 'server';
}

// Error reporting utilities
export interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  errorType: string;
  context?: Record<string, any>;
}

export function createErrorReport(error: Error, context?: Record<string, any>): ErrorReport {
  return {
    message: error.message,
    stack: error.stack,
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
    timestamp: new Date().toISOString(),
    errorType: error.constructor.name,
    context,
  };
}

export async function reportError(error: Error, context?: Record<string, any>): Promise<void> {
  try {
    const report = createErrorReport(error, context);
    
    // In development, just log to console
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Report');
      console.error('Error:', error);
      console.error('Context:', context);
      console.error('Report:', report);
      console.groupEnd();
      return;
    }
    
    // In production, you would send to your error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(report),
    // });
    
  } catch (reportingError) {
    console.error('Failed to report error:', reportingError);
  }
}