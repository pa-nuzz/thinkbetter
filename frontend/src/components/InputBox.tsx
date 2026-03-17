'use client';

import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/lib/store';
import type { InputBoxProps } from '@/types';

export function InputBox({
  placeholder = 'Enter your text...',
  maxLength = 1000,
  rows = 4,
  showCharacterCount = true,
  submitButtonText = 'Generate',
  onSubmit,
  className
}: InputBoxProps) {
  const { input, setInput, isGenerating, setGenerating } = useApp();
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(async () => {
    if (!isGenerating && input.trim() && onSubmit) {
      setGenerating(true);
      try {
        await onSubmit(input.trim());
      } catch (error) {
        console.error('Generation error:', error);
      } finally {
        setGenerating(false);
      }
    }
  }, [input, isGenerating, setGenerating, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, maxLength);
    setInput(newValue);
  }, [setInput, maxLength]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = document.querySelector('textarea[data-auto-resize]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
    }
  }, [input]);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className={cn('space-y-4', className)}>
      <div className="relative">
        <textarea
          data-auto-resize
          value={input}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={isGenerating}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full resize-none rounded-xl border px-6 py-4",
            "text-base leading-relaxed text-zinc-900 placeholder:text-zinc-400",
            "dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isFocused
              ? "border-zinc-900 dark:border-zinc-100"
              : "border-zinc-200 dark:border-zinc-700",
            isGenerating && "cursor-wait"
          )}
          rows={rows}
          style={{ minHeight: '120px' }}
        />
        
        {/* Character count */}
        {showCharacterCount && (
          <div className="absolute bottom-3 right-3 text-xs text-zinc-400 dark:text-zinc-500">
            {input.length}/{maxLength}
          </div>
        )}
      </div>

      {/* Submit button */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-zinc-400 dark:text-zinc-500">
          Press ⌘+Enter to submit
        </div>
        
        <button
          type="submit"
          disabled={isGenerating || !input.trim()}
          className={cn(
            "rounded-lg px-6 py-2.5 text-sm font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2",
            isGenerating || !input.trim()
              ? "cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
            "focus:ring-zinc-400"
          )}
        >
          {isGenerating ? 'Processing...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}
