"""
Master System Prompt and Mode-Specific Templates for ThinkBetter AI

This module contains the core AI behavior logic including:
- Master system prompt with personality and guidelines
- Mode-specific prompt templates
- Structured output formats
- Clarification question logic
"""

from typing import Dict, List, Optional, Any
from ..core.logging import get_logger

logger = get_logger(__name__)


class MasterSystemPrompt:
    """Master system prompt that defines AI personality and behavior."""
    
    SYSTEM_PROMPT = """You are Claude, an advanced AI assistant designed to help users generate, refine, and enhance ideas with exceptional intelligence and insight. Your purpose is to provide thoughtful, nuanced, and actionable responses that help users think more deeply about their projects and challenges.

**Your Core Principles:**
1. **Intelligent Analysis**: Always provide deep, thoughtful insights that go beyond surface-level suggestions
2. **Strategic Thinking**: Consider multiple angles, implications, and strategic opportunities
3. **Practical Wisdom**: Ground creative ideas in realistic, actionable advice
4. **Conversational Excellence**: Communicate with clarity, warmth, and intellectual sophistication
5. **Structured Clarity**: Organize thoughts with logical flow and clear hierarchy

**Your Communication Style:**
- Analytical yet approachable
- Nuanced and sophisticated
- Clear yet comprehensive
- Encouraging and insightful
- Context-aware and adaptive
- Balanced between creativity and practicality

**Quality Standards:**
- Ask clarifying questions that reveal deeper needs
- Provide specific, concrete examples with reasoning
- Consider multiple perspectives and implications
- Suggest strategic next steps and follow-up actions
- Balance innovative thinking with practical implementation
- Use sophisticated vocabulary while remaining accessible

**Output Format Guidelines:**
- Use clear headings and logical sections
- Employ well-structured bullet points with proper hierarchy
- Italicize key concepts for emphasis
- Include strategic insights and implications
- Provide actionable recommendations with rationale
- Add thoughtful questions to guide further thinking

You excel at transforming vague ideas into sophisticated, strategic plans, generating nuanced insights, and helping users think more deeply about their challenges and opportunities."""

    @classmethod
    def get_system_prompt(cls) -> str:
        """Get the master system prompt."""
        return cls.SYSTEM_PROMPT


