// API Types
export interface BaseApiResponse {
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError extends BaseApiResponse {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

// Request Types
export interface GenerateRequest {
  mode: 'idea' | 'script' | 'brainstorm' | 'prompt';
  input: string;
  options?: Record<string, unknown>;
}

export interface IdeaGenerateRequest extends GenerateRequest {
  mode: 'idea';
  category?: string;
  tone?: string;
}

export interface ScriptGenerateRequest extends GenerateRequest {
  mode: 'script';
  script_type?: string;
  characters?: string[];
}

export interface BrainstormRequest extends GenerateRequest {
  mode: 'brainstorm';
  focus_areas?: string[];
  quantity?: number;
}

export interface PromptEnhanceRequest extends GenerateRequest {
  mode: 'prompt';
  target_model?: string;
  enhancement_type?: string;
}

// Response Types
export interface GenerateResponse extends BaseApiResponse {
  mode: string;
  input: string;
  output: string;
  tokens_used?: number;
  generation_time?: number;
}

export interface HealthResponse {
  status: string;
  version: string;
  uptime: number;
  services: Record<string, string>;
}

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retries: number;
}

// Request State
export interface RequestState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}
