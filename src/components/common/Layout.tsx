import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { PageTransition } from '@/components/animations';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  footerClassName?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export function Layout({
  children,
  className,
  headerClassName,
  footerClassName,
  showHeader = true,
  showFooter = true,
}: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && <Header className={headerClassName} />}
      
      <PageTransition>
        <main 
          className={cn(
            'flex-1',
            showHeader && 'pt-16', // Account for fixed header
            className
          )}
        >
          {children}
        </main>
      </PageTransition>
      
      {showFooter && <Footer className={footerClassName} />}
    </div>
  );
}

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function PageLayout({ 
  children, 
  title, 
  description, 
  className 
}: PageLayoutProps) {
  return (
    <Layout>
      <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8 py-8', className)}>
        {(title || description) && (
          <div className="mb-8">
            {title && (
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg text-foreground/60 max-w-3xl">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </Layout>
  );
}

interface SectionProps {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  background?: 'default' | 'muted' | 'accent';
}

export function Section({ 
  children, 
  className, 
  containerClassName,
  background = 'default' 
}: SectionProps) {
  const backgroundClasses = {
    default: '',
    muted: 'bg-foreground/5',
    accent: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20',
  };

  return (
    <section className={cn('py-12 md:py-16', backgroundClasses[background], className)}>
      <div className={cn('container mx-auto px-4 sm:px-6 lg:px-8', containerClassName)}>
        {children}
      </div>
    </section>
  );
}