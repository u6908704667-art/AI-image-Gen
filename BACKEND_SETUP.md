# AI Image Generator - Full Stack Setup

This project uses a **Next.js frontend** with a **Python FastAPI backend**.

## Architecture

- **Frontend**: Next.js + React + Tailwind CSS (Port 3000)
- **Backend**: FastAPI + Hugging Face Inference API (Port 8000)

## Setup & Running

### 1. Frontend Setup (Next.js)
```bash
npm install
npm run dev
```
Runs on http://localhost:3000

### 2. Backend Setup (Python)
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt
python main.py
```
Runs on http://localhost:8000

## Environment Variables

### Frontend (.env.local)
```
HUGGINGFACE_API_TOKEN=your_hf_token
NEXT_PUBLIC_MODEL_TEXT="stabilityai/stable-diffusion-xl-base-1.0"
NEXT_PUBLIC_MODEL_IMG="stabilityai/stable-diffusion-2-1"
```

### Backend (backend/.env)
```
HUGGINGFACE_API_TOKEN=your_hf_token
NEXT_PUBLIC_MODEL_TEXT="stabilityai/stable-diffusion-xl-base-1.0"
NEXT_PUBLIC_MODEL_IMG="stabilityai/stable-diffusion-2-1"
```

## API Endpoints (Python Backend)

- `POST /api/generate` - Generate image from prompt
- `POST /api/upload` - Upload reference image
- `GET /health` - Health check

## Features

- ✅ Text-to-image generation using Stable Diffusion XL
- ✅ Image-to-image generation support
- ✅ CORS enabled for frontend communication
- ✅ Real-time image display
- ✅ Base64 image encoding/decoding

## Test Locally

1. Start backend: `python main.py` (port 8000)
2. Start frontend: `npm run dev` (port 3000)
3. Open http://localhost:3000
4. Enter a prompt and generate!
