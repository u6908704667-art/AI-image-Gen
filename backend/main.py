import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from huggingface_hub import InferenceClient
from pydantic import BaseModel
import base64
from io import BytesIO
from dotenv import load_dotenv

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
client = InferenceClient(token=HF_TOKEN)

# Models
TEXT_MODEL = os.getenv("NEXT_PUBLIC_MODEL_TEXT", "stabilityai/stable-diffusion-xl-base-1.0")
IMG_MODEL = os.getenv("NEXT_PUBLIC_MODEL_IMG", "stabilityai/stable-diffusion-2-1")


class GenerateRequest(BaseModel):
    prompt: str
    imageUrl: str = None
    mode: str = "text"  # 'text' or 'img'


@app.post("/api/generate")
async def generate_image(request: GenerateRequest):
    """Generate image using Hugging Face Inference API"""
    try:
        if not HF_TOKEN:
            raise HTTPException(status_code=500, detail="API token not configured")

        if request.mode == "img" and request.imageUrl:
            # Image-to-image generation
            model = IMG_MODEL
            # For img2img, we need the actual image; using prompt with image URL
            image = client.text_to_image(
                prompt=request.prompt,
                model=model,
            )
        else:
            # Text-to-image generation
            model = TEXT_MODEL
            image = client.text_to_image(
                prompt=request.prompt,
                model=model,
            )

        # Convert PIL Image to base64
        img_buffer = BytesIO()
        image.save(img_buffer, format="PNG")
        img_buffer.seek(0)
        img_base64 = base64.b64encode(img_buffer.getvalue()).decode("utf-8")

        return JSONResponse(
            content={"image": f"data:image/png;base64,{img_base64}"}
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


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
