# Deployment Guide: Vercel + Separate Backend

This project uses a monorepo structure with a **Next.js frontend** on Vercel and a **Python FastAPI backend** deployed separately.

## Architecture

```
Frontend: Next.js (Vercel)
   ↓ (API calls)
Backend: Python FastAPI (Render/Railway/Heroku)
   ↓ (Hugging Face API calls)
External AI Models (Hugging Face, FAL-AI, etc.)
```

## Step 1: Deploy Backend Separately

Choose one of these platforms (free tier available):

### Option A: Render (Recommended for Python)
1. Go to [render.com](https://render.com)
2. Create account and connect GitHub repo
3. Click "New +"  → "Web Service"
4. Select your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python main.py` or `uvicorn main:app --host 0.0.0.0 --port 10000`
6. Add Environment Variables:
   - `HUGGINGFACE_API_TOKEN`: Your HF token
   - `FAL_API_KEY`: Your FAL-AI key (if used)
   - `BYTEZ_KEY`: Your Bytez key (if used)
7. Deploy! You'll get a URL like: `https://your-app.onrender.com`

### Option B: Railway
1. Go to [railway.app](https://railway.app)
2. Create project → Deploy from GitHub
3. Select repo, Railway auto-detects Python
4. Add environment variables (same as above)
5. Your backend URL: `https://your-app.railway.app`

### Option C: Heroku (Legacy - uses credits)
1. Heroku requires payment now, not recommended

## Step 2: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..."  → "Project"
3. Select your GitHub repository
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `/` (monorepo root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Add Environment Variables:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-app.onrender.com
   HUGGINGFACE_API_TOKEN=your_token
   NEXT_PUBLIC_MODEL_TEXT=stabilityai/stable-diffusion-xl-base-1.0
   NEXT_PUBLIC_MODEL_IMG=stabilityai/stable-diffusion-2-1
   ```
6. Click "Deploy"

## Step 3: Verify Connection

After both are deployed:
1. Open your Vercel URL (e.g., `https://your-app.vercel.app`)
2. Try generating an image
3. Check console (F12) for any errors
4. If backend 404 errors, verify `NEXT_PUBLIC_BACKEND_URL` is correct

## Local Development

```bash
# Terminal 1: Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python main.py  # Runs on http://localhost:8000

# Terminal 2: Frontend
npm install
npm run dev  # Runs on http://localhost:3000
```

Frontend automatically uses `http://localhost:8000` (see `.env.example`).

## Troubleshooting

### Backend 502 errors in Vercel logs
- Check backend is running and accessible
- Verify `NEXT_PUBLIC_BACKEND_URL` env var is set
- Check backend CORS allows Vercel domain

### Update backend CORS (in `backend/main.py`)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-app.vercel.app",  # Add this
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Image generation slow
- Cold start on backend (render spins down)
- Add paid tier for always-on backend

### Backend keeps stopping
- Render free tier has 15-min inactivity timeout
- Upgrade to Starter tier (~$7/mo) or use Railway

## Alternative: Both on Vercel (Advanced)

If you want both on Vercel, you could:
- Use Vercel Edge Functions with Python (limited)
- Deploy backend to AWS Lambda with proxy
- Convert Python → Node.js (significant rewrite)

For now, **separate deployment is recommended** for simplicity.

## Monitor & Logs

- **Vercel logs**: Dashboard → your project → Deployments → Logs
- **Render logs**: Dashboard → your service → Logs
- **Railway logs**: Dashboard → your project → Deployments → View Logs

## Auto-Redeploy on Push

- Vercel: Auto-deploys on `main` branch push
- Render: Auto-deploys on branch push (configurable)

Done! Your full-stack app is now live! 🚀
