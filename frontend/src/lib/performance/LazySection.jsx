import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { useIntersectionObserver } from './useIntersectionObserver';
import SectionSkeleton from '@/components/skeletons/SectionSkeleton';

export default function LazySection({ 
  id,
  children, 
  minHeight = '100vh', 
  rootMargin = '800px 0px', // Start loading 800px before the component enters viewport
  fallback = <SectionSkeleton />
}) {
  const [ref, inView] = useIntersectionObserver({
    rootMargin, 
    triggerOnce: true
  });

  return (
    <div id={id} ref={ref} style={{ minHeight: inView ? 'auto' : minHeight }} className="relative w-full">
      <ErrorBoundary>
        {inView ? (
          <Suspense fallback={fallback}>
            {children}
          </Suspense>
        ) : (
          fallback
        )}
      </ErrorBoundary>
    </div>
  );
}
