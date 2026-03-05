"""
Prompt templates and constraints for character-accurate rendering
"""

SEINEN_STYLE_CONSTRAINT = """
🎨 VISUAL STANDARD - SEINEN ANIME (COMPULSORY):
- 1990s gritty cyberpunk tone (Ghost in the Shell 1995 reference)
- Akira (1988) environmental weight and detail
- Wicked City (1987) shadow contrast and darkness
- Hard lighting with defined shadows
- Subtle skin texture and micro-details
- Controlled reflections (NOT glossy/plastic)
- Dark atmospheric depth
- Cinematic color grading (blue/teal dominant)
- NO modern hyper-shiny generic AI anime look
- NO Shōnen exaggeration or softness
- Professional, serious, composed character expression
- Grainy film-like texture
- High contrast noir photography influence
"""

CHARACTER_CONSTRAINTS = {
    "strict_mode": """
🔒 CHARACTER LOCK - NON-NEGOTIABLE REQUIREMENTS:
ALL renders MUST:
✓ Match EXACT facial likeness and proportions
✓ Match EXACT body composition and posture
✓ Match EXACT clothing/suit detailing
✓ Match EXACT accessory placement and behavior
✓ Preserve signature hair color and texture
✓ Maintain eye color exactly
✓ Maintain freckle placement and marks
✓ Maintain serious/composed expression
✓ Keep original character essence (NO reinterpretation)

FORBIDDEN:
✗ No stylization drift or artistic interpretation
✗ No soft anime smoothing or modern smoothness
✗ No Shōnen exaggeration or cuteness
✗ No glossy over-rendering
✗ No body reshaping or proportion changes
✗ No expression softening

If ANY of the above deviates → Render = FAIL
""",
    
    "relaxed_mode": """
Character-inspired generation with artistic freedom.
Maintain core character identity while allowing style variation.
"""
}

def build_character_prompt(user_prompt: str, character_name: str = None, strict_mode: bool = True) -> str:
    """
    Build a complete prompt with character and style constraints
    
    Args:
        user_prompt: The user's description
        character_name: Optional character name for context
        strict_mode: If True, apply strict character constraints
    
    Returns:
        Complete prompt with constraints
    """
    constraints = CHARACTER_CONSTRAINTS["strict_mode"] if strict_mode else CHARACTER_CONSTRAINTS["relaxed_mode"]
    
    prompt_parts = [
        SEINEN_STYLE_CONSTRAINT,
        constraints,
        f"\n📝 SCENE DESCRIPTION:\n{user_prompt}"
    ]
    
    if character_name:
        prompt_parts.insert(0, f"🎭 CHARACTER: {character_name}\n")
    
    return "\n".join(prompt_parts)


def build_style_prompt(user_prompt: str, style: str = "seinen") -> str:
    """
    Build a prompt with specific style constraints
    
    Args:
        user_prompt: The user's description
        style: Style type (seinen, cyberpunk, noir, etc.)
    
    Returns:
        Complete prompt with style constraints
    """
    style_constraints = {
        "seinen": SEINEN_STYLE_CONSTRAINT,
        "cyberpunk": """
🎨 CYBERPUNK AESTHETIC:
- Neon colors against dark backgrounds
- High-tech, metallic surfaces
- Urban decay mixed with advanced technology
- Moody, atmospheric lighting
- Blade Runner / Ghost in the Shell influence
- Holographic elements and light trails
""",
        "noir": """
🎨 NOIR AESTHETIC:
- High contrast black and white with selective color
- Classic detective/crime atmosphere
- Hard shadows and dramatic lighting
- Cigarette smoke and rain effects
- 1940s-1950s visual language
- Shadow play and silhouettes
""",
        "cyberpunk_noir": """
🎨 CYBERPUNK NOIR FUSION:
- Neon lights cutting through darkness
- Rain-slicked streets with holographic ads
- High contrast despite bright neons
- Blade Runner (1982) meets Ghost in the Shell
- Gritty, lived-in future world
- Dramatic shadows with color accents
"""
    }
    
    chosen_constraint = style_constraints.get(style, SEINEN_STYLE_CONSTRAINT)
    
    return f"{chosen_constraint}\n\n📝 SCENE:\n{user_prompt}"


# Example usage
if __name__ == "__main__":
    user_desc = "Standing in a downtown street at night, rain falling, neon signs reflecting off wet pavement"
    
    # Character-strict mode
    strict_prompt = build_character_prompt(user_desc, character_name="Bulma", strict_mode=True)
    print("STRICT MODE PROMPT:")
    print(strict_prompt)
    print("\n" + "="*80 + "\n")
    
    # Character-relaxed mode
    relaxed_prompt = build_character_prompt(user_desc, character_name="Bulma", strict_mode=False)
    print("RELAXED MODE PROMPT:")
    print(relaxed_prompt)
    print("\n" + "="*80 + "\n")
    
    # Style-based prompt
    style_prompt = build_style_prompt(user_desc, style="cyberpunk_noir")
    print("CYBERPUNK NOIR STYLE PROMPT:")
    print(style_prompt)
