// Store/State Management Types
export type Mode = 'idea' | 'script' | 'brainstorm' | 'prompt';

export interface AppState {
  // UI State
  currentMode: Mode;
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  
  // Generation State
  input: string;
  output: string;
  isGenerating: boolean;
  generationHistory: GenerationHistoryItem[];
  
  // Settings
  settings: UserSettings;
  
  // UI Preferences
  preferences: UIPreferences;
}

export interface GenerationHistoryItem {
  id: string;
  mode: Mode;
  input: string;
  output: string;
  timestamp: Date;
  tokensUsed?: number;
  generationTime?: number;
}

export interface UserSettings {
  // AI Settings
  defaultProvider: 'openai' | 'groq';
  temperature: number;
  maxTokens: number;
  
  // Mode-specific defaults
  ideaSettings: {
    defaultCategory?: string;
    defaultTone: string;
  };
  
  scriptSettings: {
    defaultScriptType: string;
  };
  
  brainstormSettings: {
    defaultQuantity: number;
  };
  
  promptSettings: {
    defaultTargetModel: string;
    defaultEnhancementType: string;
  };
}

export interface UIPreferences {
  // Input preferences
  autoSave: boolean;
  showCharacterCount: boolean;
  enableKeyboardShortcuts: boolean;
  
  // Output preferences
  showProgressiveReveal: boolean;
  revealSpeed: number;
  autoCopy: boolean;
  
  // Interface preferences
  compactMode: boolean;
  showTips: boolean;
}

// Action Types
export type AppAction =
  | { type: 'SET_MODE'; payload: Mode }
  | { type: 'SET_INPUT'; payload: string }
  | { type: 'SET_OUTPUT'; payload: string }
  | { type: 'SET_GENERATING'; payload: boolean }
  | { type: 'ADD_TO_HISTORY'; payload: GenerationHistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<UserSettings> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<UIPreferences> }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' };

// Selectors
export interface AppSelectors {
  getCurrentMode: (state: AppState) => Mode;
  getInput: (state: AppState) => string;
  getOutput: (state: AppState) => string;
  getIsGenerating: (state: AppState) => boolean;
  getHistory: (state: AppState) => GenerationHistoryItem[];
  getSettings: (state: AppState) => UserSettings;
  getPreferences: (state: AppState) => UIPreferences;
}
