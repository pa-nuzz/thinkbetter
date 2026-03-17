import os
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Application
    app_name: str = Field(default="ThinkBetter", env="APP_NAME")
    app_version: str = Field(default="1.0.0", env="APP_VERSION")
    debug: bool = Field(default=False, env="DEBUG")
    environment: str = Field(default="development", env="ENVIRONMENT")
    
    # Security
    secret_key: str = Field(default="dev-secret-key", env="SECRET_KEY")
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:3001", 
        env="ALLOWED_ORIGINS"
    )
    
    # AI Services - All providers supported
    openai_api_key: Optional[str] = Field(default=None, env="OPENAI_API_KEY")
    groq_api_key: Optional[str] = Field(default=None, env="GROQ_API_KEY")
    deepseek_api_key: Optional[str] = Field(default=None, env="DEEPSEEK_API_KEY")
    gemini_api_key: Optional[str] = Field(default=None, env="GEMINI_API_KEY")
    openrouter_api_key: Optional[str] = Field(default=None, env="OPENROUTER_API_KEY")
    
    # Default AI provider
    default_ai_provider: str = Field(default="groq", env="DEFAULT_AI_PROVIDER")
    
    # Rate Limiting
    rate_limit_requests: int = Field(default=20, env="RATE_LIMIT_REQUESTS")
    rate_limit_window: int = Field(default=60, env="RATE_LIMIT_WINDOW")
    
    # Logging
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_format: str = Field(default="json", env="LOG_FORMAT")
    
    # Database (future)
    database_url: str = Field(
        default="sqlite:///./thinkbetter.db",
        env="DATABASE_URL"
    )

    def get_available_providers(self) -> List[str]:
        """Get list of available AI providers based on API keys."""
        providers = []
        if self.openai_api_key and self.openai_api_key.strip():
            providers.append("openai")
        if self.groq_api_key and self.groq_api_key.strip():
            providers.append("groq")
        if self.deepseek_api_key and self.deepseek_api_key.strip():
            providers.append("deepseek")
        if self.gemini_api_key and self.gemini_api_key.strip():
            providers.append("gemini")
        if self.openrouter_api_key and self.openrouter_api_key.strip():
            providers.append("openrouter")
        return providers

    def get_default_provider(self) -> str:
        """Get the best available provider."""
        available = self.get_available_providers()
        if self.default_ai_provider in available:
            return self.default_ai_provider
        return available[0] if available else "groq"

    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"


# Global settings instance
settings = Settings()
