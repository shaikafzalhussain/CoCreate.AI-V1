# 🚀 Vercel Deployment Guide

## Framework Preset Selection

When deploying to Vercel, choose:

**Framework Preset: `Vite`** (or `Other` if Vite isn't listed)

Vercel should auto-detect Vite, but if you need to choose manually:
- Select **"Vite"** from the dropdown
- Or select **"Other"** and configure manually

## Step-by-Step Deployment

### Step 1: Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select the repository you just uploaded

### Step 2: Configure Project

**Framework Preset:**
- Choose **"Vite"** (should auto-detect)
- Or choose **"Other"** if Vite isn't available

**Build Settings:**
- **Build Command:** `npm run build` (should auto-fill)
- **Output Directory:** `dist` (should auto-fill)
- **Install Command:** `npm install` (should auto-fill)

**Root Directory:**
- Leave as default (root of repo)

### Step 3: Environment Variables

**CRITICAL:** Add these environment variables before deploying:

1. Click **"Environment Variables"** section
2. Add the following variables:

#### Required Variables:

**1. OpenRouter API Key:**
- **Name:** `OPENROUTER_API_KEY`
- **Value:** `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`
- **Environment:** Production, Preview, Development (select all)

**2. Supabase URL:**
- **Name:** `VITE_SUPABASE_URL`
- **Value:** `https://tzfjcrmduvllymmhfxda.supabase.co`
- **Environment:** Production, Preview, Development (select all)

**3. Supabase Publishable Key:**
- **Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`
- **Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6Zmpjcm1kdXZsbHltbWhmeGRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1NjE4ODIsImV4cCI6MjA3ODEzNzg4Mn0.Q-RzWdXTT8PwVdFE4KHYQNrEdNiBVMgMulQgYWSpyJA`
- **Environment:** Production, Preview, Development (select all)

**4. Supabase Project ID (if needed):**
- **Name:** `VITE_SUPABASE_PROJECT_ID`
- **Value:** `tzfjcrmduvllymmhfxda`
- **Environment:** Production, Preview, Development (select all)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for deployment to complete (usually 1-2 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## Important Notes

### Environment Variables

- ✅ **`OPENROUTER_API_KEY`** - Server-side only (for API route)
- ✅ **`VITE_SUPABASE_URL`** - Client-side (Vite prefix)
- ✅ **`VITE_SUPABASE_PUBLISHABLE_KEY`** - Client-side (Vite prefix)
- ✅ **`VITE_SUPABASE_PROJECT_ID`** - Client-side (Vite prefix)

### API Routes

- The `/api/openrouter` route will work automatically
- Vercel will detect the `api/` folder and deploy it as serverless functions
- The API route uses `OPENROUTER_API_KEY` (server-side only)

### Build Output

- Vite builds to `dist/` directory
- Vercel will serve the static files from `dist/`
- API routes in `api/` are deployed as serverless functions

## Troubleshooting

### Build Fails?

1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in `package.json`
3. Verify Node.js version (Vercel auto-detects)

### API Route Not Working?

1. Check that `OPENROUTER_API_KEY` is set correctly
2. Check Vercel Function logs (Dashboard → Functions → `/api/openrouter`)
3. Verify the API route file exists at `api/openrouter.ts`

### Environment Variables Not Working?

1. Make sure variables are set for the correct environment (Production/Preview/Development)
2. Redeploy after adding environment variables
3. Check variable names are correct (case-sensitive)

## Quick Checklist

- [ ] Framework Preset: **Vite** (or Other)
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Environment Variables added:
  - [ ] `OPENROUTER_API_KEY`
  - [ ] `VITE_SUPABASE_URL`
  - [ ] `VITE_SUPABASE_PUBLISHABLE_KEY`
  - [ ] `VITE_SUPABASE_PROJECT_ID` (if needed)
- [ ] All variables enabled for Production, Preview, Development
- [ ] Clicked **Deploy**

## After Deployment

1. Test your app at the Vercel URL
2. Check that API routes work (`/api/openrouter`)
3. Verify environment variables are loaded
4. Check Vercel Function logs if there are issues

