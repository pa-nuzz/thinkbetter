'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { OutputCardProps } from '@/types';

export function OutputCard({
  title,
  content,
  mode,
  isLoading = false,
  showProgress = false,
  progress = 0,
  actions = [],
  timestamp,
  className
}: OutputCardProps) {
  const [isRevealing, setIsRevealing] = useState(false);
  const [displayedContent, setDisplayedContent] = useState('');

  // Progressive reveal effect
  useState(() => {
    if (content && !isLoading) {
      setIsRevealing(true);
      setDisplayedContent('');
      
      let index = 0;
      const interval = setInterval(() => {
        if (index < content.length) {
          setDisplayedContent(content.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsRevealing(false);
        }
      }, 20);

      return () => clearInterval(interval);
    }
  });

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn(
            "h-2 w-2 rounded-full",
            isLoading ? "bg-yellow-500 animate-pulse" : "bg-green-500"
          )} />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {isLoading ? 'Generating...' : title || `Generated ${mode}`}
          </span>
        </div>
        
        {timestamp && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {formatTimestamp(timestamp)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="w-full bg-zinc-200 rounded-full h-1 dark:bg-zinc-700">
          <div
            className="bg-zinc-900 h-1 rounded-full transition-all duration-300 dark:bg-zinc-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Content */}
      <div
        className={cn(
          "rounded-xl border p-6",
          "bg-zinc-50 dark:bg-zinc-900",
          "border-zinc-200 dark:border-zinc-700",
          "transition-all duration-300",
          isRevealing && "animate-in fade-in slide-in-from-bottom-2"
        )}
      >
        <div className="prose prose-zinc dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-zinc-900 dark:text-zinc-50 leading-relaxed">
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="h-2 w-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-zinc-400 dark:text-zinc-500">Thinking...</span>
              </div>
            ) : (
              <div>
                {displayedContent}
                {isRevealing && (
                  <span className="inline-block w-2 h-4 bg-zinc-900 dark:bg-zinc-100 ml-1 animate-pulse" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      {actions.length > 0 && !isLoading && (
        <div className="flex gap-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
                action.variant === 'primary'
                  ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  : action.variant === 'ghost'
                  ? "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-900",
                action.disabled && "cursor-not-allowed opacity-50"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
