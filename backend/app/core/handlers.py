from typing import Dict, Any
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.status import HTTP_422_UNPROCESSABLE_ENTITY, HTTP_503_SERVICE_UNAVAILABLE, HTTP_429_TOO_MANY_REQUESTS

from .exceptions import ThinkBetterException, ValidationError, AIServiceError, RateLimitError
from .logging import get_logger

logger = get_logger(__name__)


class ErrorHandler:
    """Centralized error handling for the application."""
    
    @staticmethod
    def create_error_response(
        status_code: int,
        message: str,
        error_code: str = None,
        details: Dict[str, Any] = None
    ) -> JSONResponse:
        """Create standardized error response."""
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "error": error_code or "UNKNOWN_ERROR",
                "message": message,
                "details": details or {}
            }
        )
    
    @staticmethod
    async def handle_think_better_exception(
        request: Request,
        exc: ThinkBetterException
    ) -> JSONResponse:
        """Handle ThinkBetter base exceptions."""
        logger.error(
            f"ThinkBetter exception: {exc.message}",
            extra={
                "error_code": exc.error_code,
                "details": exc.details,
                "path": request.url.path
            }
        )
        
        if isinstance(exc, ValidationError):
            return ErrorHandler.create_error_response(
                status_code=HTTP_422_UNPROCESSABLE_ENTITY,
                message=exc.message,
                error_code=exc.error_code,
                details=exc.details
            )
        elif isinstance(exc, AIServiceError):
            return ErrorHandler.create_error_response(
                status_code=HTTP_503_SERVICE_UNAVAILABLE,
                message="AI service temporarily unavailable",
                error_code=exc.error_code,
                details=exc.details
            )
        elif isinstance(exc, RateLimitError):
            return ErrorHandler.create_error_response(
                status_code=HTTP_429_TOO_MANY_REQUESTS,
                message="Rate limit exceeded",
                error_code=exc.error_code,
                details=exc.details
            )
        else:
            return ErrorHandler.create_error_response(
                status_code=500,
                message=exc.message,
                error_code=exc.error_code,
                details=exc.details
            )
    
    @staticmethod
    async def handle_generic_exception(
        request: Request,
        exc: Exception
    ) -> JSONResponse:
        """Handle generic exceptions."""
        logger.error(
            f"Unhandled exception: {str(exc)}",
            extra={
                "exception_type": type(exc).__name__,
                "path": request.url.path
            }
        )
        
        return ErrorHandler.create_error_response(
            status_code=500,
            message="An unexpected error occurred",
            error_code="INTERNAL_ERROR",
            details={"type": type(exc).__name__}
        )


# Exception handler functions for FastAPI
async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
    """Handle validation errors."""
    return await ErrorHandler.handle_think_better_exception(request, exc)


async def ai_service_exception_handler(request: Request, exc: AIServiceError) -> JSONResponse:
    """Handle AI service errors."""
    return await ErrorHandler.handle_think_better_exception(request, exc)


async def rate_limit_exception_handler(request: Request, exc: RateLimitError) -> JSONResponse:
    """Handle rate limit errors."""
    return await ErrorHandler.handle_think_better_exception(request, exc)


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle generic exceptions."""
    return await ErrorHandler.handle_generic_exception(request, exc)
