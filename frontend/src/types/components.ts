import React from 'react';

// Base Component Props
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Mode types
export type Mode = 'idea' | 'script' | 'brainstorm' | 'prompt';

export interface ModeOption {
  id: Mode;
  label: string;
  description: string;
  icon?: React.ReactNode;
}

// InputBox types
export interface InputBoxProps extends BaseComponentProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  showCharacterCount?: boolean;
  submitButtonText?: string;
}

// ModeSwitcher types
export interface ModeSwitcherProps extends BaseComponentProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
  modes?: ModeOption[];
  title?: string;
  layout?: 'grid' | 'tabs';
}

// OutputCard types
export interface OutputCardProps extends BaseComponentProps {
  title?: string;
  content: string;
  mode?: Mode;
  isLoading?: boolean;
  showProgress?: boolean;
  progress?: number;
  actions?: ActionButton[];
  timestamp?: Date;
}

// ActionButtons types
export interface ActionButton {
  id: string;
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface ActionButtonsProps extends BaseComponentProps {
  actions: ActionButton[];
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  alignment?: 'left' | 'center' | 'right';
}

// LoadingSkeleton types
export interface LoadingSkeletonProps extends BaseComponentProps {
  type?: 'text' | 'card' | 'list' | 'input';
  lines?: number;
  height?: string;
  width?: string;
  animate?: boolean;
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

// Animation types
export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

// Theme types
export type ThemeVariant = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  variant: ThemeVariant;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}
