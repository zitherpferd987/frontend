import { render, screen, waitFor } from '@testing-library/react';
import { LazyImage } from '../LazyImage';

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    },
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
    __esModule: true,
    default: ({ src, alt, onLoad, onError, ...props }: any) => {
        return (
            <img
                src={src}
                alt={alt}
                onLoad={() => onLoad?.()}
                onError={() => onError?.()}
                {...props}
            />
        );
    },
}));

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
});
window.IntersectionObserver = mockIntersectionObserver;

describe('LazyImage', () => {
    beforeEach(() => {
        mockIntersectionObserver.mockClear();
    });

    it('renders skeleton while loading', () => {
        render(
            <LazyImage
                src="/test-image.jpg"
                alt="Test image"
                fill
                showSkeleton={true}
            />
        );

        // Should show skeleton with shimmer animation
        const skeleton = document.querySelector('.animate-pulse');
        expect(skeleton).toBeInTheDocument();
    });

    it('renders image when loaded', async () => {
        render(
            <LazyImage
                src="/test-image.jpg"
                alt="Test image"
                fill
            />
        );

        const image = screen.getByAltText('Test image');
        expect(image).toBeInTheDocument();
    });

    it('shows error state when image fails to load', async () => {
        render(
            <LazyImage
                src="/invalid-image.jpg"
                alt="Test image"
                fill
            />
        );

        const image = screen.getByAltText('Test image');

        // Simulate error
        image.dispatchEvent(new Event('error'));

        await waitFor(() => {
            expect(screen.getByText('Failed to load')).toBeInTheDocument();
        });
    });

    it('calls onLoad callback when image loads', () => {
        const mockOnLoad = jest.fn();

        render(
            <LazyImage
                src="/test-image.jpg"
                alt="Test image"
                fill
                onLoad={mockOnLoad}
            />
        );

        const image = screen.getByAltText('Test image');

        // Simulate load
        image.dispatchEvent(new Event('load'));

        expect(mockOnLoad).toHaveBeenCalledTimes(1);
    });

    it('does not show skeleton when showSkeleton is false', () => {
        render(
            <LazyImage
                src="/test-image.jpg"
                alt="Test image"
                fill
                showSkeleton={false}
            />
        );

        const skeleton = document.querySelector('.animate-pulse');
        expect(skeleton).not.toBeInTheDocument();
    });
});