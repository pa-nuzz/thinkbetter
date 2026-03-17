'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

type Mode = 'idea' | 'script' | 'brainstorm' | 'prompt';

interface OutputAreaProps {
  content: string;
  isGenerating: boolean;
  mode: Mode;
}

export function OutputArea({ content, isGenerating, mode }: OutputAreaProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isRevealing, setIsRevealing] = useState(false);

  // Progressive reveal effect
  useEffect(() => {
    if (content && !isGenerating) {
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
      }, 20); // Adjust speed as needed

      return () => clearInterval(interval);
    }
  }, [content, isGenerating]);

  if (!content && !isGenerating) {
    return (
      <div className="text-center py-12">
        <div className="text-zinc-400 dark:text-zinc-500">
          Your generated content will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Output header */}
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {isGenerating ? 'Generating...' : `Generated ${mode}`}
        </span>
      </div>

      {/* Output content */}
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
            {isGenerating ? (
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

        {/* Action buttons */}
        {!isGenerating && content && (
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => navigator.clipboard.writeText(content)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Copy
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
