# 🔒 Security Fix: OpenRouter API Key

## What Was Fixed

1. **Removed hardcoded API key** from `src/pages/Index.tsx` (line 170)
2. **Created secure API proxy** at `api/openrouter.ts` that keeps the API key server-side
3. **Updated frontend** to call the API route instead of OpenRouter directly
4. **Added @vercel/node** package for Vercel serverless functions

## What You Need to Do

### Step 1: Install Dependencies

```bash
npm install
```

This will install `@vercel/node` which is required for the API route.

### Step 2: Get Your New OpenRouter API Key

1. Go to [OpenRouter Keys](https://openrouter.ai/keys)
2. Create a new API key (or use an existing one)
3. Copy the key (it starts with `sk-or-v1-...`)

### Step 3: Set Environment Variable in Vercel

**IMPORTANT:** The API key must be set in Vercel's environment variables, NOT in your code.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`co-create-ai-umber` or similar)
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter:
   - **Name:** `OPENROUTER_API_KEY`
   - **Value:** Your new OpenRouter API key
   - **Environment:** Select all (Production, Preview, Development)
6. Click **Save**

### Step 4: Redeploy Your Application

After adding the environment variable, you need to redeploy:

1. **Option A:** Push to GitHub (if auto-deploy is enabled)
   ```bash
   git add .
   git commit -m "Security fix: Move OpenRouter API key to server-side"
   git push
   ```

2. **Option B:** Manual redeploy in Vercel
   - Go to Vercel Dashboard → Deployments
   - Click on the latest deployment
   - Click **Redeploy**

### Step 5: Verify It Works

1. Visit your deployed app on Vercel
2. Try using the chat feature
3. The network error should be gone!

## Local Development

For local development with API routes:

```bash
# Install Vercel CLI globally
npm install -g vercel

# Run dev server with API routes
vercel dev
```

You'll be prompted to set `OPENROUTER_API_KEY` during setup.

## Security Notes

✅ **API key is now secure** - stored only in Vercel environment variables
✅ **No API key in code** - removed from all source files
✅ **Server-side proxy** - API calls go through your Vercel function
✅ **Safe to commit** - you can now push to GitHub without exposing keys

## Troubleshooting

### Still getting network errors?

1. **Check environment variable:**
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Verify `OPENROUTER_API_KEY` is set correctly
   - Make sure it's enabled for Production environment

2. **Redeploy after adding variable:**
   - Environment variables only take effect after redeployment

3. **Check API key validity:**
   - Verify your OpenRouter key is active
   - Check if you have credits in your OpenRouter account

4. **Check browser console:**
   - Open DevTools (F12) → Console tab
   - Look for error messages
   - The error should now say "Server configuration error" if the key is missing

### API route not working locally?

- Make sure you're using `vercel dev` (not `npm run dev`)
- The API route only works with Vercel CLI in local development

## Files Changed

- ✅ `src/pages/Index.tsx` - Removed hardcoded key, updated to use API route
- ✅ `api/openrouter.ts` - New serverless function (secure proxy)
- ✅ `package.json` - Added @vercel/node dependency
- ✅ `.env.example` - Added placeholder for reference
- ✅ `SETUP.md` - Updated with Vercel environment variable instructions

