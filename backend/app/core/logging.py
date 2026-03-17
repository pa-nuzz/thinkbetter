import logging
import sys
from typing import Any, Dict
from pythonjsonlogger import jsonlogger
from .config import settings


def setup_logging() -> None:
    """Setup application logging with structured JSON format."""
    
    # Create logger
    logger = logging.getLogger()
    logger.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Remove existing handlers
    logger.handlers.clear()
    
    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.log_level.upper()))
    
    # Create formatter
    if settings.log_format.lower() == "json":
        formatter = jsonlogger.JsonFormatter(
            '%(asctime)s %(name)s %(levelname)s %(message)s'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name."""
    return logging.getLogger(name)


class StructuredLogger:
    """Structured logger for consistent log formatting."""
    
    def __init__(self, name: str):
        self.logger = get_logger(name)
    
    def info(self, message: str, **kwargs: Any) -> None:
        """Log info message with optional structured data."""
        if kwargs:
            self.logger.info(message, extra={"extra": kwargs})
        else:
            self.logger.info(message)
    
    def error(self, message: str, **kwargs: Any) -> None:
        """Log error message with optional structured data."""
        if kwargs:
            self.logger.error(message, extra={"extra": kwargs})
        else:
            self.logger.error(message)
    
    def warning(self, message: str, **kwargs: Any) -> None:
        """Log warning message with optional structured data."""
        if kwargs:
            self.logger.warning(message, extra={"extra": kwargs})
        else:
            self.logger.warning(message)
    
    def debug(self, message: str, **kwargs: Any) -> None:
        """Log debug message with optional structured data."""
        if kwargs:
            self.logger.debug(message, extra={"extra": kwargs})
        else:
            self.logger.debug(message)


def log_request(method: str, path: str, status_code: int, duration: float) -> None:
    """Log HTTP request details."""
    logger = get_logger("api")
    logger.info(
        "HTTP Request",
        extra={
            "method": method,
            "path": path,
            "status_code": status_code,
            "duration_ms": duration * 1000
        }
    )


def log_error(error: Exception, context: Dict[str, Any] = None) -> None:
    """Log error with context."""
    logger = get_logger("error")
    logger.error(
        f"Error: {str(error)}",
        extra={
            "error_type": type(error).__name__,
            "context": context or {}
        }
    )
