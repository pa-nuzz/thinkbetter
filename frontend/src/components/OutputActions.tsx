'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
  RefreshCw, 
  Zap, 
  Sparkles, 
  DollarSign, 
  ChevronRight,
  Loader2
} from 'lucide-react';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  action: string;
  loading?: boolean;
  disabled?: boolean;
}

interface OutputActionsProps {
  onAction: (action: string) => Promise<void>;
  isGenerating: boolean;
  className?: string;
  currentMode?: string;
}

export function OutputActions({ 
  onAction, 
  isGenerating, 
  className,
  currentMode = 'idea'
}: OutputActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const getActionButtons = (): ActionButton[] => {
    const baseActions: ActionButton[] = [
      {
        id: 'improve',
        label: 'Improve',
        icon: <RefreshCw className="w-4 h-4" />,
        action: 'improve',
        loading: loadingAction === 'improve'
      },
      {
        id: 'simplify',
        label: 'Simplify',
        icon: <Zap className="w-4 h-4" />,
        action: 'simplify',
        loading: loadingAction === 'simplify'
      },
      {
        id: 'unique',
        label: 'Make it Unique',
        icon: <Sparkles className="w-4 h-4" />,
        action: 'unique',
        loading: loadingAction === 'unique'
      }
    ];

    // Add monetization for idea mode
    if (currentMode === 'idea') {
      baseActions.push({
        id: 'monetize',
        label: 'Add Monetization',
        icon: <DollarSign className="w-4 h-4" />,
        action: 'monetize',
        loading: loadingAction === 'monetize'
      });
    }

    return baseActions;
  };

  const handleAction = async (action: string) => {
    if (isGenerating || loadingAction) return;
    
    setLoadingAction(action);
    try {
      await onAction(action);
    } finally {
      setLoadingAction(null);
    }
  };

  const actionButtons = getActionButtons();

  return (
    <div className={cn('space-y-4', className)}>
      {/* Primary Actions */}
      <div className="flex flex-wrap gap-3">
        {actionButtons.map((button) => (
          <button
            key={button.id}
            onClick={() => handleAction(button.action)}
            disabled={isGenerating || button.loading || button.disabled}
            className={cn(
              "inline-flex items-center gap-2 px-4 py-2.5 rounded-lg",
              "text-sm font-medium transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-offset-2",
              "transform-gpu active:scale-95",
              isGenerating || button.loading || button.disabled
                ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
                : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:shadow-sm hover:scale-105",
              "focus:ring-zinc-400"
            )}
          >
            {button.loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              button.icon
            )}
            <span>{button.label}</span>
            {!button.loading && !isGenerating && (
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isGenerating && (
        <div className="flex items-center gap-3 py-3 px-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {loadingAction ? 
              `${loadingAction.charAt(0).toUpperCase() + loadingAction.slice(1)}ing your idea...` : 
              'Processing your request...'
            }
          </span>
        </div>
      )}

      {/* Action Tips */}
      {!isGenerating && !loadingAction && (
        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
          Click any action to refine your result
        </div>
      )}
    </div>
  );
}

export default OutputActions;
