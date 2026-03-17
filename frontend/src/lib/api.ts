import {
  GenerateRequest,
  GenerateResponse,
  HealthResponse,
  ApiError as ImportedApiError,
  ApiClientConfig,
  RequestState
} from '@/types/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.baseURL = config.baseURL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP ${response.status}`,
          response.status,
          errorData.error,
          errorData.details
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 500);
      }
      
      throw new ApiError('Unknown error', 500);
    }
  }

  // Health endpoints
  async healthCheck(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health/');
  }

  async simpleHealthCheck(): Promise<{ status: string; timestamp: number }> {
    return this.request<{ status: string; timestamp: number }>('/health/simple');
  }

  // Generation endpoints
  async generateContent(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate/', {
      method: 'POST',
      body: JSON.stringify({
        ...request,
        options: {
          ...request.options,
          provider: 'groq'
        }
      }),
    });
  }

  async generateIdea(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate/idea', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async generateScript(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate/script', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async brainstorm(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate/brainstorm', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async enhancePrompt(request: GenerateRequest): Promise<GenerateResponse> {
    return this.request<GenerateResponse>('/generate/prompt', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Utility methods
  getBaseUrl(): string {
    return this.baseURL;
  }

  isHealthy(): Promise<boolean> {
    return this.simpleHealthCheck()
      .then(() => true)
      .catch(() => false);
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export { ApiError };
export type { ApiClientConfig, RequestState };
