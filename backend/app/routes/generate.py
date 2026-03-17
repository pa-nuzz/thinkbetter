from fastapi import APIRouter, HTTPException, Depends
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..models.schemas import (
    GenerateRequest,
    GenerateResponse,
    IdeaGenerateRequest,
    ScriptGenerateRequest,
    BrainstormRequest,
    PromptEnhanceRequest
)
from ..services.ai_service import ai_service
from ..services.prompt_builder import PromptBuilder
from ..core.exceptions import (
    AIServiceError,
    ValidationError,
    handle_ai_service_error,
    handle_validation_error
)
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/generate", tags=["generate"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_content(
    request: GenerateRequest,
    http_request: object = None
) -> GenerateResponse:
    """Generate content based on mode and input."""
    
    try:
        logger.info(f"Generation request: mode={request.mode}, input_length={len(request.input)}")
        
        # Extract mode-specific options
        mode_options = PromptBuilder.extract_mode_specific_options(
            request.mode,
            request.options or {}
        )
        
        # Build appropriate prompt
        prompt = PromptBuilder.build_prompt(
            request.mode,
            request.input,
            **mode_options
        )
        
        # Generate content using AI service
        result = await ai_service.generate(
            prompt=prompt,
            provider="openai",  # Default to OpenAI, can be made configurable
            max_tokens=1000,
            temperature=0.7
        )
        
        response = GenerateResponse(
            mode=request.mode,
            input=request.input,
            output=result["content"],
            tokens_used=result["tokens_used"],
            generation_time=result["generation_time"]
        )
        
        logger.info(
            f"Generation successful: mode={request.mode}, tokens={result['tokens_used']}"
        )
        
        return response
        
    except ValidationError as e:
        logger.error(f"Validation error: {e}")
        raise handle_validation_error(e)
    except AIServiceError as e:
        logger.error(f"AI service error: {e}")
        raise handle_ai_service_error(e)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "INTERNAL_ERROR",
                "message": "An unexpected error occurred"
            }
        )


@router.post("/idea", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_idea(
    request: IdeaGenerateRequest,
    http_request: object = None
) -> GenerateResponse:
    """Generate ideas with specific parameters."""
    
    try:
        logger.info(f"Idea generation request: category={request.category}, tone={request.tone}")
        
        # Build idea-specific prompt
        prompt = PromptBuilder.build_idea_prompt(
            request.input,
            request.category,
            request.tone
        )
        
        # Generate content
        result = await ai_service.generate(
            prompt=prompt,
            provider="openai",
            max_tokens=1000,
            temperature=0.8  # Higher temperature for creativity
        )
        
        response = GenerateResponse(
            mode="idea",
            input=request.input,
            output=result["content"],
            tokens_used=result["tokens_used"],
            generation_time=result["generation_time"]
        )
        
        logger.info(f"Idea generation successful: tokens={result['tokens_used']}")
        return response
        
    except ValidationError as e:
        raise handle_validation_error(e)
    except AIServiceError as e:
        raise handle_ai_service_error(e)
    except Exception as e:
        logger.error(f"Unexpected error in idea generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/script", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def generate_script(
    request: ScriptGenerateRequest,
    http_request: object = None
) -> GenerateResponse:
    """Generate scripts with specific parameters."""
    
    try:
        logger.info(f"Script generation request: type={request.script_type}")
        
        # Build script-specific prompt
        prompt = PromptBuilder.build_script_prompt(
            request.input,
            request.script_type,
            request.characters
        )
        
        # Generate content
        result = await ai_service.generate(
            prompt=prompt,
            provider="openai",
            max_tokens=1500,  # More tokens for scripts
            temperature=0.7
        )
        
        response = GenerateResponse(
            mode="script",
            input=request.input,
            output=result["content"],
            tokens_used=result["tokens_used"],
            generation_time=result["generation_time"]
        )
        
        logger.info(f"Script generation successful: tokens={result['tokens_used']}")
        return response
        
    except ValidationError as e:
        raise handle_validation_error(e)
    except AIServiceError as e:
        raise handle_ai_service_error(e)
    except Exception as e:
        logger.error(f"Unexpected error in script generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/brainstorm", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def brainstorm_ideas(
    request: BrainstormRequest,
    http_request: object = None
) -> GenerateResponse:
    """Generate brainstorming ideas."""
    
    try:
        logger.info(f"Brainstorm request: quantity={request.quantity}")
        
        # Build brainstorm-specific prompt
        prompt = PromptBuilder.build_brainstorm_prompt(
            request.input,
            request.focus_areas,
            request.quantity
        )
        
        # Generate content
        result = await ai_service.generate(
            prompt=prompt,
            provider="openai",
            max_tokens=1200,
            temperature=0.9  # High temperature for creativity
        )
        
        response = GenerateResponse(
            mode="brainstorm",
            input=request.input,
            output=result["content"],
            tokens_used=result["tokens_used"],
            generation_time=result["generation_time"]
        )
        
        logger.info(f"Brainstorm generation successful: tokens={result['tokens_used']}")
        return response
        
    except ValidationError as e:
        raise handle_validation_error(e)
    except AIServiceError as e:
        raise handle_ai_service_error(e)
    except Exception as e:
        logger.error(f"Unexpected error in brainstorm: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.post("/prompt", response_model=GenerateResponse)
@limiter.limit("10/minute")
async def enhance_prompt(
    request: PromptEnhanceRequest,
    http_request: object = None
) -> GenerateResponse:
    """Enhance user prompts."""
    
    try:
        logger.info(f"Prompt enhancement request: target={request.target_model}")
        
        # Build prompt enhancement prompt
        prompt = PromptBuilder.build_prompt_enhancement_prompt(
            request.input,
            request.target_model,
            request.enhancement_type
        )
        
        # Generate content
        result = await ai_service.generate(
            prompt=prompt,
            provider="openai",
            max_tokens=800,
            temperature=0.3  # Lower temperature for precision
        )
        
        response = GenerateResponse(
            mode="prompt",
            input=request.input,
            output=result["content"],
            tokens_used=result["tokens_used"],
            generation_time=result["generation_time"]
        )
        
        logger.info(f"Prompt enhancement successful: tokens={result['tokens_used']}")
        return response
        
    except ValidationError as e:
        raise handle_validation_error(e)
    except AIServiceError as e:
        raise handle_ai_service_error(e)
    except Exception as e:
        logger.error(f"Unexpected error in prompt enhancement: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
