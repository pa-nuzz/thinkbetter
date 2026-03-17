import time
from typing import Dict, Any, Optional, List
from ..core.config import settings
from ..core.logging import get_logger
from ..core.exceptions import AIServiceError, ValidationError
from .ai_service import ai_service
from .prompts import prompt_builder

logger = get_logger(__name__)


class GenerationService:
    """Central service for AI content generation with multiple providers."""
    
    def __init__(self):
        self.prompt_builder = prompt_builder
        self.ai_service = ai_service
    
    async def generate_response(
        self,
        input_text: str,
        mode: str,
        provider: Optional[str] = None,
        model: Optional[str] = None,
        **options
    ) -> Dict[str, Any]:
        """
        Central function to generate AI responses with automatic fallback.
        
        Args:
            input_text: User input text
            mode: Generation mode (idea, script, brainstorm, prompt)
            provider: Specific AI provider to use (optional)
            model: Specific model to use (optional)
            **options: Additional generation options
            
        Returns:
            Dict with generated content and metadata
        """
        start_time = time.time()
        
        try:
            # Validate input
            self._validate_input(input_text, mode)
            
            # Build mode-specific prompt
            prompt = self._build_prompt(input_text, mode, **options)
            
            # Use fallback generation by default for reliability
            preferred_providers = [provider] if provider else ["groq", "gemini", "openrouter", "deepseek"]
            
            logger.info(f"Generating response: mode={mode}, preferred_providers={preferred_providers}")
            
            result = await self.ai_service.generate_with_fallback(
                prompt=prompt,
                preferred_providers=preferred_providers,
                model=model,
                max_tokens=options.get('max_tokens', 1000),
                temperature=options.get('temperature', 0.7)
            )
            
            # Format response
            response = self._format_response(
                result=result,
                mode=mode,
                input_text=input_text,
                generation_time=time.time() - start_time,
                provider=result.get("provider", "unknown")
            )
            
            logger.info(
                f"Generation successful",
                extra={
                    "mode": mode,
                    "provider": response["provider"],
                    "tokens_used": response["tokens_used"],
                    "generation_time": response["generation_time"]
                }
            )
            
            return response
            
        except ValidationError as e:
            logger.error(f"Validation error: {e}")
            raise
        except AIServiceError as e:
            logger.error(f"AI service error: {e}")
            raise
        except Exception as e:
            logger.error(f"Unexpected error in generation: {e}")
            raise AIServiceError(f"Generation failed: {str(e)}")
    
    async def generate_with_fallback(
        self,
        input_text: str,
        mode: str,
        preferred_providers: Optional[List[str]] = None,
        **options
    ) -> Dict[str, Any]:
        """
        Generate content with automatic fallback between providers.
        
        Args:
            input_text: User input text
            mode: Generation mode
            preferred_providers: List of providers to try in order
            **options: Additional generation options
            
        Returns:
            Dict with generated content and metadata
        """
        try:
            # Validate input
            self._validate_input(input_text, mode)
            
            # Build prompt
            prompt = self._build_prompt(input_text, mode, **options)
            
            # Use AI service fallback mechanism
            result = await self.ai_service.generate_with_fallback(
                prompt=prompt,
                preferred_providers=preferred_providers,
                max_tokens=options.get('max_tokens', 1000),
                temperature=options.get('temperature', 0.7)
            )
            
            # Format response
            response = self._format_response(
                result=result,
                mode=mode,
                input_text=input_text,
                provider=result.get("provider", "unknown")
            )
            
            logger.info(f"Generation with fallback successful: provider={response['provider']}")
            
            return response
            
        except Exception as e:
            logger.error(f"All providers failed in fallback: {e}")
            raise AIServiceError(f"All AI providers failed: {str(e)}")
    
    def _validate_input(self, input_text: str, mode: str) -> None:
        """Validate input parameters."""
        if not input_text or not input_text.strip():
            raise ValidationError("Input text cannot be empty")
        
        if len(input_text) > 10000:
            raise ValidationError("Input text too long (max 10000 characters)")
        
        valid_modes = self.prompt_builder.get_supported_modes()
        if mode not in valid_modes:
            raise ValidationError(f"Invalid mode: {mode}. Valid modes: {valid_modes}")
        
        # Check if clarification is needed
        needs_clarification, questions = self.prompt_builder.needs_clarification(input_text, mode)
        if needs_clarification:
            raise ValidationError(
                "Input needs clarification for better results",
                details={"questions": questions, "suggestions": questions}
            )
    
    def _build_prompt(self, input_text: str, mode: str, **options) -> str:
        """Build mode-specific prompt."""
        try:
            return self.prompt_builder.build_prompt(mode, input_text, **options)
        except Exception as e:
            logger.error(f"Failed to build prompt: {e}")
            raise ValidationError(f"Prompt building failed: {str(e)}")
    
    def _format_response(
        self,
        result: Dict[str, Any],
        mode: str,
        input_text: str,
        generation_time: float,
        provider: str
    ) -> Dict[str, Any]:
        """Format the generation response."""
        return {
            "success": True,
            "mode": mode,
            "input": input_text,
            "output": result["content"],
            "provider": provider,
            "model": result["model"],
            "tokens_used": result.get("tokens_used", 0),
            "generation_time": generation_time,
            "timestamp": time.time(),
            "metadata": {
                "prompt_tokens": result.get("tokens_used", 0),
                "completion_tokens": result.get("tokens_used", 0),
                "total_tokens": result.get("tokens_used", 0)
            }
        }
    
    def get_provider_info(self) -> Dict[str, Any]:
        """Get information about available providers."""
        return self.ai_service.get_provider_info()
    
    async def health_check(self) -> Dict[str, str]:
        """Check health of all AI providers."""
        return await self.ai_service.health_check()
    
    def get_supported_modes(self) -> List[str]:
        """Get list of supported generation modes."""
        return self.prompt_builder.get_supported_modes()
    
    def get_mode_options(self, mode: str) -> Dict[str, Any]:
        """Get available options for a specific mode."""
        return self.prompt_builder.get_mode_requirements(mode)


# Global generation service instance
generation_service = GenerationService()
