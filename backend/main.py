import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from pydantic import BaseModel
import base64
from io import BytesIO
from dotenv import load_dotenv
from prompts import build_character_prompt, build_style_prompt
from models import get_model_by_id, validate_model, get_all_models

# Load environment variables
load_dotenv()

app = FastAPI()

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API tokens for different providers
HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
FAL_TOKEN = os.getenv("FAL_API_KEY")

# Default model
DEFAULT_MODEL = "stable-diffusion-xl"


class GenerateRequest(BaseModel):
    prompt: str
    imageUrl: str = None
    mode: str = "text"  # 'text' or 'img'
    character: str = None  # Character name for strict mode
    style: str = "seinen"  # Visual style (seinen, cyberpunk, noir, cyberpunk_noir)
    strict_mode: bool = False  # Apply strict character constraints
    use_constraints: bool = True  # Apply style and character constraints
    model: str = None  # Model ID to use (defaults to stable-diffusion-xl)


@app.post("/api/generate")
async def generate_image(request: GenerateRequest):
    """Generate image using selected AI model with optional constraints"""
    try:
        # Determine which model to use
        model_id = request.model or DEFAULT_MODEL
        
        if not validate_model(model_id):
            raise HTTPException(status_code=400, detail=f"Invalid model: {model_id}")
        
        model_config = get_model_by_id(model_id)
        provider = model_config.get("provider")
        
        # Check for required tokens
        if provider == "hugging_face" and not HF_TOKEN:
            raise HTTPException(status_code=500, detail="Hugging Face API token not configured")
        if provider == "fal_ai" and not FAL_TOKEN:
            raise HTTPException(status_code=500, detail="FAL-AI API token not configured (set FAL_API_KEY)")

        # Build the final prompt with constraints
        if request.use_constraints:
            if request.character:
                # Character-locked mode
                final_prompt = build_character_prompt(
                    request.prompt,
                    character_name=request.character,
                    strict_mode=request.strict_mode
                )
            else:
                # Style-based mode
                final_prompt = build_style_prompt(
                    request.prompt,
                    style=request.style
                )
        else:
            # No constraints, use prompt as-is
            final_prompt = request.prompt

        # Route to appropriate provider
        if provider == "hugging_face":
            return await generate_hugging_face(model_config, final_prompt)
        elif provider == "fal_ai":
            return await generate_fal_ai(model_config, final_prompt)
        else:
            raise HTTPException(status_code=500, detail=f"Unknown provider: {provider}")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )


async def generate_hugging_face(model_config: dict, prompt: str):
    """Generate image using Hugging Face API"""
    model_id = model_config.get("model_id")
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://router.huggingface.co/hf-inference/models/{model_id}",
            headers={
                "Authorization": f"Bearer {HF_TOKEN}",
                "Content-Type": "application/json",
            },
            json={"inputs": prompt},
            timeout=60.0
        )

        if response.status_code != 200:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"API request failed: {response.text}"
            )

        # The response should be binary image data
        image_data = response.content
        img_base64 = base64.b64encode(image_data).decode("utf-8")

        return JSONResponse(
            content={
                "image": f"data:image/png;base64,{img_base64}",
                "model_used": model_config.get("name"),
                "provider": "hugging_face"
            }
        )


async def generate_fal_ai(model_config: dict, prompt: str):
    """Generate image using FAL-AI API"""
    from huggingface_hub import InferenceClient
    from io import BytesIO
    from PIL import Image
    
    try:
        # Initialize FAL-AI client
        client = InferenceClient(
            provider="fal-ai",
            api_key=FAL_TOKEN,
        )
        
        # Generate image
        image = client.text_to_image(
            prompt,
            model=model_config.get("model_id"),
        )
        
        # Convert PIL Image to base64
        img_buffer = BytesIO()
        image.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode("utf-8")
        
        return JSONResponse(
            content={
                "image": f"data:image/png;base64,{img_base64}",
                "model_used": model_config.get("name"),
                "provider": "fal_ai"
            }
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"FAL-AI generation failed: {str(e)}"
        )


@app.get("/api/models")
async def list_models():
    """Get all available models and their configurations"""
    return JSONResponse(
        content={
            "models": get_all_models(),
            "default_model": DEFAULT_MODEL
        }
    )


@app.get("/api/models/{model_id}")
async def get_model_details(model_id: str):
    """Get detailed information about a specific model"""
    model = get_model_by_id(model_id)
    if not model:
        raise HTTPException(status_code=404, detail=f"Model not found: {model_id}")
    return JSONResponse(content=model)


@app.post("/api/upload")
async def upload_file(file):
    """Handle file uploads (placeholder for Vercel Blob integration)"""
    try:
        # For now, return a placeholder URL
        return JSONResponse(
            content={"url": f"data:image/png;base64,{file}"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/styles")
async def get_available_styles():
    """Get available visual styles"""
    return JSONResponse(
        content={
            "styles": [
                {
                    "id": "seinen",
                    "name": "Seinen",
                    "description": "1990s gritty cyberpunk (Ghost in the Shell, Akira)",
                    "features": ["Hard lighting", "Subtle texture", "1990s aesthetic"]
                },
                {
                    "id": "cyberpunk",
                    "name": "Cyberpunk",
                    "description": "Neon and dark tech aesthetic",
                    "features": ["Neon colors", "Holographic elements", "High-tech surfaces"]
                },
                {
                    "id": "noir",
                    "name": "Noir",
                    "description": "Classic detective/crime atmosphere",
                    "features": ["High contrast", "Shadows", "Moody lighting"]
                },
                {
                    "id": "cyberpunk_noir",
                    "name": "Cyberpunk Noir",
                    "description": "Fusion of cyberpunk and noir aesthetics",
                    "features": ["Neon + shadows", "Blade Runner influence"]
                }
            ]
        }
    )


@app.post("/api/characters")
async def get_character_info(character_name: str = None):
    """Get character-specific constraints"""
    constraints_info = {
        "available_modes": ["strict" , "relaxed"],
        "current_character": character_name,
        "strict_mode_description": "Character must match EXACT specifications (no deviation)",
        "relaxed_mode_description": "Character-inspired with artistic freedom"
    }
    
    if character_name:
        constraints_info["active_constraints"] = [
            "Exact facial likeness",
            "Exact body composition",
            "Exact clothing detailing",
            "Exact accessory placement",
            "Signature hair color & texture",
            "Eye color preservation",
            "Freckle placement",
            "Serious/composed expression"
        ]
    
    return JSONResponse(content=constraints_info)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)
