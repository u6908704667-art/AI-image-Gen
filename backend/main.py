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

# Initialize Hugging Face client
HF_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")
# Using httpx for direct API calls to the new Hugging Face router

# Models
TEXT_MODEL = os.getenv("NEXT_PUBLIC_MODEL_TEXT", "stabilityai/stable-diffusion-xl-base-1.0")
IMG_MODEL = os.getenv("NEXT_PUBLIC_MODEL_IMG", "stabilityai/stable-diffusion-2-1")


class GenerateRequest(BaseModel):
    prompt: str
    imageUrl: str = None
    mode: str = "text"  # 'text' or 'img'
    character: str = None  # Character name for strict mode
    style: str = "seinen"  # Visual style (seinen, cyberpunk, noir, cyberpunk_noir)
    strict_mode: bool = False  # Apply strict character constraints
    use_constraints: bool = True  # Apply style and character constraints


@app.post("/api/generate")
async def generate_image(request: GenerateRequest):
    """Generate image using Hugging Face Inference API with optional constraints"""
    try:
        if not HF_TOKEN:
            raise HTTPException(status_code=500, detail="API token not configured")

        model = IMG_MODEL if request.mode == "img" and request.imageUrl else TEXT_MODEL

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

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://router.huggingface.co/hf-inference/models/{model}",
                headers={
                    "Authorization": f"Bearer {HF_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={"inputs": final_prompt},
                timeout=60.0
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"API request failed: {response.text}"
                )

            # The response should be binary image data
            image_data = response.content

            # Convert to base64
            img_base64 = base64.b64encode(image_data).decode("utf-8")

            return JSONResponse(
                content={
                    "image": f"data:image/png;base64,{img_base64}",
                    "prompt_used": final_prompt if not request.use_constraints else "[Constraints Applied]"
                }
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Generation failed: {str(e)}"
        )


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
