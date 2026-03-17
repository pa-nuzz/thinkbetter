from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .core.config import settings
from .core.logging import setup_logging
from .core.middleware import setup_middleware
from .core.dependencies import get_settings, get_ai_service, get_prompt_builder
from .core.handlers import (
    validation_exception_handler,
    ai_service_exception_handler,
    rate_limit_exception_handler,
    generic_exception_handler
)
from .core.exceptions import ValidationError, AIServiceError, RateLimitError
from .routes import generation, health, providers

# Setup logging
setup_logging()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI-powered idea enhancement platform",
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None
)

# Setup middleware
setup_middleware(app)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins.split(',') if settings.allowed_origins else ["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(generation.router)
app.include_router(health.router)
app.include_router(providers.router)

# Exception handlers
app.add_exception_handler(ValidationError, validation_exception_handler)
app.add_exception_handler(AIServiceError, ai_service_exception_handler)
app.add_exception_handler(RateLimitError, rate_limit_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": settings.app_version,
        "status": "running"
    }

@app.get("/info")
async def app_info():
    """Application information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "debug": settings.debug
    }
