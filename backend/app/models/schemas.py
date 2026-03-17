from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, validator
from datetime import datetime


# Base response models
class BaseResponse(BaseModel):
    """Base response model with common fields."""
    success: bool = True
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ErrorResponse(BaseResponse):
    """Error response model."""
    success: bool = False
    error_code: str
    details: Optional[Dict[str, Any]] = None


# Request models
class GenerateRequest(BaseModel):
    """Request model for content generation."""
    mode: Literal["idea", "script", "brainstorm", "prompt"] = Field(
        ...,
        description="Generation mode"
    )
    input: str = Field(
        ...,
        min_length=1,
        max_length=5000,
        description="Input text for generation"
    )
    options: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Additional options for generation"
    )

    @validator('input')
    def validate_input(cls, v):
        if not v or not v.strip():
            raise ValueError("Input cannot be empty")
        return v.strip()


class IdeaGenerateRequest(GenerateRequest):
    """Specific request for idea generation."""
    mode: Literal["idea"] = "idea"
    category: Optional[str] = Field(
        default=None,
        description="Category for idea generation"
    )
    tone: Optional[str] = Field(
        default="neutral",
        description="Tone for the generated idea"
    )


class ScriptGenerateRequest(GenerateRequest):
    """Specific request for script generation."""
    mode: Literal["script"] = "script"
    script_type: Optional[str] = Field(
        default="general",
        description="Type of script to generate"
    )
    characters: Optional[List[str]] = Field(
        default=None,
        description="List of characters in the script"
    )


class BrainstormRequest(GenerateRequest):
    """Specific request for brainstorming."""
    mode: Literal["brainstorm"] = "brainstorm"
    focus_areas: Optional[List[str]] = Field(
        default=None,
        description="Areas to focus on during brainstorming"
    )
    quantity: Optional[int] = Field(
        default=5,
        ge=1,
        le=20,
        description="Number of ideas to generate"
    )


class PromptEnhanceRequest(GenerateRequest):
    """Specific request for prompt enhancement."""
    mode: Literal["prompt"] = "prompt"
    target_model: Optional[str] = Field(
        default="gpt-4",
        description="Target AI model for the enhanced prompt"
    )
    enhancement_type: Optional[str] = Field(
        default="comprehensive",
        description="Type of enhancement to apply"
    )


# Response models
class GenerateResponse(BaseResponse):
    """Response model for content generation."""
    mode: str
    input: str
    output: str
    tokens_used: Optional[int] = None
    generation_time: Optional[float] = None


class IdeaGenerateResponse(GenerateResponse):
    """Response for idea generation."""
    mode: Literal["idea"]
    category: Optional[str] = None
    tone: Optional[str] = None


class ScriptGenerateResponse(GenerateResponse):
    """Response for script generation."""
    mode: Literal["script"]
    script_type: Optional[str] = None
    characters: Optional[List[str]] = None


class BrainstormResponse(GenerateResponse):
    """Response for brainstorming."""
    mode: Literal["brainstorm"]
    ideas: List[str]
    focus_areas: Optional[List[str]] = None


class PromptEnhanceResponse(GenerateResponse):
    """Response for prompt enhancement."""
    mode: Literal["prompt"]
    original_prompt: str
    enhanced_prompt: str
    improvements: List[str]


# Health check models
class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str
    uptime: float
    services: Dict[str, str]


# Rate limiting models
class RateLimitInfo(BaseModel):
    """Rate limiting information."""
    limit: int
    remaining: int
    reset_time: datetime


# API key validation (internal use)
class APIKeyValidation(BaseModel):
    """Internal API key validation model."""
    key: str
    service: str
    valid: bool
    error: Optional[str] = None
