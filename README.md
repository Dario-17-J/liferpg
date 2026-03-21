# LIFE RPG — Deploy Guide

## Step 1 — Supabase Setup
1. Go to your Supabase project dashboard
2. Click **SQL Editor** → **New Query**
3. Paste contents of `SUPABASE_SETUP.sql` and click **Run**
4. Go to **Authentication → Providers → Google**
5. Enable Google provider
6. Copy the **Callback URL** shown there
7. Go to console.cloud.google.com → Create OAuth credentials
8. Paste the callback URL as authorized redirect URI
9. Copy Client ID + Secret back into Supabase

## Step 2 — Push to GitHub
1. Go to github.com → New Repository
2. Name it `liferpg`, set to Public
3. Run these commands in terminal:

```bash
cd /path/to/liferpg
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/Dario-17-J/liferpg.git
git push -u origin main
```

## Step 3 — Deploy on Vercel
1. Go to vercel.com
2. Click **Add New Project**
3. Import your `liferpg` GitHub repo
4. Click **Deploy** — that's it!
5. You'll get a URL like `liferpg.vercel.app`

## Done!
Share the URL with anyone. Each person logs in with Google and gets their own account + cloud-saved data.
