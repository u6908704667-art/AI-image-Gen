# NovaZone XI - AI Anime Art Generator

Generate stunning anime masterpieces with cutting-edge AI technology. NovaZone XI is your premium solution for creating high-fidelity anime frames with reference-guided synthesis.

## Features

- ✨ Text-to-image generation using Stable Diffusion XL
- 🎨 Image-to-image style transfer and enhancement
- 📐 Multiple aspect ratios and styles
- 🚀 Real-time preview and generation
- 💾 One-click image download
- 🔑 Secure API integration with Hugging Face

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Hugging Face API token

### Installation

```bash
# Clone the repository
git clone https://github.com/u6908704667-art/AI-image-Gen.git
cd AI-image-Gen

# Frontend setup
npm install
npm run dev

# Backend setup (in a new terminal)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

## Usage

1. Open http://localhost:3001 in your browser
2. Describe your anime scene in the text area
3. (Optional) Upload a reference image for style transfer
4. Click "Generate Frame"
5. Download your generated image

## Architecture

- **Frontend**: Next.js 14 + React 18 + Tailwind CSS
- **Backend**: FastAPI + Hugging Face Inference API
- **AI Models**: Stable Diffusion XL for high-quality generation

## Environment Variables

Create `.env.local` in the root directory:

```
HUGGINGFACE_API_TOKEN=your_token_here
NEXT_PUBLIC_MODEL_TEXT=stabilityai/stable-diffusion-xl-base-1.0
NEXT_PUBLIC_MODEL_IMG=stabilityai/stable-diffusion-2-1
```

## License

MIT License - © 2026 NovaZone XI Merchandise

