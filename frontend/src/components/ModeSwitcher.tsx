'use client';

import { cn } from '@/lib/utils';
import type { ModeSwitcherProps, ModeOption } from '@/types';

const defaultModes: ModeOption[] = [
  { id: 'idea', label: 'Idea', description: 'Generate and refine ideas' },
  { id: 'script', label: 'Script', description: 'Create structured scripts' },
  { id: 'brainstorm', label: 'Brainstorm', description: 'Explore possibilities' },
  { id: 'prompt', label: 'Prompt', description: 'Enhance your prompts' },
];

export function ModeSwitcher({
  currentMode,
  onModeChange,
  modes = defaultModes,
  title = 'ThinkBetter',
  layout = 'grid',
  className
}: ModeSwitcherProps) {
  const handleModeChange = (mode: ModeOption) => {
    if (onModeChange) {
      onModeChange(mode.id);
    }
  };

  if (layout === 'tabs') {
    return (
      <div className={cn('space-y-4', className)}>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        
        <div className="flex space-x-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900">
          {modes.map((mode: ModeOption) => (
            <button
              key={mode.id}
              onClick={() => handleModeChange(mode)}
              className={cn(
                "flex-1 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
                currentMode === mode.id
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>
      
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {modes.map((mode: ModeOption) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              "relative rounded-lg border px-4 py-3 text-left transition-all duration-200",
              "hover:bg-zinc-50 dark:hover:bg-zinc-900",
              "focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2",
              currentMode === mode.id
                ? "border-zinc-900 bg-zinc-50 dark:border-zinc-100 dark:bg-zinc-900"
                : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-950"
            )}
          >
            <div className="space-y-1">
              <div className="font-medium text-zinc-900 dark:text-zinc-50">
                {mode.label}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {mode.description}
              </div>
            </div>
            
            {currentMode === mode.id && (
              <div className="absolute inset-x-0 bottom-0 h-0.5 bg-zinc-900 dark:bg-zinc-100" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
