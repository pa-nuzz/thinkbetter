'use client';

import { cn } from '@/lib/utils';
import type { ActionButtonsProps } from '@/types';

export function ActionButtons({
  actions,
  layout = 'horizontal',
  size = 'md',
  alignment = 'left',
  className
}: ActionButtonsProps) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const layoutClasses = {
    horizontal: 'flex gap-2',
    vertical: 'flex flex-col gap-2'
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const getButtonClasses = (variant: 'primary' | 'secondary' | 'ghost' = 'secondary') => {
    const baseClasses = 'inline-flex items-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2';
    
    const variantClasses = {
      primary: 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200',
      secondary: 'border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900',
      ghost: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800'
    };

    return cn(baseClasses, variantClasses[variant]);
  };

  return (
    <div className={cn(layoutClasses[layout], alignmentClasses[alignment], className)}>
      {actions.map((action) => (
        <button
          key={action.id}
          onClick={action.onClick}
          disabled={action.disabled}
          className={cn(
            getButtonClasses(action.variant),
            sizeClasses[size],
            action.disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
}
