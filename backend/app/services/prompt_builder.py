from typing import Dict, Any, List, Optional
from ..core.logging import get_logger

logger = get_logger(__name__)


class PromptBuilder:
    """Service for building structured prompts for different AI modes."""
    
    @staticmethod
    def build_idea_prompt(
        input_text: str,
        category: Optional[str] = None,
        tone: str = "neutral"
    ) -> str:
        """Build prompt for idea generation."""
        
        base_prompt = """You are a creative idea generator. Your task is to generate innovative and practical ideas based on the user's input.

Guidelines:
- Generate 3-5 distinct ideas
- Each idea should be concise but detailed enough to be actionable
- Consider feasibility and potential impact
- Format as a numbered list
- Be creative but realistic"""

        category_instruction = ""
        if category:
            category_instruction = f"\nFocus on the {category} category."
        
        tone_instruction = {
            "neutral": "Maintain a balanced, objective tone.",
            "optimistic": "Emphasize positive outcomes and possibilities.",
            "critical": "Consider potential challenges and limitations.",
            "innovative": "Push boundaries and think outside the box.",
            "practical": "Focus on actionable, realistic solutions."
        }.get(tone, "Maintain a balanced, objective tone.")
        
        return f"""{base_prompt}{category_instruction}

Tone: {tone_instruction}

User input: {input_text}

Generate ideas:"""

    @staticmethod
    def build_script_prompt(
        input_text: str,
        script_type: str = "general",
        characters: Optional[List[str]] = None
    ) -> str:
        """Build prompt for script generation."""
        
        type_instructions = {
            "dialogue": "Focus on natural conversation between characters.",
            "scene": "Create a detailed scene description with action and dialogue.",
            "monologue": "Write a compelling monologue expressing deep thoughts or emotions.",
            "interview": "Create an interview format with questions and answers.",
            "narrative": "Write a narrative script with clear storytelling elements."
        }
        
        instruction = type_instructions.get(
            script_type, 
            "Create a general script format appropriate for the content."
        )
        
        characters_text = ""
        if characters:
            characters_text = f"\nCharacters to include: {', '.join(characters)}"
        
        return f"""You are a professional scriptwriter. Your task is to create a script based on the user's input.

Instructions:
- {instruction}
- Use proper script formatting
- Include scene headings where appropriate
- Make dialogue natural and engaging{characters_text}

Topic: {input_text}

Script:"""

    @staticmethod
    def build_brainstorm_prompt(
        input_text: str,
        focus_areas: Optional[List[str]] = None,
        quantity: int = 5
    ) -> str:
        """Build prompt for brainstorming."""
        
        focus_text = ""
        if focus_areas:
            focus_text = f"\nFocus areas: {', '.join(focus_areas)}"
        
        return f"""You are a creative brainstorming facilitator. Your task is to generate diverse ideas and explore multiple perspectives.

Instructions:
- Generate exactly {quantity} distinct ideas or approaches
- Consider different angles and perspectives
- Include both conventional and unconventional ideas
- Organize by themes or categories where relevant
- Use bullet points for clarity{focus_text}

Topic: {input_text}

Brainstorm:"""

    @staticmethod
    def build_prompt_enhancement_prompt(
        input_text: str,
        target_model: str = "gpt-4",
        enhancement_type: str = "comprehensive"
    ) -> str:
        """Build prompt for prompt enhancement."""
        
        enhancement_instructions = {
            "comprehensive": "Add context, constraints, examples, and clear objectives.",
            "concise": "Make the prompt more focused and direct while maintaining clarity.",
            "detailed": "Add specific details, parameters, and comprehensive instructions.",
            "creative": "Enhance with creative elements and open-ended exploration.",
            "technical": "Add technical specifications, constraints, and precise requirements."
        }
        
        instruction = enhancement_instructions.get(
            enhancement_type,
            "Improve clarity, specificity, and effectiveness."
        )
        
        return f"""You are an expert prompt engineer. Your task is to enhance the user's prompt to make it more effective for AI models.

Instructions:
- {instruction}
- Ensure the enhanced prompt is clear and unambiguous
- Add relevant context and constraints
- Make it suitable for {target_model} or similar models
- Explain the improvements made

Original prompt: {input_text}

Enhanced prompt:"""

    @staticmethod
    def build_prompt(
        mode: str,
        input_text: str,
        **kwargs
    ) -> str:
        """Build appropriate prompt based on mode."""
        
        try:
            if mode == "idea":
                return PromptBuilder.build_idea_prompt(
                    input_text,
                    kwargs.get("category"),
                    kwargs.get("tone", "neutral")
                )
            elif mode == "script":
                return PromptBuilder.build_script_prompt(
                    input_text,
                    kwargs.get("script_type", "general"),
                    kwargs.get("characters")
                )
            elif mode == "brainstorm":
                return PromptBuilder.build_brainstorm_prompt(
                    input_text,
                    kwargs.get("focus_areas"),
                    kwargs.get("quantity", 5)
                )
            elif mode == "prompt":
                return PromptBuilder.build_prompt_enhancement_prompt(
                    input_text,
                    kwargs.get("target_model", "gpt-4"),
                    kwargs.get("enhancement_type", "comprehensive")
                )
            else:
                raise ValueError(f"Unsupported mode: {mode}")
                
        except Exception as e:
            logger.error(f"Error building prompt for mode {mode}: {e}")
            raise

    @staticmethod
    def extract_mode_specific_options(
        mode: str,
        options: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Extract mode-specific options from general options."""
        
        mode_mappings = {
            "idea": ["category", "tone"],
            "script": ["script_type", "characters"],
            "brainstorm": ["focus_areas", "quantity"],
            "prompt": ["target_model", "enhancement_type"]
        }
        
        valid_keys = mode_mappings.get(mode, [])
        return {k: v for k, v in options.items() if k in valid_keys}