class ModePrompts:
    """Mode-specific prompt templates and behavior logic."""
    
    # IDEA MODE Template
    IDEA_TEMPLATE = """**IDEA GENERATION MODE**

**User Input:** {input}

**Request:** Generate a sophisticated and strategic analysis of the user's idea, providing deep insights and actionable recommendations.

**Required Output Structure:**

## 🎯 **Refined Concept**
*Provide a clear, compelling articulation of the core concept with strategic positioning*

## 💡 **Key Differentiators**
*Identify 3-4 unique aspects that create competitive advantage and market positioning*

## 👥 **Strategic Analysis**
*Analyze the idea through multiple lenses: market viability, technical feasibility, and user value proposition*

## 🎨 **Implementation Considerations**
*Outline critical success factors, potential challenges, and strategic approaches*

## � **Growth Opportunities**
*Identify scalable pathways, expansion possibilities, and long-term potential*

## � **Risk Assessment**
*Provide thoughtful analysis of potential obstacles and mitigation strategies*

## � **Strategic Next Steps**
*Offer a prioritized roadmap with specific, actionable milestones*

## 🤔 **Guiding Questions**
*Pose thoughtful questions that encourage deeper strategic thinking*

**Additional Context:**
{options}

**Guidelines:**
- Provide analytical depth with strategic thinking
- Consider both immediate and long-term implications
- Balance innovation with practical implementation
- Include specific, actionable recommendations
- Use sophisticated business and strategic terminology
- Structure for clarity and professional presentation"""

    # SCRIPT MODE Template
    SCRIPT_TEMPLATE = """**SCRIPT GENERATION MODE**

**User Input:** {input}

**Request:** Create a compelling and well-structured script that effectively communicates the intended message with professional polish.

**Required Output Structure:**

## 🎬 **Opening Hook**
*Craft an engaging opening that immediately captures attention and establishes context*

## 📝 **Main Content**
*Develop the core message with clear structure, logical flow, and compelling narrative*

## 🎯 **Key Messages**
*Extract and highlight 3-4 essential points or takeaways for maximum impact*

## 🏁 **Strategic Conclusion**
*Provide a memorable closing that reinforces the main message and calls to action*

## 🎭 **Delivery Notes**
*Include guidance on tone, pacing, emphasis, and presentation style*

## 🎨 **Production Considerations**
*Note any visual elements, transitions, or technical requirements*

## 🤔 **Clarifying Questions**
*If the input is vague, inquire about audience, format, or objectives*

## 📋 **Next Steps**
*Suggest development, rehearsal, or implementation strategies*

**Additional Context:**
{options}

**Guidelines:**
- Match tone precisely to intended audience and context
- Create natural, authentic dialogue that flows smoothly
- Include clear transitions and logical progression
- Balance informativeness with engagement
- Consider practical production and delivery constraints
- Structure for memorability and impact"""

    # BRAINSTORM MODE Template
    BRAINSTORM_TEMPLATE = """**BRAINSTORM MODE**

**User Input:** {input}

**Request:** Generate diverse and innovative ideas with thoughtful analysis, exploring multiple creative pathways and strategic possibilities.

**Required Output Structure:**

## 🧠 **Cognitive Framework**
*Establish multiple thinking lenses and analytical approaches to explore the topic comprehensively*

## 🔄 **Diverse Perspectives**
*Explore 4-6 distinct angles: technological, human-centered, business, and innovative viewpoints*

## 💭 **Creative Solutions**
*Propose 5-7 innovative approaches that challenge conventional thinking and offer fresh possibilities*

## 🎯 **Strategic Opportunities**
*Identify high-potential pathways with actionable implementation strategies*

## 🔧 **Practical Enhancements**
*Suggest 3-4 realistic improvements to existing approaches or concepts*

## ⚡ **Emerging Trends**
*Connect ideas to current market trends and future developments*

## 🌟 **Breakthrough Concepts**
*Present 1-2 truly innovative ideas that could redefine the space*

{focus_areas_section}

## 🤔 **Guiding Questions**
*Pose thought-provoking questions that stimulate deeper creative exploration*

## 📋 **Strategic Next Steps**
*Provide prioritized actions for idea validation and development*

**Additional Context:**
{options}

**Guidelines:**
- Think systematically and comprehensively
- Balance creativity with strategic analysis
- Consider both immediate and long-term implications
- Connect ideas to practical implementation
- Use sophisticated creative and business terminology
- Challenge assumptions while providing constructive alternatives
- Structure for clarity and professional presentation"""

    # PROMPT ENHANCER MODE Template
    PROMPT_TEMPLATE = """**PROMPT ENHANCER MODE**

**User Input:** {input}

**Request:** Transform the user's prompt into a highly effective, sophisticated version with strategic optimization and multiple contextual variations.

**Required Output Structure:**

## ✨ **Enhanced Master Prompt**
*Craft a comprehensive, well-structured prompt that incorporates best practices and advanced techniques*

## 🔀 **Contextual Variations**
*Develop 3-4 specialized versions for different use cases, audiences, or objectives*

## 🎯 **Optimization Strategies**
*Explain specific techniques for improving prompt effectiveness and AI response quality*

## 💡 **Advanced Techniques**
*Introduce sophisticated prompting methods: chain-of-thought, few-shot examples, or structured formats*

## 🎨 **Implementation Guidelines**
*Provide detailed instructions on how to use these prompts effectively*

## 🤖 **Model Recommendations**
*Suggest optimal AI models and parameters for different prompt types*

## 📊 **Expected Outputs**
*Describe the kind of results, quality, and depth to anticipate from these prompts*

## 🤔 **Refinement Questions**
*Ask about specific use cases, constraints, or success criteria*

## 📋 **Strategic Next Steps**
*Recommend testing methodologies and iterative improvement approaches*

**Additional Context:**
{options}

**Guidelines:**
- Design prompts with clarity, specificity, and strategic structure
- Include relevant context, constraints, and desired output formats
- Consider different AI models and their capabilities
- Provide actionable guidance for prompt optimization
- Use sophisticated prompting terminology and techniques
- Structure for professional presentation and easy implementation"""

    @classmethod
    def get_template(cls, mode: str) -> str:
        """Get the prompt template for a specific mode."""
        templates = {
            "idea": cls.IDEA_TEMPLATE,
            "script": cls.SCRIPT_TEMPLATE,
            "brainstorm": cls.BRAINSTORM_TEMPLATE,
            "prompt": cls.PROMPT_TEMPLATE
        }
        return templates.get(mode, cls.IDEA_TEMPLATE)


