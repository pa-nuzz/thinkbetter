from typing import Dict, Any, Type
from ..services.ai_service import AIService
from ..services.prompt_builder import PromptBuilder
from .exceptions import ConfigurationError

class ServiceFactory:
    """Factory for creating and managing service instances."""
    
    _instances: Dict[str, Any] = {}
    
    @classmethod
    def get_ai_service(cls) -> AIService:
        """Get or create AI service instance."""
        if "ai_service" not in cls._instances:
            cls._instances["ai_service"] = AIService()
        return cls._instances["ai_service"]
    
    @classmethod
    def get_prompt_builder(cls) -> PromptBuilder:
        """Get or create prompt builder instance."""
        if "prompt_builder" not in cls._instances:
            cls._instances["prompt_builder"] = PromptBuilder()
        return cls._instances["prompt_builder"]
    
    @classmethod
    def register_service(cls, name: str, service_class: Type, **kwargs) -> None:
        """Register a new service."""
        try:
            cls._instances[name] = service_class(**kwargs)
        except Exception as e:
            raise ConfigurationError(f"Failed to register service {name}: {e}")
    
    @classmethod
    def get_service(cls, name: str):
        """Get a registered service."""
        if name not in cls._instances:
            raise ConfigurationError(f"Service {name} not registered")
        return cls._instances[name]
    
    @classmethod
    def clear_instances(cls) -> None:
        """Clear all service instances (useful for testing)."""
        cls._instances.clear()
