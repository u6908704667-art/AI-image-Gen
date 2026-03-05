import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
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
# Using httpx for direct API calls to the new Hugging Face router

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

        model = IMG_MODEL if request.mode == "img" and request.imageUrl else TEXT_MODEL

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://router.huggingface.co/hf-inference/models/{model}",
                headers={
                    "Authorization": f"Bearer {HF_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={"inputs": request.prompt},
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
    uvicorn.run(app, host="0.0.0.0", port=8002)
