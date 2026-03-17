from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from ..services.ai_service import ai_service
from ..core.exceptions import AIServiceError
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/providers", tags=["providers"])
limiter = Limiter(key_func=get_remote_address)


@router.get("/")
@limiter.limit("60/minute")
async def get_providers(request: Request):
    """Get all available AI providers and their information."""
    try:
        providers = ai_service.get_provider_info()
        return {
            "providers": providers,
            "available": ai_service.get_available_providers(),
            "default": ai_service.get_available_providers()[0] if ai_service.get_available_providers() else None
        }
    except Exception as e:
        logger.error(f"Failed to get providers: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve provider information")


@router.get("/health")
@limiter.limit("30/minute")
async def providers_health(request: Request):
    """Get health status of all AI providers."""
    try:
        health_status = await ai_service.health_check()
        return {
            "health": health_status,
            "timestamp": "2024-01-01T00:00:00Z"  # Would use actual timestamp
        }
    except Exception as e:
        logger.error(f"Failed to check provider health: {e}")
        raise HTTPException(status_code=500, detail="Failed to check provider health")


@router.get("/models/{provider}")
@limiter.limit("30/minute")
async def get_provider_models(provider: str, request: Request):
    """Get available models for a specific provider."""
    try:
        if not ai_service.is_provider_available(provider):
            raise HTTPException(status_code=404, detail=f"Provider '{provider}' not available")
        
        provider_info = ai_service.get_provider_info()
        if provider not in provider_info:
            raise HTTPException(status_code=404, detail=f"Provider '{provider}' not found")
        
        return {
            "provider": provider,
            "models": provider_info[provider]["available_models"],
            "default_model": provider_info[provider]["default_model"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get models for provider {provider}: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve models")
