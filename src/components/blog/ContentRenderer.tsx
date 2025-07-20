'use client';

import { useEffect, useRef } from 'react';
import { CodeBlock } from './CodeBlock';

interface ContentRendererProps {
  content: string;
}

export function ContentRenderer({ content }: ContentRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!contentRef.current) return;

    // Find all code blocks and replace them with our custom CodeBlock component
    const codeBlocks = contentRef.current.querySelectorAll('pre code');
    
    codeBlocks.forEach((codeElement) => {
      const preElement = codeElement.parentElement;
      if (!preElement) return;

      // Extract language from class name (e.g., "language-javascript")
      const className = codeElement.className;
      const languageMatch = className.match(/language-(\w+)/);
      const language = languageMatch ? languageMatch[1] : 'text';
      
      // Get the code content
      const codeContent = codeElement.textContent || '';
      
      // Create a container for our React component
      const container = document.createElement('div');
      preElement.parentNode?.replaceChild(container, preElement);
      
      // We'll handle this with a different approach since we can't easily render React components here
      // Instead, let's enhance the existing code blocks with better styling
      const enhancedPre = document.createElement('div');
      enhancedPre.className = 'code-block-container relative group my-6';
      
      // Create header if language is detected
      if (language !== 'text') {
        const header = document.createElement('div');
        header.className = 'flex items-center justify-between px-4 py-2 bg-gray-800 dark:bg-gray-900 text-gray-300 text-sm rounded-t-lg border-b border-gray-700';
        header.innerHTML = `
          <span class="text-gray-400 uppercase text-xs font-semibold">${language}</span>
          <button class="copy-btn flex items-center gap-1 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
            Copy
          </button>
        `;
        enhancedPre.appendChild(header);
        
        // Add copy functionality
        const copyBtn = header.querySelector('.copy-btn') as HTMLButtonElement;
        copyBtn?.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(codeContent);
            copyBtn.innerHTML = `
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              Copied!
            `;
            setTimeout(() => {
              copyBtn.innerHTML = `
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                Copy
              `;
            }, 2000);
          } catch (err) {
            console.error('Failed to copy code:', err);
          }
        });
      }
      
      // Create the code element with enhanced styling
      const newPre = document.createElement('pre');
      newPre.className = `bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed ${
        language !== 'text' ? 'rounded-b-lg' : 'rounded-lg'
      }`;
      
      const newCode = document.createElement('code');
      newCode.className = `language-${language}`;
      newCode.textContent = codeContent;
      
      newPre.appendChild(newCode);
      enhancedPre.appendChild(newPre);
      
      container.parentNode?.replaceChild(enhancedPre, container);
    });

    // Enhance other elements
    const headings = contentRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach((heading) => {
      heading.classList.add('scroll-mt-20', 'font-bold', 'text-gray-900', 'dark:text-white');
      
      // Add anchor links to headings
      const id = heading.textContent?.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') || '';
      heading.id = id;
      
      // Add hover link
      const link = document.createElement('a');
      link.href = `#${id}`;
      link.className = 'anchor-link opacity-0 hover:opacity-100 transition-opacity ml-2 text-blue-500 hover:text-blue-600';
      link.innerHTML = '#';
      link.setAttribute('aria-label', 'Link to this section');
      heading.appendChild(link);
    });

    // Style other elements
    const paragraphs = contentRef.current.querySelectorAll('p');
    paragraphs.forEach((p) => {
      p.classList.add('mb-4', 'text-gray-700', 'dark:text-gray-300', 'leading-relaxed');
    });

    const lists = contentRef.current.querySelectorAll('ul, ol');
    lists.forEach((list) => {
      list.classList.add('mb-4', 'text-gray-700', 'dark:text-gray-300');
      if (list.tagName === 'UL') {
        list.classList.add('list-disc', 'list-inside', 'space-y-1');
      } else {
        list.classList.add('list-decimal', 'list-inside', 'space-y-1');
      }
    });

    const blockquotes = contentRef.current.querySelectorAll('blockquote');
    blockquotes.forEach((blockquote) => {
      blockquote.classList.add(
        'border-l-4', 'border-blue-500', 'pl-4', 'py-2', 'my-4',
        'bg-blue-50', 'dark:bg-blue-900/20', 'text-gray-700', 'dark:text-gray-300',
        'italic', 'rounded-r'
      );
    });

    const links = contentRef.current.querySelectorAll('a');
    links.forEach((link) => {
      link.classList.add(
        'text-blue-600', 'dark:text-blue-400', 'hover:text-blue-700',
        'dark:hover:text-blue-300', 'underline', 'transition-colors'
      );
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    });

    const images = contentRef.current.querySelectorAll('img');
    images.forEach((img) => {
      img.classList.add('rounded-lg', 'shadow-lg', 'my-6', 'max-w-full', 'h-auto');
      
      // Wrap images in a figure if they have alt text
      if (img.alt) {
        const figure = document.createElement('figure');
        figure.className = 'my-6';
        
        const figcaption = document.createElement('figcaption');
        figcaption.className = 'text-sm text-gray-600 dark:text-gray-400 text-center mt-2 italic';
        figcaption.textContent = img.alt;
        
        img.parentNode?.insertBefore(figure, img);
        figure.appendChild(img);
        figure.appendChild(figcaption);
      }
    });

    const tables = contentRef.current.querySelectorAll('table');
    tables.forEach((table) => {
      table.classList.add(
        'min-w-full', 'divide-y', 'divide-gray-200', 'dark:divide-gray-700',
        'my-6', 'rounded-lg', 'overflow-hidden', 'shadow'
      );
      
      const thead = table.querySelector('thead');
      if (thead) {
        thead.classList.add('bg-gray-50', 'dark:bg-gray-800');
        const ths = thead.querySelectorAll('th');
        ths.forEach((th) => {
          th.classList.add(
            'px-6', 'py-3', 'text-left', 'text-xs', 'font-medium',
            'text-gray-500', 'dark:text-gray-400', 'uppercase', 'tracking-wider'
          );
        });
      }
      
      const tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.classList.add('bg-white', 'dark:bg-gray-900', 'divide-y', 'divide-gray-200', 'dark:divide-gray-700');
        const tds = tbody.querySelectorAll('td');
        tds.forEach((td) => {
          td.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-sm', 'text-gray-900', 'dark:text-gray-100');
        });
      }
    });

  }, [content]);

  return (
    <div 
      ref={contentRef}
      className="prose prose-lg max-w-none dark:prose-invert"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}