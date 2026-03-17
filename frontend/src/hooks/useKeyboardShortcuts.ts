'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/store';
import { useGeneration } from './useGeneration';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const { preferences } = useApp();

  useEffect(() => {
    if (!preferences.enableKeyboardShortcuts) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;

        if (keyMatches && ctrlMatches && metaMatches && shiftMatches) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, preferences.enableKeyboardShortcuts]);
}

export function useAppKeyboardShortcuts() {
  const { setMode, setInput, setOutput } = useApp();
  const { generate } = useGeneration();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: '1',
      action: () => setMode('idea'),
      description: 'Switch to Idea mode'
    },
    {
      key: '2',
      action: () => setMode('script'),
      description: 'Switch to Script mode'
    },
    {
      key: '3',
      action: () => setMode('brainstorm'),
      description: 'Switch to Brainstorm mode'
    },
    {
      key: '4',
      action: () => setMode('prompt'),
      description: 'Switch to Prompt mode'
    },
    {
      key: 'l',
      ctrlKey: true,
      action: () => setInput(''),
      description: 'Clear input'
    },
    {
      key: 'k',
      ctrlKey: true,
      action: () => setOutput(''),
      description: 'Clear output'
    },
    {
      key: 'Enter',
      ctrlKey: true,
      action: generate,
      description: 'Generate content'
    }
  ];

  useKeyboardShortcuts(shortcuts);

  return shortcuts;
}
