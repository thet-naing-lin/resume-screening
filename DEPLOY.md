# Deployment Guide

This guide walks you through deploying the Resume Screening Tool for **free** using:

| Service | Platform | What |
|---------|----------|------|
| Frontend | **Vercel** | React SPA |
| Backend API | **Render** | Laravel (PHP) |
| Python Scorer | **Hugging Face Spaces** | Flask NLP microservice |
| Database | **Railway** | MySQL |

---

## Prerequisites

- GitHub account
- Vercel account (sign up with GitHub)
- Render account (sign up with GitHub)
- Hugging Face account (sign up at huggingface.co)
- Railway account (sign up at railway.app)
- Google Cloud project (for Gemini API key and optional Google OAuth)

---

## Step 1: Railway — MySQL Database

1. Go to [railway.app](https://railway.app) and create an account
2. Click **New Project** → **Provision MySQL**
3. Once created, click on the MySQL service → **Variables** tab
4. Copy the connection details — you'll need:
   - `MYSQL_HOST`
   - `MYSQL_DATABASE`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_PORT` (usually 3306)
5. Railway databases are publicly accessible by default — no IP allowlist needed

> **Free tier:** $5 credit/month. MySQL typically costs ~$1-2/month. Credit also covers bandwidth and storage.

---

## Step 2: Hugging Face Spaces — Python Scorer

1. Go to [huggingface.co](https://huggingface.co) and create an account
2. Click your profile → **New Space**
3. Configure:
   - Name: `resume-scorer`
   - License: MIT
   - SDK: **Docker**
   - Visibility: Public (or Private, both are free)
4. Clone the Space repo locally:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/resume-scorer
   ```
5. Copy these files into the cloned repo:
   ```bash
   cp python-scorer/Dockerfile resume-scorer/
   cp python-scorer/app.py resume-scorer/
   cp python-scorer/requirements.txt resume-scorer/
   ```
6. Push to Hugging Face:
   ```bash
   cd resume-scorer
   git add .
   git commit -m "Initial deployment"
   git push
   ```
7. Wait for the Space to build (~5-10 min, first build downloads PyTorch)
8. Your scorer URL will be: `https://YOUR_USERNAME-resume-scorer.hf.space`

> **Free tier:** Unlimited, always-on, 16GB RAM, 2 vCPU.

**Test it:**
```bash
curl https://YOUR_USERNAME-resume-scorer.hf.space/health
# Should return: {"status":"ok","model":"all-MiniLM-L6-v2","model_loaded":true}
```

---

## Step 3: Render — Laravel Backend API

1. Go to [render.com](https://render.com) and create an account
2. Click **New** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - Name: `resume-screening-api`
   - Region: choose closest to you
   - Branch: `main`
   - Root Directory: `resume-screening-api`
   - Runtime: **Docker**
   - Instance Type: **Free**
5. Add these **Environment Variables** in the Render dashboard:

   ```
   APP_NAME=Resume Screening Tool
   APP_ENV=production
   APP_KEY=          # Generate with: php artisan key:generate --show
   APP_DEBUG=false
   APP_URL=https://resume-screening-api-xxxx.onrender.com

   DB_CONNECTION=mysql
   DB_HOST=<MYSQL_HOST from Railway>
   DB_PORT=3306
   DB_DATABASE=<MYSQL_DATABASE from Railway>
   DB_USERNAME=<MYSQL_USER from Railway>
   DB_PASSWORD=<MYSQL_PASSWORD from Railway>

   SESSION_DRIVER=database
   CACHE_STORE=file
   QUEUE_CONNECTION=database

   PYTHON_SCORER_URL=https://YOUR_USERNAME-resume-scorer.hf.space

   GEMINI_API_KEY=<your-gemini-api-key>
   GEMINI_API_URL=https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent

   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=<your-gmail>
   MAIL_PASSWORD=<your-gmail-app-password>
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=<your-gmail>
   MAIL_FROM_NAME=Resume Screening Tool

   FRONTEND_URL=https://your-app.vercel.app
   SANCTUM_STATEFUL_DOMAINS=your-app.vercel.app
   SESSION_DOMAIN=.onrender.com

   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

   GOOGLE_CLIENT_ID=<optional>
   GOOGLE_CLIENT_SECRET=<optional>
   GOOGLE_REDIRECT_URI=https://resume-screening-api-xxxx.onrender.com/auth/google/callback

   RUN_DB_SEED=true    # Set to true for first deploy only, then false
   ```

6. Click **Create Web Service**
7. Wait for build and deploy (~5-10 min)
8. Your API URL will be: `https://resume-screening-api-xxxx.onrender.com`

> **Free tier:** 750 hours/month, spins down after 15 min of inactivity.

**⚠️ Keep-alive (optional but recommended):**
Sign up at [UptimeRobot](https://uptimerobot.com) (free) and add a monitor:
- URL: `https://resume-screening-api-xxxx.onrender.com/api/health` (or just `/`)
- Interval: 10 minutes
- This prevents the free tier from spinning down

**Test it:**
```bash
curl https://resume-screening-api-xxxx.onrender.com/api/health
# or
curl https://resume-screening-api-xxxx.onrender.com/
```

---

## Step 4: Vercel — Frontend

1. Go to [vercel.com](https://vercel.com) and create an account
2. Click **Add New** → **Project**
3. Import your GitHub repo
4. Configure:
   - Framework Preset: **Vite**
   - Root Directory: `resume-screening-frontend`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
5. Add these **Environment Variables** in the Vercel dashboard:

   ```
   VITE_API_URL=https://resume-screening-api-xxxx.onrender.com/api
   VITE_GOOGLE_AUTH_URL=https://resume-screening-api-xxxx.onrender.com/auth/google/redirect
   ```

6. Click **Deploy**
7. Your frontend URL will be: `https://your-project.vercel.app`

> **Free tier:** 100 GB bandwidth, unlimited projects, automatic HTTPS.

---

## Step 5: Post-Deployment

### Update Laravel APP_URL
After Render gives you your URL, update the `APP_URL` env var in Render dashboard to match.

### Google OAuth (Optional)
If using Google OAuth, update your Google Cloud Console:
1. Go to **APIs & Services** → **Credentials**
2. Edit your OAuth 2.0 Client
3. Add **Authorized redirect URIs**:
   - `https://resume-screening-api-xxxx.onrender.com/auth/google/callback`
4. Update `GOOGLE_REDIRECT_URI` in Render env vars

### Gmail App Password
If using Gmail for sending emails:
1. Go to [myaccount.google.com](https://myaccount.google.com) → **Security**
2. Enable **2-Step Verification** (if not already)
3. Go to **App passwords** → generate one for "Mail"
4. Use this 16-character password as `MAIL_PASSWORD` in Render

### First Deploy Seed
On your first deploy, set `RUN_DB_SEED=true` in Render env vars. After the first successful deploy, change it to `false` to avoid re-seeding on every restart.

---

## Architecture Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────────────┐
│   Vercel          │──────▶│   Render              │──────▶│   Hugging Face Spaces     │
│   (React SPA)     │       │   (Laravel PHP)       │       │   (Python Scorer)         │
│                   │       │                       │       │                           │
│  VITE_API_URL ────┼───┐   │  ┌─────────────┐      │       │  ┌─────────────────┐      │
│                   │   │   │  │ Queue Worker │      │       │  │ TF-IDF Scoring  │      │
└──────────────────┘   │   │  │ (background) │      │       │  │ Semantic Scoring│      │
                       │   │  └─────────────┘      │       │  └─────────────────┘      │
                       │   │                       │       │                           │
                       │   │  ┌─────────────┐      │       └──────────────────────────┘
                       │   │  │ Gemini API  │      │
                       │   │  │ (AI insights)│      │
                       │   │  └─────────────┘      │
                       │   │                       │
                       │   │  ┌─────────────┐      │
                       └───┼──│ MySQL       │      │
                           │  │ (Railway)   │      │
                           │  └─────────────┘      │
                           │                       │
                           │  ┌─────────────┐      │
                           │  │ Gmail SMTP  │      │
                           │  │ (emails)    │      │
                           │  └─────────────┘      │
                           └──────────────────────┘
```

---

## Troubleshooting

### "502 Bad Gateway" on Render
- Check Render logs → likely a PHP error or missing env var
- Make sure `APP_KEY` is set (generate with `php artisan key:generate --show`)
- Make sure Railway MySQL is running and accessible (check Railway dashboard)

### "Connection refused" from backend to Python scorer
- Verify the HF Space is running (check the Space page)
- Make sure `PYTHON_SCORER_URL` in Render matches your Space URL exactly
- Test the scorer directly: `curl https://YOUR_SPACE_URL/health`

### CORS errors in browser
- Make sure `CORS_ALLOWED_ORIGINS` in Render includes your Vercel URL
- No trailing slash on URLs
- Multiple origins separated by commas: `https://app1.vercel.app,https://app2.vercel.app`

### "Table doesn't exist" errors
- Make sure `RUN_DB_SEED=true` is set for the first deploy
- Check Render logs for migration output

### Emails not sending
- Use a Gmail **App Password**, not your regular password
- Make sure 2-Step Verification is enabled on your Google account
- Check `MAIL_MAILER=smtp` is set (not `log` or `array`)

### Free tier spin-down on Render
- Set up UptimeRobot to ping every 10 minutes
- First request after spin-down takes ~30 seconds — this is normal

---

## Updating After Deploy

Push to your `main` branch:
- **Vercel**: auto-deploys on push
- **Render**: auto-deploys on push (if connected to GitHub)
- **Hugging Face**: push to the Space repo to trigger rebuild

---

## Costs

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | 100 GB bandwidth | $20/mo Pro |
| Render | 750 hrs/month | $7/mo (always-on) |
| Hugging Face Spaces | Unlimited | $0 |
| Railway | $5 credit/month | Usage-based |

**Total: $0/month** (Railway's $5 credit covers MySQL at ~$1-2/mo).
