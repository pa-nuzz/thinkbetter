'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, AppAction, Mode, GenerationHistoryItem, UserSettings, UIPreferences } from '@/types/store';

// Initial state
const initialState: AppState = {
  // UI State
  currentMode: 'idea',
  sidebarOpen: false,
  theme: 'system',
  
  // Generation State
  input: '',
  output: '',
  isGenerating: false,
  generationHistory: [],
  
  // Settings
  settings: {
    defaultProvider: 'groq',
    temperature: 0.7,
    maxTokens: 1000,
    ideaSettings: {
      defaultTone: 'neutral'
    },
    scriptSettings: {
      defaultScriptType: 'general'
    },
    brainstormSettings: {
      defaultQuantity: 5
    },
    promptSettings: {
      defaultTargetModel: 'gpt-4',
      defaultEnhancementType: 'comprehensive'
    }
  },
  
  // UI Preferences
  preferences: {
    autoSave: true,
    showCharacterCount: true,
    enableKeyboardShortcuts: true,
    showProgressiveReveal: true,
    revealSpeed: 20,
    autoCopy: false,
    compactMode: false,
    showTips: true
  }
};

// Reducer function
function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, currentMode: action.payload };
    
    case 'SET_INPUT':
      return { ...state, input: action.payload };
    
    case 'SET_OUTPUT':
      return { ...state, output: action.payload };
    
    case 'SET_GENERATING':
      return { ...state, isGenerating: action.payload };
    
    case 'ADD_TO_HISTORY':
      return {
        ...state,
        generationHistory: [action.payload, ...state.generationHistory]
      };
    
    case 'CLEAR_HISTORY':
      return { ...state, generationHistory: [] };
    
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload }
      };
    
    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload }
      };
    
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    
    default:
      return state;
  }
}

// Create store
export const useAppStore = create<AppState & { dispatch: (action: AppAction) => void }>()(
  persist(
    (set, get) => ({
      ...initialState,
      dispatch: (action: AppAction) => {
        set((state) => reducer(state, action));
      }
    }),
    {
      name: 'thinkbetter-store',
      partialize: (state) => ({
        settings: state.settings,
        preferences: state.preferences,
        theme: state.theme,
        generationHistory: state.generationHistory.slice(0, 50) // Keep only last 50 items
      })
    }
  )
);

// Selectors
export const useAppSelectors = () => {
  const state = useAppStore();
  
  return {
    getCurrentMode: () => state.currentMode,
    getInput: () => state.input,
    getOutput: () => state.output,
    getIsGenerating: () => state.isGenerating,
    getHistory: () => state.generationHistory,
    getSettings: () => state.settings,
    getPreferences: () => state.preferences
  };
};

// Action hooks
export const useAppActions = () => {
  const dispatch = useAppStore((state) => state.dispatch);
  
  return {
    setMode: (mode: Mode) => dispatch({ type: 'SET_MODE', payload: mode }),
    setInput: (input: string) => dispatch({ type: 'SET_INPUT', payload: input }),
    setOutput: (output: string) => dispatch({ type: 'SET_OUTPUT', payload: output }),
    setGenerating: (isGenerating: boolean) => dispatch({ type: 'SET_GENERATING', payload: isGenerating }),
    addToHistory: (item: GenerationHistoryItem) => dispatch({ type: 'ADD_TO_HISTORY', payload: item }),
    clearHistory: () => dispatch({ type: 'CLEAR_HISTORY' }),
    updateSettings: (settings: Partial<UserSettings>) => dispatch({ type: 'UPDATE_SETTINGS', payload: settings }),
    updatePreferences: (preferences: Partial<UIPreferences>) => dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences }),
    toggleSidebar: () => dispatch({ type: 'TOGGLE_SIDEBAR' }),
    setTheme: (theme: 'light' | 'dark' | 'system') => dispatch({ type: 'SET_THEME', payload: theme })
  };
};

// Combined hook for convenience
export const useApp = () => {
  const state = useAppStore();
  const selectors = useAppSelectors();
  const actions = useAppActions();
  
  return {
    ...state,
    ...selectors,
    ...actions
  };
};
