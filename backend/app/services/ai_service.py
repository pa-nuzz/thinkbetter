import time
from typing import Dict, Any, Optional, List

from ..core.config import settings
from ..core.logging import get_logger
from ..core.exceptions import AIServiceError
from .providers import (
    OpenAIProvider, 
    GroqProvider, 
    DeepSeekProvider, 
    OpenRouterProvider,
    GeminiProvider
)

logger = get_logger(__name__)


class AIService:
    """Main AI service that manages different providers."""
    
    def __init__(self):
        self._providers: Dict[str, Any] = {}
        self._initialize_providers()
    
    def _initialize_providers(self) -> None:
        """Initialize all available AI providers."""
        provider_map = {
            "openai": (OpenAIProvider, settings.openai_api_key),
            "groq": (GroqProvider, settings.groq_api_key),
            "deepseek": (DeepSeekProvider, settings.deepseek_api_key),
            "gemini": (GeminiProvider, settings.gemini_api_key),
            "openrouter": (OpenRouterProvider, settings.openrouter_api_key)
        }
        
        for provider_name, (provider_class, api_key) in provider_map.items():
            if api_key and api_key.strip():
                try:
                    self._providers[provider_name] = provider_class(api_key)
                    logger.info(f"{provider_name} provider initialized")
                except Exception as e:
                    logger.error(f"Failed to initialize {provider_name} provider: {e}")
            else:
                logger.info(f"{provider_name} provider skipped (no API key)")
        
        # Log available providers
        available = list(self._providers.keys())
        logger.info(f"Available AI providers: {available}")
        
        if not available:
            logger.warning("No AI providers available - check your API keys")
    
    async def generate(
        self,
        prompt: str,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using specified or best available provider."""
        
        # Determine which provider to use
        if provider and provider in self._providers:
            target_provider = provider
        else:
            target_provider = settings.get_default_provider()
            if target_provider not in self._providers:
                available = list(self._providers.keys())
                if not available:
                    raise AIServiceError("No AI providers available")
                target_provider = available[0]
                logger.warning(f"Requested provider '{provider}' not available, using '{target_provider}'")
        
        ai_provider = self._providers[target_provider]
        
        # Use default model if none specified
        if not model:
            model = ai_provider.get_default_model()
        
        logger.info(f"Using provider: {target_provider}, model: {model}")
        
        return await ai_provider.generate(prompt, model, **kwargs)
    
    async def health_check(self) -> Dict[str, str]:
        """Check health of all AI services."""
        status = {}
        
        for provider_name, provider in self._providers.items():
            try:
                is_healthy = await provider.health_check()
                status[provider_name] = "healthy" if is_healthy else "unhealthy"
            except Exception as e:
                status[provider_name] = f"error: {str(e)}"
        
        return status
    
    def get_available_providers(self) -> List[str]:
        """Get list of available providers."""
        return list(self._providers.keys())
    
    def is_provider_available(self, provider: str) -> bool:
        """Check if a specific provider is available."""
        return provider in self._providers
    
    def get_provider_info(self) -> Dict[str, Dict[str, Any]]:
        """Get information about all providers."""
        info = {}
        for provider_name, provider in self._providers.items():
            info[provider_name] = {
                "name": provider.name,
                "default_model": provider.get_default_model(),
                "available_models": provider.get_available_models()
            }
        return info
    
    async def generate_with_fallback(
        self,
        prompt: str,
        preferred_providers: Optional[List[str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generate content with automatic fallback between providers.
        Default fallback order: groq -> gemini -> openrouter -> deepseek
        """
        try:
            # Validate input
            if not prompt or not prompt.strip():
                raise AIServiceError("Prompt cannot be empty")
            
            # Use preferred providers or default fallback order
            providers_to_try = preferred_providers or ["groq", "gemini", "openrouter", "deepseek"]
            
            logger.info(f"Starting fallback generation with providers: {providers_to_try}")
            
            for provider_name in providers_to_try:
                if provider_name not in self._providers:
                    logger.warning(f"Provider {provider_name} not available, skipping")
                    continue
                
                try:
                    logger.info(f"Attempting generation with {provider_name}")
                    result = await self.generate(prompt, provider=provider_name, **kwargs)
                    logger.info(f"Successfully generated with {provider_name}")
                    return result
                except Exception as e:
                    logger.error(f"Failed to generate with {provider_name}: {e}")
                    continue
            
            raise AIServiceError("All AI providers failed")
            
        except Exception as e:
            logger.error(f"Fallback generation failed: {e}")
            raise AIServiceError(f"All AI providers failed: {str(e)}")


# Global AI service instance
ai_service = AIService()
