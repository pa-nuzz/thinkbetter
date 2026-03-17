from functools import lru_cache
from typing import AsyncGenerator
from fastapi import Depends

from .config import settings
from .logging import get_logger
from ..services.ai_service import AIService
from ..services.prompt_builder import PromptBuilder

logger = get_logger(__name__)


@lru_cache()
def get_settings() -> settings:
    """Get cached settings instance."""
    return settings


def get_logger_dependency(name: str):
    """Factory function to create logger dependency."""
    def _get_logger():
        return get_logger(name)
    return _get_logger


async def get_ai_service() -> AsyncGenerator[AIService, None]:
    """Dependency for AI service instance."""
    try:
        service = AIService()
        yield service
    except Exception as e:
        logger.error(f"Failed to initialize AI service: {e}")
        raise


def get_prompt_builder() -> PromptBuilder:
    """Dependency for prompt builder instance."""
    return PromptBuilder()


# Common dependencies
get_api_logger = get_logger_dependency("api")
get_service_logger = get_logger_dependency("service")
