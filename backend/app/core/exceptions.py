from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class ThinkBetterException(Exception):
    """Base exception for ThinkBetter application."""
    
    def __init__(
        self,
        message: str,
        error_code: str = None,
        details: Dict[str, Any] = None
    ):
        self.message = message
        self.error_code = error_code or self.__class__.__name__
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(ThinkBetterException):
    """Raised when input validation fails."""
    pass


class AIServiceError(ThinkBetterException):
    """Raised when AI service encounters an error."""
    pass


class RateLimitError(ThinkBetterException):
    """Raised when rate limit is exceeded."""
    pass


class ConfigurationError(ThinkBetterException):
    """Raised when there's a configuration issue."""
    pass


class AuthenticationError(ThinkBetterException):
    """Raised when authentication fails."""
    pass


def create_http_exception(
    status_code: int,
    message: str,
    error_code: str = None,
    details: Dict[str, Any] = None
) -> HTTPException:
    """Create a standardized HTTP exception."""
    return HTTPException(
        status_code=status_code,
        detail={
            "error": error_code or "UNKNOWN_ERROR",
            "message": message,
            "details": details or {}
        }
    )


def handle_validation_error(error: ValidationError) -> HTTPException:
    """Convert ValidationError to HTTPException."""
    return create_http_exception(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        message=error.message,
        error_code=error.error_code,
        details=error.details
    )


def handle_ai_service_error(error: AIServiceError) -> HTTPException:
    """Convert AIServiceError to HTTPException."""
    return create_http_exception(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        message="AI service temporarily unavailable",
        error_code=error.error_code,
        details=error.details
    )


def handle_rate_limit_error(error: RateLimitError) -> HTTPException:
    """Convert RateLimitError to HTTPException."""
    return create_http_exception(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        message="Rate limit exceeded",
        error_code=error.error_code,
        details=error.details
    )