class PromptBuilder:
    """Advanced prompt builder with template system and clarification logic."""
    
    def __init__(self):
        self.master_prompt = MasterSystemPrompt()
        self.mode_prompts = ModePrompts()
    
    def build_prompt(
        self,
        mode: str,
        input_text: str,
        **options
    ) -> str:
        """
        Build a comprehensive prompt for AI generation.
        
        Args:
            mode: Generation mode (idea, script, brainstorm, prompt)
            input_text: User's input text
            **options: Mode-specific options
            
        Returns:
            Complete prompt string ready for AI
        """
        try:
            # Get the mode-specific template
            template = self.mode_prompts.get_template(mode)
            
            # Prepare options context
            options_context = self._format_options(mode, **options)
            
            # Handle special template sections
            if mode == "brainstorm":
                focus_areas = options.get("focus_areas", [])
                focus_section = self._format_focus_areas(focus_areas)
                template = template.replace("{focus_areas_section}", focus_section)
            else:
                template = template.replace("{focus_areas_section}", "")
            
            # Build the complete prompt
            complete_prompt = f"""{self.master_prompt.get_system_prompt()}

{template.format(
    input=input_text,
    options=options_context
)}"""
            
            logger.info(f"Built prompt for mode: {mode}, input length: {len(input_text)}")
            return complete_prompt
            
        except Exception as e:
            logger.error(f"Failed to build prompt: {e}")
            # Fallback to simple prompt
            return f"{self.master_prompt.get_system_prompt()}\n\nPlease help with: {input_text}"
    
    def _format_options(self, mode: str, **options) -> str:
        """Format mode-specific options into readable context."""
        if not options:
            return "No specific options provided."
        
        context_lines = []
        
        if mode == "idea":
            if "category" in options:
                context_lines.append(f"Category: {options['category']}")
            if "tone" in options:
                context_lines.append(f"Tone: {options['tone']}")
                
        elif mode == "script":
            if "script_type" in options:
                context_lines.append(f"Script Type: {options['script_type']}")
            if "characters" in options and options["characters"]:
                context_lines.append(f"Characters: {', '.join(options['characters'])}")
                
        elif mode == "brainstorm":
            if "quantity" in options:
                context_lines.append(f"Idea Quantity: {options['quantity']}")
            if "focus_areas" in options and options["focus_areas"]:
                context_lines.append(f"Focus Areas: {', '.join(options['focus_areas'])}")
                
        elif mode == "prompt":
            if "target_model" in options:
                context_lines.append(f"Target Model: {options['target_model']}")
            if "enhancement_type" in options:
                context_lines.append(f"Enhancement Type: {options['enhancement_type']}")
        
        # Add common options
        if "max_tokens" in options:
            context_lines.append(f"Max Tokens: {options['max_tokens']}")
        if "temperature" in options:
            context_lines.append(f"Temperature: {options['temperature']}")
        
        return "\n".join(context_lines) if context_lines else "No specific options provided."
    
    def _format_focus_areas(self, focus_areas: List[str]) -> str:
        """Format focus areas for brainstorm mode."""
        if not focus_areas:
            return "No specific focus areas defined - explore all angles."
        
        areas_text = "\n".join([f"• {area}" for area in focus_areas])
        return f"**Specific Areas to Explore:**\n{areas_text}"
    
    def needs_clarification(self, input_text: str, mode: str) -> tuple[bool, List[str]]:
        """
        Determine if input needs clarification and suggest intelligent questions.
        
        Args:
            input_text: User's input text
            mode: Generation mode
            
        Returns:
            Tuple of (needs_clarification, suggested_questions)
        """
        if not input_text or len(input_text.strip()) < 8:
            return True, ["Could you provide more context about your request? I'd like to understand your objectives and constraints better."]
        
        # Sophisticated analysis of input quality
        word_count = len(input_text.strip().split())
        has_specifics = any(keyword in input_text.lower() for keyword in [
            'specifically', 'exactly', 'precisely', 'particular', 'detailed',
            'because', 'since', 'due to', 'according to', 'based on'
        ])
        has_questions = '?' in input_text or '?' in input_text.split()[-1]
        
        # Mode-specific clarification logic
        if mode == "idea":
            vague_indicators = [
                'idea', 'have an idea', 'thinking about', 'concept', 'maybe',
                'considering', 'something like', 'kind of', 'sort of',
                'help me', 'want to create', 'looking for', 'need help'
            ]
            if (any(indicator in input_text.lower() for indicator in vague_indicators) and 
                not has_specifics and word_count < 15):
                return True, [
                    "What specific problem or opportunity are you addressing?",
                    "Who is your target audience or market segment?",
                    "What makes your approach unique or different from existing solutions?",
                    "What are your immediate goals or success criteria?"
                ]
        
        elif mode == "script":
            vague_indicators = [
                'script', 'need a script', 'write something', 'presentation',
                'talk about', 'discuss', 'cover', 'content', 'material'
            ]
            if (any(indicator in input_text.lower() for indicator in vague_indicators) and 
                not has_specifics and word_count < 20):
                return True, [
                    "What is the specific format or medium you need (video, podcast, presentation)?",
                    "Who is your target audience and what do you want them to feel or think?",
                    "What is the primary message or call to action?",
                    "What tone or style would be most effective for your purpose?"
                ]
        
        elif mode == "brainstorm":
            vague_indicators = [
                'brainstorm', 'ideas', 'think about', 'explore', 'generate',
                'come up with', 'creative', 'innovation', 'solutions'
            ]
            if (any(indicator in input_text.lower() for indicator in vague_indicators) and 
                not has_specifics and word_count < 25):
                return True, [
                    "What specific domain or industry would you like to focus on?",
                    "Are there any constraints, boundaries, or requirements we should consider?",
                    "What is the ultimate goal or outcome you're hoping to achieve?",
                    "Who are the key stakeholders or perspectives we should include?"
                ]
        
        elif mode == "prompt":
            vague_indicators = [
                'prompt', 'improve', 'enhance', 'better', 'optimize',
                'ai prompt', 'chatgpt', 'llm prompt'
            ]
            if (any(indicator in input_text.lower() for indicator in vague_indicators) and 
                not has_specifics and word_count < 30):
                return True, [
                    "What specific task or use case will this prompt serve?",
                    "What AI model or type of response are you targeting?",
                    "What context, constraints, or guidelines should be included?",
                    "Who is the intended audience for these AI-generated responses?"
                ]
        
        return False, []
    
    def get_clarification_prompt(self, input_text: str, mode: str, questions: List[str]) -> str:
        """Generate a clarification prompt for vague inputs."""
        questions_text = "\n".join([f"{i+1}. {q}" for i, q in enumerate(questions)])
        
        return f"""{self.master_prompt.get_system_prompt()}

**CLARIFICATION NEEDED**

I notice your input for {mode.upper()} mode could benefit from more details. To provide you with the best possible response, could you please clarify:

{questions_text}

**Your Original Input:**
{input_text}

Please provide more context so I can generate a more tailored and helpful response!"""
    
    def get_supported_modes(self) -> List[str]:
        """Get list of supported generation modes."""
        return ["idea", "script", "brainstorm", "prompt"]
    
    def get_mode_requirements(self, mode: str) -> Dict[str, Any]:
        """Get requirements and guidelines for a specific mode."""
        requirements = {
            "idea": {
                "min_input_length": 10,
                "recommended_length": 50,
                "key_elements": ["problem", "audience", "goal"],
                "output_sections": ["Refined Idea", "Core Features", "Unique Twist", "Target Users", "Monetization", "MVP Plan"]
            },
            "script": {
                "min_input_length": 15,
                "recommended_length": 100,
                "key_elements": ["topic", "audience", "format"],
                "output_sections": ["Hook", "Script", "Key Points", "Ending"]
            },
            "brainstorm": {
                "min_input_length": 10,
                "recommended_length": 30,
                "key_elements": ["topic", "constraints", "goals"],
                "output_sections": ["Different Perspectives", "Creative Solutions", "Practical Improvements", "Unexpected Ideas"]
            },
            "prompt": {
                "min_input_length": 20,
                "recommended_length": 50,
                "key_elements": ["original_prompt", "use_case", "context"],
                "output_sections": ["Improved Prompt", "Variations", "Usage Tips"]
            }
        }
        return requirements.get(mode, requirements["idea"])


# Global prompt builder instance
prompt_builder = PromptBuilder()
