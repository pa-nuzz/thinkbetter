'use client';

import { cn } from '@/lib/utils';
import type { LoadingSkeletonProps } from '@/types';

export function LoadingSkeleton({
  type = 'text',
  lines = 3,
  height,
  width,
  animate = true,
  className
}: LoadingSkeletonProps) {
  const baseClasses = cn(
    'rounded',
    animate && 'animate-pulse',
    'bg-zinc-200 dark:bg-zinc-700'
  );

  const renderTextSkeleton = () => (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={cn(
            baseClasses,
            i === lines - 1 ? 'w-3/4' : 'w-full'
          )}
          style={{
            height: height || '1rem',
            width: width || '100%'
          }}
        />
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(baseClasses, 'h-6 w-1/3')}
      />
      <div
        className={cn(baseClasses, 'h-32 w-full')}
      />
      <div className="flex gap-2">
        <div className={cn(baseClasses, 'h-8 w-20')} />
        <div className={cn(baseClasses, 'h-8 w-20')} />
      </div>
    </div>
  );

  const renderListSkeleton = () => (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className={cn(baseClasses, 'h-10 w-10 flex-shrink-0')} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClasses, 'h-4 w-full')} />
            <div className={cn(baseClasses, 'h-3 w-2/3')} />
          </div>
        </div>
      ))}
    </div>
  );

  const renderInputSkeleton = () => (
    <div className={cn('space-y-4', className)}>
      <div
        className={cn(baseClasses, 'h-24 w-full')}
      />
      <div className="flex justify-between items-center">
        <div className={cn(baseClasses, 'h-4 w-32')} />
        <div className={cn(baseClasses, 'h-10 w-24')} />
      </div>
    </div>
  );

  const skeletons = {
    text: renderTextSkeleton,
    card: renderCardSkeleton,
    list: renderListSkeleton,
    input: renderInputSkeleton
  };

  return skeletons[type]();
}
