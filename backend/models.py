"""
AI Model configurations and management
Supports multiple providers: Hugging Face router, FAL-AI, and more
"""

# Model Definitions
MODELS = {
    # Hugging Face Router Models
    "stable-diffusion-xl": {
        "id": "stable-diffusion-xl",
        "name": "Stable Diffusion XL",
        "provider": "hugging_face",
        "model_id": "stabilityai/stable-diffusion-xl-base-1.0",
        "description": "High-quality image generation (slower but very detailed)",
        "speed": "Slow",
        "quality": "Very High",
        "features": ["text-to-image", "high-detail"],
        "best_for": "Professional, detailed artwork"
    },
    
    "stable-diffusion-2": {
        "id": "stable-diffusion-2",
        "name": "Stable Diffusion 2.1",
        "provider": "hugging_face",
        "model_id": "stabilityai/stable-diffusion-2-1",
        "description": "Balanced image generation (good quality and speed)",
        "speed": "Medium",
        "quality": "High",
        "features": ["text-to-image", "image-to-image"],
        "best_for": "General purpose, style transfer"
    },
    
    # FAL-AI Models

    
    # Bytez Models
    "dreamlike-photoreal": {
        "id": "dreamlike-photoreal",
        "name": "Dreamlike Photoreal 2.0 (Bytez)",
        "provider": "bytez",
        "model_id": "dreamlike-art/dreamlike-photoreal-2.0",
        "description": "photorealistic image generation with high quality details",
        "speed": "Fast",
        "quality": "Very High",
        "features": ["text-to-image", "photorealistic"],
        "best_for": "Photorealistic landscapes and detailed scenes"
    },
    
    "camembert-fill-mask": {
        "id": "camembert-fill-mask",
        "name": "CamemBERT Fill Masking (Bytez)",
        "provider": "bytez",
        "model_id": "almanach/camembert-base",
        "description": "Fill-mask language model for text prediction and completion",
        "speed": "Very Fast",
        "quality": "High",
        "features": ["fill-mask", "text-completion", "language-model"],
        "best_for": "Text completion, masked language tasks"
    }
}

# Provider configurations
PROVIDERS = {
    "hugging_face": {
        "name": "Hugging Face",
        "base_url": "https://router.huggingface.co/hf-inference/models",
        "requires_token": True,
        "token_env_var": "HUGGINGFACE_API_TOKEN"
    },

    "bytez": {
        "name": "Bytez",
        "requires_token": True,
        "token_env_var": "BYTEZ_KEY"
    }
}

def get_model_by_id(model_id: str) -> dict:
    """Get model configuration by ID"""
    return MODELS.get(model_id)

def get_models_by_provider(provider: str) -> list:
    """Get all models for a specific provider"""
    return [m for m in MODELS.values() if m.get("provider") == provider]

def get_all_models() -> list:
    """Get all available models"""
    return list(MODELS.values())

def get_available_providers() -> list:
    """Get all provider information"""
    return list(PROVIDERS.values())

def validate_model(model_id: str) -> bool:
    """Check if model exists"""
    return model_id in MODELS

def get_model_info(model_id: str) -> dict:
    """Get detailed model information"""
    model = get_model_by_id(model_id)
    if not model:
        return {"error": "Model not found"}
    
    provider = PROVIDERS.get(model.get("provider"), {})
    return {
        **model,
        "provider_name": provider.get("name"),
        "requires_token": provider.get("requires_token")
    }

# Default models for each provider
DEFAULT_MODELS = {
    "hugging_face": "stable-diffusion-xl",
    "fal_ai": "flux-schnell",
    "bytez": "dreamlike-photoreal"
}

if __name__ == "__main__":
    # Test the module
    print("Available Models:")
    for model in get_all_models():
        print(f"  - {model['name']} ({model['provider']}): {model['description']}")
    
    print("\nModel Info for 'z-image-turbo':")
    print(get_model_info("z-image-turbo"))
