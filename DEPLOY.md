# Deployment Guide

## Architecture

| Service          | Platform       | Cost                        |
| ---------------- | -------------- | --------------------------- |
| Frontend         | Vercel         | Free                        |
| Backend (Laravel)| Render         | Free (750 hrs/mo)           |
| Python Scorer    | Hugging Face   | Free (always on)            |
| Database (MySQL) | Railway        | Free ($5 credit, ~$1-2/mo)  |
| Email (SendGrid) | SendGrid       | Free (100 emails/day)       |

---

## Step 1: Deploy Python Scorer to Hugging Face Spaces

1. Create a new Space at [huggingface.co/new-space](https://huggingface.co/new-space)
   - Name: `resume-scorer`
   - SDK: **Docker**
   - Visibility: Public (free)

2. Push the `python-scorer/` folder:
   ```bash
   cd python-scorer
   git init
   git remote add origin https://YOUR_USERNAME:HF_TOKEN@huggingface.co/YOUR_USERNAME/resume-scorer
   git add .
   git commit -m "Deploy scorer"
   git push -u origin main
   ```

3. Note your URL: `https://YOUR_USERNAME-resume-scorer.hf.space`

---

## Step 2: Deploy Database to Railway

1. Create a [Railway](https://railway.app) account
2. Create a new project → Add MySQL
3. Go to MySQL → **Networking** → **Public Networking** → Enable
4. Copy the public connection details:
   - Host: `mysql.railway.proxy.rlwy.net`
   - Port: (the port shown)
   - Database: `railway`
   - User: `root`
   - Password: (from Variables tab)

---

## Step 3: Deploy Laravel Backend to Render

1. Push code to GitHub (the main `resume-screening` repo)

2. Create a [Render](https://render.com) account → New Web Service
   - Connect your GitHub repo
   - **Root Directory**: `resume-screening-api`
   - Environment: **Docker**
   - Instance Type: **Free**

3. Add Environment Variables:

   | Key                  | Value                                               |
   | -------------------- | --------------------------------------------------- |
   | `APP_KEY`            | base64:... (generate with `php artisan key:generate`) |
   | `APP_ENV`            | production                                          |
   | `APP_DEBUG`          | false                                               |
   | `APP_URL`            | https://your-api.onrender.com                       |
   | `DB_HOST`            | mysql.railway.proxy.rlwy.net                        |
   | `DB_PORT`            | (from Railway)                                      |
   | `DB_DATABASE`        | railway                                             |
   | `DB_USERNAME`        | root                                                |
   | `DB_PASSWORD`        | (from Railway)                                      |
   | `MAIL_MAILER`        | sendgrid                                            |
   | `SENDGRID_API_KEY`   | SG.xxxxxxxxxxxxxxxxxxxx                             |
   | `MAIL_FROM_ADDRESS`  | your-verified-email@example.com                     |
   | `MAIL_FROM_NAME`     | "Resume Screening Tool"                             |
   | `GEMINI_API_KEY`     | (optional - for AI insights)                        |
   | `PYTHON_SCORER_URL`  | https://your-username-resume-scorer.hf.space        |
   | `RUN_DB_SEED`        | true (first deploy only, then set to false)         |

4. Deploy and wait ~5-10 minutes

---

## Step 4: Set Up SendGrid (Email)

SendGrid works on Render's free tier because it uses an API (not SMTP ports).

1. Create a [SendGrid](https://sendgrid.com) account (free - 100 emails/day)
2. **Verify a Single Sender**:
   - Go to Settings → Sender Authentication → Single Sender Verification
   - Add your email and verify it
3. **Create an API Key**:
   - Go to Settings → API Keys → Create API Key
   - Give it "Full Access" or "Mail Send" permission
   - Copy the key (starts with `SG.`)
4. **Add to Render env vars**:
   - `MAIL_MAILER=sendgrid`
   - `SENDGRID_API_KEY=SG.your_key_here`
   - `MAIL_FROM_ADDRESS=your-verified-email@example.com`
   - `MAIL_FROM_NAME="Resume Screening Tool"`

> **Note:** `MAIL_FROM_NAME` must be in quotes if it contains spaces.

---

## Step 5: Deploy Frontend to Vercel

1. Create a [Vercel](https://vercel.com) account → New Project
   - Import your GitHub repo
   - **Root Directory**: `resume-screening-frontend`

2. Add Environment Variable:

   | Key                  | Value                          |
   | -------------------- | ------------------------------ |
   | `VITE_API_BASE_URL`  | https://your-api.onrender.com  |

3. Deploy

---

## First Deploy Checklist

- [ ] Python Scorer running on HF Spaces (check `/health`)
- [ ] MySQL running on Railway with public networking enabled
- [ ] Backend deployed on Render with all env vars
- [ ] `RUN_DB_SEED=true` on first deploy, then change to `false`
- [ ] SendGrid API key set in Render env vars
- [ ] SendGrid single sender verified
- [ ] Frontend deployed on Vercel
- [ ] Update `FRONTEND_URL` in Render to match Vercel URL
- [ ] Update `VITE_API_BASE_URL` in Vercel to match Render URL
- [ ] Test login with demo credentials

---

## Free Tier Limits

| Service      | Limit                                    |
| ------------ | ---------------------------------------- |
| Vercel       | 100GB bandwidth/mo                       |
| Render       | 750 hours/mo (sleeps after 15 min idle)  |
| HF Spaces    | Unlimited (always on)                    |
| Railway      | $5 credit/mo (~$1-2 for MySQL)           |
| SendGrid     | 100 emails/day                           |

---

## Troubleshooting

| Problem | Solution |
| ------- | -------- |
| Backend sleeps on first request | Render free tier sleeps after 15 min inactivity. First request takes ~30s to wake up. |
| DB connection fails | Check Railway public networking is enabled and credentials are correct. |
| Python scorer returns 503 | Check HF Space is running. Visit the Space page to see build logs. |
| Emails not sending | Verify SendGrid single sender is confirmed and `SENDGRID_API_KEY` is set in Render. |
| CORS errors | Set `FRONTEND_URL` in Render to match your Vercel URL exactly. |
| Duplicate seed data | Set `RUN_DB_SEED=false` after first deploy. |
