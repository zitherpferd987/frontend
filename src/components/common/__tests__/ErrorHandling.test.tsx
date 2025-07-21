import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorFeedback } from '../ErrorFeedback';
import { GlobalErrorProvider, useGlobalError } from '../GlobalErrorHandler';
import { withRetry, getErrorMessage, getErrorType } from '@/lib/error-handling';

// Mock component that throws an error
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Test component for global error context
function TestErrorComponent() {
  const { showError } = useGlobalError();
  
  return (
    <button onClick={() => showError(new Error('Test global error'))}>
      Trigger Error
    </button>
  );
}

describe('Error Handling System', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    queryClient.clear();
  });

  describe('ErrorBoundary', () => {
    it('should catch and display errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should allow retry functionality', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      // Click retry button
      fireEvent.click(screen.getByText('Try Again'));
      
      // Re-render with no error
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('ErrorFeedback', () => {
    it('should display error message', () => {
      const error = new Error('Test error message');
      const onRetry = jest.fn();

      render(
        <ErrorFeedback error={error} onRetry={onRetry} />
      );

      expect(screen.getByText('发生错误')).toBeInTheDocument();
      expect(screen.getByText('发生了意外错误，请重试或联系支持')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const error = new Error('Test error');
      const onRetry = jest.fn().mockResolvedValue(undefined);

      render(
        <ErrorFeedback error={error} onRetry={onRetry} />
      );

      fireEvent.click(screen.getByText('重试'));
      
      await waitFor(() => {
        expect(onRetry).toHaveBeenCalledTimes(1);
      });
    });

    it('should display different variants correctly', () => {
      const error = new Error('Test error');

      const { rerender } = render(
        <ErrorFeedback error={error} variant="inline" />
      );

      // Should not have card styling for inline variant
      expect(screen.queryByText('发生错误')).not.toBeInTheDocument();

      rerender(
        <ErrorFeedback error={error} variant="banner" />
      );

      expect(screen.getByText('发生错误')).toBeInTheDocument();
    });
  });

  describe('GlobalErrorProvider', () => {
    it('should provide error context', () => {
      render(
        <GlobalErrorProvider>
          <TestErrorComponent />
        </GlobalErrorProvider>
      );

      expect(screen.getByText('Trigger Error')).toBeInTheDocument();
      
      // Click to trigger error - should not throw since it's handled
      fireEvent.click(screen.getByText('Trigger Error'));
    });
  });

  describe('Error handling utilities', () => {
    describe('withRetry', () => {
      it('should retry failed operations', async () => {
        let attempts = 0;
        const operation = jest.fn().mockImplementation(() => {
          attempts++;
          if (attempts < 3) {
            throw { status: 500, message: 'Server error' };
          }
          return 'success';
        });

        const result = await withRetry(operation, { maxRetries: 3, baseDelay: 10 });
        
        expect(result).toBe('success');
        expect(operation).toHaveBeenCalledTimes(3);
      });

      it('should not retry client errors', async () => {
        const operation = jest.fn().mockRejectedValue({ status: 400, message: 'Bad request' });

        await expect(withRetry(operation, { maxRetries: 3 })).rejects.toMatchObject({
          status: 400,
          message: 'Bad request'
        });
        
        expect(operation).toHaveBeenCalledTimes(1);
      });
    });

    describe('getErrorMessage', () => {
      it('should extract message from different error types', () => {
        expect(getErrorMessage(new Error('Test message'))).toBe('Test message');
        expect(getErrorMessage('String error')).toBe('String error');
        expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
        expect(getErrorMessage(null)).toBe('An unexpected error occurred');
      });
    });

    describe('getErrorType', () => {
      it('should categorize errors correctly', () => {
        expect(getErrorType({ status: 0 })).toBe('network');
        expect(getErrorType({ status: 500 })).toBe('server');
        expect(getErrorType({ status: 400 })).toBe('client');
        expect(getErrorType({})).toBe('unknown');
      });
    });
  });
});