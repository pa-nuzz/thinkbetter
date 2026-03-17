import time
from fastapi import APIRouter
from ..models.schemas import HealthResponse
from ..services.ai_service import ai_service
from ..core.config import settings
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/health", tags=["health"])


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Comprehensive health check endpoint."""
    
    try:
        # Check AI services health
        ai_health = await ai_service.health_check()
        
        # Calculate uptime (simplified - in production, track actual start time)
        uptime = time.time()
        
        response = HealthResponse(
            status="healthy",
            version=settings.app_version,
            uptime=uptime,
            services={
                "api": "healthy",
                **ai_health
            }
        )
        
        logger.info("Health check completed", extra={"services": response.services})
        return response
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse(
            status="unhealthy",
            version=settings.app_version,
            uptime=time.time(),
            services={
                "api": f"unhealthy: {str(e)}"
            }
        )


@router.get("/simple")
async def simple_health() -> dict:
    """Simple health check for load balancers."""
    return {"status": "ok", "timestamp": time.time()}
