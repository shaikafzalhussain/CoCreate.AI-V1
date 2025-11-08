# 🔧 Local Development Fix

## The Problem
When running `npm run dev` with Vite, the API route `/api/openrouter` doesn't exist (404 error) because Vite doesn't serve serverless functions.

## The Solution
I've updated the code to automatically fall back to calling OpenRouter directly in development mode if you set an environment variable.

## Quick Fix Steps

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the root directory:

```bash
# Add your OpenRouter API key for local development
VITE_OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

**Get your key from:** https://openrouter.ai/keys

### Step 2: Restart the dev server

1. Stop the current dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 3: Test

The app should now work locally! The code will:
- Try the API route first
- If it gets a 404, automatically fall back to calling OpenRouter directly
- Use your `VITE_OPENROUTER_API_KEY` from `.env.local`

## How It Works

- **Local Development (`npm run dev`):**
  - Uses `VITE_OPENROUTER_API_KEY` from `.env.local`
  - Calls OpenRouter directly (fallback)
  - ⚠️ API key is visible in browser (only for local dev)

- **Production (Vercel):**
  - Uses `/api/openrouter` serverless function
  - API key is secure (server-side only)
  - Uses `OPENROUTER_API_KEY` from Vercel environment variables

## Important Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **For production:** Always use Vercel environment variables (not `.env.local`)
3. **The API key in `.env.local`** is only for local testing

## Alternative: Use Vercel CLI

If you want to test the API routes locally:

```bash
# Install Vercel CLI
npm install -g vercel

# Run with Vercel (supports API routes)
vercel dev
```

This keeps the API key secure even in local development.

