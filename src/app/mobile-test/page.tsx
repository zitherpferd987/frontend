'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveTestingGrid } from '@/components/common/ResponsiveTestingGrid';
import { MobileOptimizedComponent, MobileCard, MobileButton, MobileContainer } from '@/components/common/MobileOptimizedComponent';
import { TouchFriendlyInteraction, TouchButton, TouchCard } from '@/components/common/TouchFriendlyInteraction';
import { MobileOptimizedAnimation, MobileStaggerContainer, MobileScrollReveal, MobileLoadingAnimation } from '@/components/animations/MobileOptimizedAnimations';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useViewport } from '@/hooks/use-viewport';
import { useMobileOptimization } from '@/hooks/use-mobile-optimization';
import { useTouchInteraction } from '@/components/common/TouchFriendlyInteraction';
import { cn } from '@/lib/utils';

export default function MobileTestPage() {
  const [activeTest, setActiveTest] = useState<string>('overview');
  const [touchCount, setTouchCount] = useState(0);
  const [gestureLog, setGestureLog] = useState<string[]>([]);
  
  const { isMobile, isTablet, isDesktop, deviceType, orientation, screenSize } = useMobileDetection();
  const { width, height, isLandscape, isPortrait, safeAreaInsets } = useViewport();
  const mobileOptimization = useMobileOptimization();
  const touchInteraction = useTouchInteraction();

  const addGestureLog = (gesture: string) => {
    setGestureLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${gesture}`]);
  };

  const testSections = [
    { id: 'overview', label: 'Overview', icon: '📱' },
    { id: 'touch', label: 'Touch Tests', icon: '👆' },
    { id: 'gestures', label: 'Gestures', icon: '✋' },
    { id: 'animations', label: 'Animations', icon: '🎬' },
    { id: 'responsive', label: 'Responsive', icon: '📐' },
    { id: 'performance', label: 'Performance', icon: '⚡' },
  ];

  const renderOverview = () => (
    <MobileContainer className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Mobile Optimization Test</h1>
        <p className="text-foreground/70">Testing mobile-specific features and optimizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MobileCard className="space-y-3">
          <h3 className="font-semibold text-primary">Device Info</h3>
          <div className="space-y-1 text-sm">
            <p>Type: <span className="font-mono">{deviceType}</span></p>
            <p>Screen: <span className="font-mono">{width}×{height}</span></p>
            <p>Orientation: <span className="font-mono">{orientation}</span></p>
            <p>Size Class: <span className="font-mono">{screenSize}</span></p>
          </div>
        </MobileCard>

        <MobileCard className="space-y-3">
          <h3 className="font-semibold text-primary">Touch Support</h3>
          <div className="space-y-1 text-sm">
            <p>Touch Device: <span className="font-mono">{touchInteraction.isTouchDevice ? 'Yes' : 'No'}</span></p>
            <p>iOS: <span className="font-mono">{touchInteraction.isIOS ? 'Yes' : 'No'}</span></p>
            <p>Android: <span className="font-mono">{touchInteraction.isAndroid ? 'Yes' : 'No'}</span></p>
            <p>Haptic Support: <span className="font-mono">{touchInteraction.supportsHapticFeedback() ? 'Yes' : 'No'}</span></p>
          </div>
        </MobileCard>

        <MobileCard className="space-y-3">
          <h3 className="font-semibold text-primary">Performance</h3>
          <div className="space-y-1 text-sm">
            <p>Mode: <span className="font-mono">{mobileOptimization.performanceMode}</span></p>
            <p>Connection: <span className="font-mono">{mobileOptimization.connectionType}</span></p>
            <p>Animation Duration: <span className="font-mono">{mobileOptimization.animationDuration}ms</span></p>
            <p>Parallax: <span className="font-mono">{mobileOptimization.enableParallax ? 'On' : 'Off'}</span></p>
          </div>
        </MobileCard>
      </div>

      <div className="bg-foreground/5 rounded-lg p-4">
        <h3 className="font-semibold mb-3">Safe Area Insets</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>Top: <span className="font-mono">{safeAreaInsets.top}px</span></div>
          <div>Bottom: <span className="font-mono">{safeAreaInsets.bottom}px</span></div>
          <div>Left: <span className="font-mono">{safeAreaInsets.left}px</span></div>
          <div>Right: <span className="font-mono">{safeAreaInsets.right}px</span></div>
        </div>
      </div>
    </MobileContainer>
  );

  const renderTouchTests = () => (
    <MobileContainer className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Touch Interaction Tests</h2>
        <p className="text-foreground/70">Test various touch interactions and feedback</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-3">Touch Buttons</h3>
          <div className="flex flex-wrap gap-3">
            <TouchButton
              variant="primary"
              size="sm"
              onTap={() => {
                setTouchCount(prev => prev + 1);
                addGestureLog('Primary button tapped');
              }}
            >
              Primary Small
            </TouchButton>
            <TouchButton
              variant="secondary"
              size="md"
              onTap={() => {
                setTouchCount(prev => prev + 1);
                addGestureLog('Secondary button tapped');
              }}
            >
              Secondary Medium
            </TouchButton>
            <TouchButton
              variant="ghost"
              size="lg"
              onTap={() => {
                setTouchCount(prev => prev + 1);
                addGestureLog('Ghost button tapped');
              }}
            >
              Ghost Large
            </TouchButton>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Touch Cards</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TouchCard
              onTap={() => addGestureLog('Card 1 tapped')}
              onLongPress={() => addGestureLog('Card 1 long pressed')}
            >
              <h4 className="font-semibold">Interactive Card 1</h4>
              <p className="text-sm text-foreground/70">Tap or long press to test</p>
            </TouchCard>
            <TouchCard
              onTap={() => addGestureLog('Card 2 tapped')}
              onDoubleTap={() => addGestureLog('Card 2 double tapped')}
            >
              <h4 className="font-semibold">Interactive Card 2</h4>
              <p className="text-sm text-foreground/70">Tap or double tap to test</p>
            </TouchCard>
          </div>
        </div>

        <div className="bg-foreground/5 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Touch Counter</h3>
          <p className="text-2xl font-bold text-primary">{touchCount}</p>
          <p className="text-sm text-foreground/70">Total touch interactions</p>
        </div>
      </div>
    </MobileContainer>
  );

  const renderGestureTests = () => (
    <MobileContainer className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Gesture Tests</h2>
        <p className="text-foreground/70">Test swipe, pinch, and other gestures</p>
      </div>

      <div className="space-y-4">
        <TouchFriendlyInteraction
          className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 text-center border-2 border-dashed border-foreground/20"
          onSwipeLeft={() => addGestureLog('Swiped left')}
          onSwipeRight={() => addGestureLog('Swiped right')}
          onSwipeUp={() => addGestureLog('Swiped up')}
          onSwipeDown={() => addGestureLog('Swiped down')}
          onPinch={(scale) => addGestureLog(`Pinched: ${scale.toFixed(2)}x`)}
          touchFeedbackType="ripple"
        >
          <div className="space-y-2">
            <h3 className="font-semibold">Gesture Area</h3>
            <p className="text-sm text-foreground/70">
              Try swiping in any direction or pinching (on touch devices)
            </p>
            <div className="flex justify-center space-x-4 text-xs text-foreground/50">
              <span>← → ↑ ↓</span>
              <span>🤏 Pinch</span>
            </div>
          </div>
        </TouchFriendlyInteraction>

        <div className="bg-foreground/5 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Gesture Log</h3>
          <div className="space-y-1 text-sm font-mono">
            {gestureLog.length === 0 ? (
              <p className="text-foreground/50">No gestures detected yet</p>
            ) : (
              gestureLog.map((log, index) => (
                <div key={index} className="text-foreground/70">{log}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </MobileContainer>
  );

  const renderAnimationTests = () => (
    <MobileContainer className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Animation Tests</h2>
        <p className="text-foreground/70">Test mobile-optimized animations</p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold mb-3">Basic Animations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MobileOptimizedAnimation type="fadeIn">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-sm">Fade In</p>
              </div>
            </MobileOptimizedAnimation>
            <MobileOptimizedAnimation type="slideUp" delay={0.1}>
              <div className="bg-secondary/10 p-4 rounded-lg text-center">
                <p className="text-sm">Slide Up</p>
              </div>
            </MobileOptimizedAnimation>
            <MobileOptimizedAnimation type="scale" delay={0.2}>
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <p className="text-sm">Scale</p>
              </div>
            </MobileOptimizedAnimation>
            <MobileOptimizedAnimation type="bounce" delay={0.3}>
              <div className="bg-secondary/10 p-4 rounded-lg text-center">
                <p className="text-sm">Bounce</p>
              </div>
            </MobileOptimizedAnimation>
          </div>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Staggered Animation</h3>
          <MobileStaggerContainer staggerDelay={0.1}>
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-foreground/5 p-3 rounded-lg mb-2">
                <p className="text-sm">Staggered Item {item}</p>
              </div>
            ))}
          </MobileStaggerContainer>
        </div>

        <div>
          <h3 className="font-semibold mb-3">Loading Animations</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center space-y-2">
              <MobileLoadingAnimation type="spinner" size="md" />
              <p className="text-xs">Spinner</p>
            </div>
            <div className="text-center space-y-2">
              <MobileLoadingAnimation type="dots" size="md" />
              <p className="text-xs">Dots</p>
            </div>
            <div className="text-center space-y-2">
              <MobileLoadingAnimation type="pulse" size="md" />
              <p className="text-xs">Pulse</p>
            </div>
            <div className="text-center space-y-2">
              <MobileLoadingAnimation type="skeleton" className="h-12 w-full" />
              <p className="text-xs">Skeleton</p>
            </div>
          </div>
        </div>

        <MobileScrollReveal>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg text-center">
            <h4 className="font-semibold">Scroll Reveal</h4>
            <p className="text-sm text-foreground/70">This animates when scrolled into view</p>
          </div>
        </MobileScrollReveal>
      </div>
    </MobileContainer>
  );

  const renderResponsiveTests = () => (
    <ResponsiveTestingGrid showDebugInfo={false} enableBreakpointIndicator={true}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Responsive Design Tests</h2>
          <p className="text-foreground/70">Test responsive layouts and breakpoints</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <MobileCard key={item} className="space-y-2">
              <h4 className="font-semibold">Responsive Card {item}</h4>
              <p className="text-sm text-foreground/70">
                This card adapts to different screen sizes and orientations.
              </p>
              <div className="text-xs text-foreground/50">
                Current: {screenSize} ({width}×{height})
              </div>
            </MobileCard>
          ))}
        </div>

        <div className="bg-foreground/5 rounded-lg p-4">
          <h3 className="font-semibold mb-3">Responsive Typography</h3>
          <div className="space-y-2">
            <h1 className="mobile-heading-scale">Responsive Heading 1</h1>
            <h2 className="text-2xl md:text-3xl lg:text-4xl">Responsive Heading 2</h2>
            <p className="mobile-text-scale">Responsive body text that scales with screen size.</p>
          </div>
        </div>
      </div>
    </ResponsiveTestingGrid>
  );

  const renderPerformanceTests = () => (
    <MobileContainer className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Performance Tests</h2>
        <p className="text-foreground/70">Test performance optimizations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="font-semibold">Performance Mode</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
              <span>Current Mode</span>
              <span className="font-mono text-primary">{mobileOptimization.performanceMode}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
              <span>Connection</span>
              <span className="font-mono text-primary">{mobileOptimization.connectionType}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
              <span>Animation Duration</span>
              <span className="font-mono text-primary">{mobileOptimization.animationDuration}ms</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Optimizations</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
              <span>Parallax</span>
              <span className={cn("font-mono", mobileOptimization.enableParallax ? "text-green-600" : "text-red-600")}>
                {mobileOptimization.enableParallax ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
              <span>Lazy Loading</span>
              <span className={cn("font-mono", mobileOptimization.enableLazyLoading ? "text-green-600" : "text-red-600")}>
                {mobileOptimization.enableLazyLoading ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-foreground/5 rounded-lg">
              <span>Touch Feedback</span>
              <span className={cn("font-mono", mobileOptimization.touchFeedback ? "text-green-600" : "text-red-600")}>
                {mobileOptimization.touchFeedback ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Performance Tips</h3>
        <ul className="space-y-2 text-sm text-foreground/70">
          <li>• Animations are automatically optimized based on device performance</li>
          <li>• Touch targets are minimum 44px for better accessibility</li>
          <li>• Parallax effects are disabled on mobile for better performance</li>
          <li>• Images are lazy-loaded and optimized for mobile connections</li>
          <li>• Battery saver mode reduces animation complexity</li>
        </ul>
      </div>
    </MobileContainer>
  );

  const renderContent = () => {
    switch (activeTest) {
      case 'overview': return renderOverview();
      case 'touch': return renderTouchTests();
      case 'gestures': return renderGestureTests();
      case 'animations': return renderAnimationTests();
      case 'responsive': return renderResponsiveTests();
      case 'performance': return renderPerformanceTests();
      default: return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-optimized navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto">
            {testSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveTest(section.id)}
                className={cn(
                  'flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 min-h-touch',
                  activeTest === section.id
                    ? 'bg-primary text-white'
                    : 'bg-foreground/5 text-foreground/70 hover:bg-foreground/10'
                )}
              >
                <span>{section.icon}</span>
                <span className="text-sm font-medium">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto py-6">
        <motion.div
          key={activeTest}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
}