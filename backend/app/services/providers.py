import time
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from openai import AsyncOpenAI, OpenAIError
from groq import AsyncGroq, GroqError
import httpx

from ..core.logging import get_logger
from ..core.exceptions import AIServiceError

logger = get_logger(__name__)


class BaseAIProvider(ABC):
    """Abstract base class for AI providers."""
    
    def __init__(self, api_key: str, name: str):
        self.api_key = api_key
        self.name = name
        self._client = None
        self._initialize_client()
    
    @abstractmethod
    def _initialize_client(self) -> None:
        """Initialize the AI provider client."""
        pass
    
    @abstractmethod
    async def generate(
        self,
        prompt: str,
        model: str,
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using the AI provider."""
        pass
    
    @abstractmethod
    async def health_check(self) -> bool:
        """Check if the AI service is healthy."""
        pass
    
    @abstractmethod
    def get_default_model(self) -> str:
        """Get the default model for this provider."""
        pass
    
    @abstractmethod
    def get_available_models(self) -> List[str]:
        """Get list of available models."""
        pass


class OpenAIProvider(BaseAIProvider):
    """OpenAI AI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "OpenAI")
    
    def _initialize_client(self) -> None:
        """Initialize OpenAI client."""
        try:
            self._client = AsyncOpenAI(api_key=self.api_key)
            logger.info("OpenAI client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            raise AIServiceError(f"OpenAI initialization failed: {e}")
    
    async def generate(
        self,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using OpenAI."""
        if not self._client:
            raise AIServiceError("OpenAI client not initialized")
        
        start_time = time.time()
        
        try:
            logger.info(f"Generating with OpenAI: model={model}, prompt_length={len(prompt)}")
            
            response = await self._client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            generation_time = time.time() - start_time
            tokens_used = response.usage.total_tokens if response.usage else 0
            
            result = {
                "content": response.choices[0].message.content,
                "tokens_used": tokens_used,
                "generation_time": generation_time,
                "model": model,
                "provider": "openai"
            }
            
            logger.info(
                f"OpenAI generation successful",
                extra={
                    "tokens_used": tokens_used,
                    "generation_time": generation_time,
                    "model": model
                }
            )
            
            return result
            
        except OpenAIError as e:
            logger.error(f"OpenAI API error: {e}")
            raise AIServiceError(f"OpenAI API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in OpenAI generation: {e}")
            raise AIServiceError(f"Generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check OpenAI service health."""
        try:
            await self._client.models.list()
            return True
        except Exception as e:
            logger.error(f"OpenAI health check failed: {e}")
            return False
    
    def get_default_model(self) -> str:
        return "gpt-3.5-turbo"
    
    def get_available_models(self) -> List[str]:
        return ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]


class GroqProvider(BaseAIProvider):
    """Groq AI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "Groq")
    
    def _initialize_client(self) -> None:
        """Initialize Groq client."""
        try:
            self._client = AsyncGroq(api_key=self.api_key)
            logger.info("Groq client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            raise AIServiceError(f"Groq initialization failed: {e}")
    
    async def generate(
        self,
        prompt: str,
        model: str = "llama2-70b-4096",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using Groq."""
        if not self._client:
            raise AIServiceError("Groq client not initialized")
        
        start_time = time.time()
        
        try:
            logger.info(f"Generating with Groq: model={model}, prompt_length={len(prompt)}")
            
            response = await self._client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            generation_time = time.time() - start_time
            tokens_used = response.usage.total_tokens if response.usage else 0
            
            result = {
                "content": response.choices[0].message.content,
                "tokens_used": tokens_used,
                "generation_time": generation_time,
                "model": model,
                "provider": "groq"
            }
            
            logger.info(
                f"Groq generation successful",
                extra={
                    "tokens_used": tokens_used,
                    "generation_time": generation_time,
                    "model": model
                }
            )
            
            return result
            
        except GroqError as e:
            logger.error(f"Groq API error: {e}")
            raise AIServiceError(f"Groq API error: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error in Groq generation: {e}")
            raise AIServiceError(f"Generation failed: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check Groq service health."""
        try:
            await self._client.models.list()
            return True
        except Exception as e:
            logger.error(f"Groq health check failed: {e}")
            return False
    
    def get_default_model(self) -> str:
        return "llama-3.1-70b-versatile"
    
    def get_available_models(self) -> List[str]:
        return ["llama-3.1-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"]


class DeepSeekProvider(BaseAIProvider):
    """DeepSeek AI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "DeepSeek")
    
    def _initialize_client(self) -> None:
        """Initialize DeepSeek client."""
        try:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url="https://api.deepseek.com"
            )
            logger.info("DeepSeek client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize DeepSeek client: {e}")
            raise AIServiceError(f"DeepSeek initialization failed: {e}")
    
    async def generate(
        self,
        prompt: str,
        model: str = "deepseek-chat",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using DeepSeek."""
        if not self._client:
            raise AIServiceError("DeepSeek client not initialized")
        
        start_time = time.time()
        
        try:
            logger.info(f"Generating with DeepSeek: model={model}, prompt_length={len(prompt)}")
            
            response = await self._client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            generation_time = time.time() - start_time
            tokens_used = response.usage.total_tokens if response.usage else 0
            
            result = {
                "content": response.choices[0].message.content,
                "tokens_used": tokens_used,
                "generation_time": generation_time,
                "model": model,
                "provider": "deepseek"
            }
            
            logger.info(
                f"DeepSeek generation successful",
                extra={
                    "tokens_used": tokens_used,
                    "generation_time": generation_time,
                    "model": model
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"DeepSeek API error: {e}")
            raise AIServiceError(f"DeepSeek API error: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check DeepSeek service health."""
        try:
            await self._client.chat.completions.create(
                model="deepseek-chat",
                messages=[{"role": "user", "content": "test"}],
                max_tokens=1
            )
            return True
        except Exception as e:
            logger.error(f"DeepSeek health check failed: {e}")
            return False
    
    def get_default_model(self) -> str:
        return "deepseek-chat"
    
    def get_available_models(self) -> List[str]:
        return ["deepseek-chat", "deepseek-coder"]


class GeminiProvider(BaseAIProvider):
    """Google Gemini AI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "Gemini")
    
    def _initialize_client(self) -> None:
        """Initialize Gemini client."""
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._client = genai.GenerativeModel('gemini-pro')
            logger.info("Gemini client initialized")
        except ImportError:
            logger.error("Google Generative AI package not installed")
            raise AIServiceError("Gemini package not installed")
        except Exception as e:
            logger.error(f"Failed to initialize Gemini client: {e}")
            raise AIServiceError(f"Gemini initialization failed: {e}")
    
    async def generate(
        self,
        prompt: str,
        model: str = "gemini-pro",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using Gemini."""
        if not self._client:
            raise AIServiceError("Gemini client not initialized")
        
        start_time = time.time()
        
        try:
            logger.info(f"Generating with Gemini: model={model}, prompt_length={len(prompt)}")
            
            # Combine system prompt and user prompt
            full_prompt = f"""You are a helpful AI assistant designed to provide creative, practical, and insightful responses.

{prompt}"""
            
            response = await self._client.generate_content_async(full_prompt)
            
            generation_time = time.time() - start_time
            
            # Extract text from response
            content = response.text if hasattr(response, 'text') else str(response)
            
            result = {
                "content": content,
                "tokens_used": len(content.split()),  # Approximate
                "generation_time": generation_time,
                "model": model,
                "provider": "gemini"
            }
            
            logger.info(
                f"Gemini generation successful",
                extra={
                    "tokens_used": result["tokens_used"],
                    "generation_time": generation_time,
                    "model": model
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            raise AIServiceError(f"Gemini API error: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check Gemini service health."""
        try:
            response = await self._client.generate_content_async("test")
            return True
        except Exception as e:
            logger.error(f"Gemini health check failed: {e}")
            return False
    
    def get_default_model(self) -> str:
        return "gemini-pro"
    
    def get_available_models(self) -> List[str]:
        return ["gemini-pro", "gemini-pro-vision"]


class OpenRouterProvider(BaseAIProvider):
    """OpenRouter AI provider implementation."""
    
    def __init__(self, api_key: str):
        super().__init__(api_key, "OpenRouter")
    
    def _initialize_client(self) -> None:
        """Initialize OpenRouter client."""
        try:
            self._client = AsyncOpenAI(
                api_key=self.api_key,
                base_url="https://openrouter.ai/api/v1"
            )
            logger.info("OpenRouter client initialized")
        except Exception as e:
            logger.error(f"Failed to initialize OpenRouter client: {e}")
            raise AIServiceError(f"OpenRouter initialization failed: {e}")
    
    async def generate(
        self,
        prompt: str,
        model: str = "anthropic/claude-3-haiku",
        max_tokens: int = 1000,
        temperature: float = 0.7,
        **kwargs
    ) -> Dict[str, Any]:
        """Generate content using OpenRouter."""
        if not self._client:
            raise AIServiceError("OpenRouter client not initialized")
        
        start_time = time.time()
        
        try:
            logger.info(f"Generating with OpenRouter: model={model}, prompt_length={len(prompt)}")
            
            response = await self._client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "You are a helpful AI assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=temperature
            )
            
            generation_time = time.time() - start_time
            tokens_used = response.usage.total_tokens if response.usage else 0
            
            result = {
                "content": response.choices[0].message.content,
                "tokens_used": tokens_used,
                "generation_time": generation_time,
                "model": model,
                "provider": "openrouter"
            }
            
            logger.info(
                f"OpenRouter generation successful",
                extra={
                    "tokens_used": tokens_used,
                    "generation_time": generation_time,
                    "model": model
                }
            )
            
            return result
            
        except Exception as e:
            logger.error(f"OpenRouter API error: {e}")
            raise AIServiceError(f"OpenRouter API error: {str(e)}")
    
    async def health_check(self) -> bool:
        """Check OpenRouter service health."""
        try:
            response = await httpx.get(
                "https://openrouter.ai/api/v1/models",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            return response.status_code == 200
        except Exception as e:
            logger.error(f"OpenRouter health check failed: {e}")
            return False
    
    def get_default_model(self) -> str:
        return "anthropic/claude-3-haiku"
    
    def get_available_models(self) -> List[str]:
        return [
            "anthropic/claude-3-haiku",
            "anthropic/claude-3-sonnet",
            "openai/gpt-3.5-turbo",
            "openai/gpt-4",
            "meta-llama/llama-3-8b-instruct"
        ]
