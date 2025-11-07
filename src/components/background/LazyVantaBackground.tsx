import { lazy, Suspense } from 'react';

// Lazy load VantaBackground للتحسين
const VantaBackground = lazy(() => import('./VantaBackground'));

export const LazyVantaBackground = () => {
  return (
    <Suspense fallback={null}>
      <VantaBackground />
    </Suspense>
  );
};

export default LazyVantaBackground;
