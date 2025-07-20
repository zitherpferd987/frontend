import { render, screen, fireEvent } from '@testing-library/react';
import { WorkCard } from '../WorkCard';
import { GalleryWork } from '@/types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock LazyImage
jest.mock('../LazyImage', () => ({
  LazyImage: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

const mockWork: GalleryWork = {
  id: 1,
  attributes: {
    title: 'Test Animation',
    description: 'A test animation work',
    featured: true,
    dimensions: '1920x1080',
    softwareUsed: ['After Effects', 'Blender'],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    media: {
      data: [
        {
          id: 1,
          attributes: {
            name: 'test-image.jpg',
            alternativeText: 'Test image',
            caption: null,
            width: 1920,
            height: 1080,
            formats: {
              thumbnail: {
                name: 'thumbnail_test-image.jpg',
                hash: 'thumbnail_test',
                ext: '.jpg',
                mime: 'image/jpeg',
                width: 245,
                height: 138,
                size: 10.5,
                url: '/uploads/thumbnail_test_image.jpg',
              },
            },
            hash: 'test_image_hash',
            ext: '.jpg',
            mime: 'image/jpeg',
            size: 150.5,
            url: '/uploads/test_image.jpg',
            previewUrl: null,
            provider: 'local',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      ],
    },
    category: {
      data: {
        id: 1,
        attributes: {
          name: 'Animation',
          slug: 'animation',
          description: 'Animation works',
          color: '#ff6b6b',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    },
    tags: {
      data: [
        {
          id: 1,
          attributes: {
            name: 'Motion Graphics',
            slug: 'motion-graphics',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
        {
          id: 2,
          attributes: {
            name: '3D',
            slug: '3d',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        },
      ],
    },
  },
};

describe('WorkCard', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders work information correctly', () => {
    render(<WorkCard work={mockWork} onClick={mockOnClick} />);

    expect(screen.getByText('Test Animation')).toBeInTheDocument();
    expect(screen.getByText('A test animation work')).toBeInTheDocument();
    expect(screen.getByText('Motion Graphics')).toBeInTheDocument();
    expect(screen.getByText('3D')).toBeInTheDocument();
    expect(screen.getByText('After Effects')).toBeInTheDocument();
    expect(screen.getByText('Blender')).toBeInTheDocument();
  });

  it('displays media correctly', () => {
    render(<WorkCard work={mockWork} onClick={mockOnClick} />);

    const image = screen.getByAltText('Test image');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/uploads/test_image.jpg');
  });

  it('shows multiple media indicator when work has multiple media', () => {
    const workWithMultipleMedia = {
      ...mockWork,
      attributes: {
        ...mockWork.attributes,
        media: {
          data: [
            ...mockWork.attributes.media.data,
            {
              id: 2,
              attributes: {
                ...mockWork.attributes.media.data[0].attributes,
                id: 2,
                name: 'test-video.mp4',
                mime: 'video/mp4',
                url: '/uploads/test_video.mp4',
              },
            },
          ],
        },
      },
    };

    render(<WorkCard work={workWithMultipleMedia} onClick={mockOnClick} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows video indicator for video media', () => {
    const workWithVideo = {
      ...mockWork,
      attributes: {
        ...mockWork.attributes,
        media: {
          data: [
            {
              ...mockWork.attributes.media.data[0],
              attributes: {
                ...mockWork.attributes.media.data[0].attributes,
                mime: 'video/mp4',
                url: '/uploads/test_video.mp4',
              },
            },
          ],
        },
      },
    };

    render(<WorkCard work={workWithVideo} onClick={mockOnClick} />);
    expect(screen.getByText('Video')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<WorkCard work={mockWork} onClick={mockOnClick} />);

    const card = screen.getByText('Test Animation').closest('div');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('limits displayed tags and software', () => {
    const workWithManyTags = {
      ...mockWork,
      attributes: {
        ...mockWork.attributes,
        tags: {
          data: [
            ...mockWork.attributes.tags!.data,
            { id: 3, attributes: { name: 'Tag 3', slug: 'tag-3', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' } },
            { id: 4, attributes: { name: 'Tag 4', slug: 'tag-4', createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' } },
          ],
        },
        softwareUsed: ['After Effects', 'Blender', 'Cinema 4D'],
      },
    };

    render(<WorkCard work={workWithManyTags} onClick={mockOnClick} />);

    // Should show +1 for tags (showing 3 out of 4)
    expect(screen.getByText('+1')).toBeInTheDocument();
    
    // Should show +1 for software (showing 2 out of 3)
    expect(screen.getByText('+1')).toBeInTheDocument();
  });
});