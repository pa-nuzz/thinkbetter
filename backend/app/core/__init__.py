# Core module exports
from .config import settings, Settings
from .logging import setup_logging, get_logger, StructuredLogger
from .exceptions import (
    ThinkBetterException,
    ValidationError,
    AIServiceError,
    RateLimitError,
    ConfigurationError,
    AuthenticationError
)
from .dependencies import (
    get_settings,
    get_logger_dependency,
    get_ai_service,
    get_prompt_builder,
    get_api_logger,
    get_service_logger
)
from .factory import ServiceFactory
from .handlers import ErrorHandler
from .middleware import setup_middleware

__all__ = [
    "settings",
    "Settings",
    "setup_logging",
    "get_logger",
    "StructuredLogger",
    "ThinkBetterException",
    "ValidationError",
    "AIServiceError",
    "RateLimitError",
    "ConfigurationError",
    "AuthenticationError",
    "get_settings",
    "get_logger_dependency",
    "get_ai_service",
    "get_prompt_builder",
    "get_api_logger",
    "get_service_logger",
    "ServiceFactory",
    "ErrorHandler",
    "setup_middleware"
]