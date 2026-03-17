import time
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import RequestResponseEndpoint

from .config import settings
from .logging import get_logger, log_request, log_error
from .exceptions import RateLimitError

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Custom rate limiting middleware."""
    
    def __init__(self, app, calls: int = 10, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Process request with rate limiting."""
        client_ip = get_remote_address(request)
        current_time = time.time()
        
        # Clean old entries
        cutoff_time = current_time - self.period
        if client_ip in self.clients:
            self.clients[client_ip] = [
                timestamp for timestamp in self.clients[client_ip]
                if timestamp > cutoff_time
            ]
        else:
            self.clients[client_ip] = []
        
        # Check rate limit
        if len(self.clients[client_ip]) >= self.calls:
            log_error(
                RateLimitError("Rate limit exceeded"),
                context={"client_ip": client_ip, "calls": len(self.clients[client_ip])}
            )
            return Response(
                content='{"error": "RATE_LIMIT_EXCEEDED", "message": "Too many requests"}',
                status_code=429,
                media_type="application/json"
            )
        
        # Add current request timestamp
        self.clients[client_ip].append(current_time)
        
        # Process request
        response = await call_next(request)
        
        # Add rate limit headers
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(
            max(0, self.calls - len(self.clients[client_ip]))
        )
        response.headers["X-RateLimit-Reset"] = str(int(cutoff_time + self.period))
        
        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware for logging HTTP requests and responses."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Log request and response details."""
        start_time = time.time()
        
        # Log request
        logger = get_logger("api")
        logger.info(
            f"Request started: {request.method} {request.url.path}",
            extra={
                "method": request.method,
                "path": request.url.path,
                "query_params": str(request.query_params),
                "client_ip": get_remote_address(request)
            }
        )
        
        try:
            response = await call_next(request)
            duration = time.time() - start_time
            
            # Log successful response
            log_request(
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration=duration
            )
            
            return response
            
        except Exception as e:
            duration = time.time() - start_time
            
            # Log error
            logger.error(
                f"Request failed: {str(e)}",
                extra={
                    "method": request.method,
                    "path": request.url.path,
                    "duration": duration,
                    "error_type": type(e).__name__
                }
            )
            
            raise


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware for adding security headers."""
    
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """Add security headers to response."""
        response = await call_next(request)
        
        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Remove server info
        if "Server" in response.headers:
            del response.headers["Server"]
        
        return response


def setup_middleware(app):
    """Setup all middleware for the application."""
    # Add custom middleware (order matters)
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(
        RateLimitMiddleware,
        calls=settings.rate_limit_requests,
        period=settings.rate_limit_window
    )
    app.add_middleware(LoggingMiddleware)
    
    # Setup slowapi rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
