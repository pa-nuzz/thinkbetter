from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from ..services.generation_service import generation_service
from ..core.exceptions import ValidationError, AIServiceError
from ..core.handlers import ErrorHandler
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/generate", tags=["generation"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/")
@limiter.limit("10/minute")
async def generate_content(request: Request, payload: dict):
    """
    Central endpoint for AI content generation.
    
    Accepts:
    {
        "input": "User input text",
        "mode": "idea|script|brainstorm|prompt",
        "provider": "optional provider name",
        "model": "optional model name",
        "options": {
            "mode_specific_options": "values"
        }
    }
    """
    try:
        # Extract required fields
        input_text = payload.get("input", "").strip()
        mode = payload.get("mode", "")
        provider = payload.get("provider")
        model = payload.get("model")
        options = payload.get("options", {})
        
        # Generate response
        result = await generation_service.generate_response(
            input_text=input_text,
            mode=mode,
            provider=provider,
            model=model,
            **options
        )
        
        return result
        
    except ValidationError as e:
        logger.error(f"Validation error in generation: {e}")
        return ErrorHandler.create_error_response(
            status_code=422,
            message=e.message,
            error_code=e.error_code,
            details=e.details
        )
    except AIServiceError as e:
        logger.error(f"AI service error in generation: {e}")
        return ErrorHandler.create_error_response(
            status_code=503,
            message="AI service temporarily unavailable",
            error_code=e.error_code,
            details=e.details
        )
    except Exception as e:
        logger.error(f"Unexpected error in generation: {e}")
        return ErrorHandler.create_error_response(
            status_code=500,
            message="Generation failed",
            error_code="GENERATION_ERROR",
            details={"error": str(e)}
        )


@router.post("/fallback")
@limiter.limit("5/minute")
async def generate_with_fallback(request: Request, payload: dict):
    """
    Generate content with automatic fallback between providers.
    
    Accepts:
    {
        "input": "User input text",
        "mode": "idea|script|brainstorm|prompt",
        "preferred_providers": ["groq", "deepseek", "openrouter"],
        "options": {
            "mode_specific_options": "values"
        }
    }
    """
    try:
        # Extract required fields
        input_text = payload.get("input", "").strip()
        mode = payload.get("mode", "")
        preferred_providers = payload.get("preferred_providers")
        options = payload.get("options", {})
        
        # Generate with fallback
        result = await generation_service.generate_with_fallback(
            input_text=input_text,
            mode=mode,
            preferred_providers=preferred_providers,
            **options
        )
        
        return result
        
    except ValidationError as e:
        logger.error(f"Validation error in fallback generation: {e}")
        return ErrorHandler.create_error_response(
            status_code=422,
            message=e.message,
            error_code=e.error_code,
            details=e.details
        )
    except AIServiceError as e:
        logger.error(f"AI service error in fallback generation: {e}")
        return ErrorHandler.create_error_response(
            status_code=503,
            message="All AI providers failed",
            error_code=e.error_code,
            details=e.details
        )
    except Exception as e:
        logger.error(f"Unexpected error in fallback generation: {e}")
        return ErrorHandler.create_error_response(
            status_code=500,
            message="Fallback generation failed",
            error_code="FALLBACK_ERROR",
            details={"error": str(e)}
        )


@router.get("/modes")
@limiter.limit("60/minute")
async def get_supported_modes(request: Request):
    """Get list of supported generation modes and their options."""
    try:
        modes = generation_service.get_supported_modes()
        mode_options = {}
        
        for mode in modes:
            mode_options[mode] = generation_service.get_mode_options(mode)
        
        return {
            "modes": modes,
            "options": mode_options,
            "default_provider": generation_service.get_provider_info().get("available", ["groq"])[0] if generation_service.get_provider_info().get("available") else None
        }
        
    except Exception as e:
        logger.error(f"Failed to get modes: {e}")
        return ErrorHandler.create_error_response(
            status_code=500,
            message="Failed to retrieve modes",
            error_code="MODES_ERROR"
        )


@router.post("/clarify")
@limiter.limit("20/minute")
async def get_clarification_questions(request: Request, payload: dict):
    """
    Get clarification questions for vague inputs.
    
    Accepts:
    {
        "input": "User input text",
        "mode": "idea|script|brainstorm|prompt"
    }
    """
    try:
        input_text = payload.get("input", "").strip()
        mode = payload.get("mode", "")
        
        # Check if clarification is needed
        needs_clarification, questions = generation_service.prompt_builder.needs_clarification(input_text, mode)
        
        if needs_clarification:
            clarification_prompt = generation_service.prompt_builder.get_clarification_prompt(input_text, mode, questions)
            return {
                "needs_clarification": True,
                "questions": questions,
                "clarification_prompt": clarification_prompt,
                "suggestions": questions
            }
        else:
            return {
                "needs_clarification": False,
                "message": "Input is clear enough for generation",
                "suggestions": []
            }
        
    except Exception as e:
        logger.error(f"Failed to get clarification: {e}")
        return ErrorHandler.create_error_response(
            status_code=500,
            message="Failed to analyze input",
            error_code="CLARIFICATION_ERROR"
        )


@router.post("/idea")
@limiter.limit("10/minute")
async def generate_idea(request: Request, payload: dict):
    """Generate ideas with specific parameters."""
    try:
        input_text = payload.get("input", "").strip()
        category = payload.get("category")
        tone = payload.get("tone", "neutral")
        provider = payload.get("provider")
        model = payload.get("model")
        
        result = await generation_service.generate_response(
            input_text=input_text,
            mode="idea",
            provider=provider,
            model=model,
            category=category,
            tone=tone
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Idea generation failed: {e}")
        raise HTTPException(status_code=500, detail="Idea generation failed")


@router.post("/script")
@limiter.limit("10/minute")
async def generate_script(request: Request, payload: dict):
    """Generate scripts with specific parameters."""
    try:
        input_text = payload.get("input", "").strip()
        script_type = payload.get("script_type", "general")
        characters = payload.get("characters", [])
        provider = payload.get("provider")
        model = payload.get("model")
        
        result = await generation_service.generate_response(
            input_text=input_text,
            mode="script",
            provider=provider,
            model=model,
            script_type=script_type,
            characters=characters
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Script generation failed: {e}")
        raise HTTPException(status_code=500, detail="Script generation failed")


@router.post("/brainstorm")
@limiter.limit("10/minute")
async def brainstorm_ideas(request: Request, payload: dict):
    """Generate brainstorming ideas."""
    try:
        input_text = payload.get("input", "").strip()
        focus_areas = payload.get("focus_areas", [])
        quantity = payload.get("quantity", 5)
        provider = payload.get("provider")
        model = payload.get("model")
        
        result = await generation_service.generate_response(
            input_text=input_text,
            mode="brainstorm",
            provider=provider,
            model=model,
            focus_areas=focus_areas,
            quantity=quantity
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Brainstorm generation failed: {e}")
        raise HTTPException(status_code=500, detail="Brainstorm generation failed")


@router.post("/prompt")
@limiter.limit("10/minute")
async def enhance_prompt(request: Request, payload: dict):
    """Enhance user prompts."""
    try:
        input_text = payload.get("input", "").strip()
        target_model = payload.get("target_model", "gpt-4")
        enhancement_type = payload.get("enhancement_type", "comprehensive")
        provider = payload.get("provider")
        model = payload.get("model")
        
        result = await generation_service.generate_response(
            input_text=input_text,
            mode="prompt",
            provider=provider,
            model=model,
            target_model=target_model,
            enhancement_type=enhancement_type
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Prompt enhancement failed: {e}")
        raise HTTPException(status_code=500, detail="Prompt enhancement failed")
