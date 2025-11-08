# 🔧 Vercel Environment Variable Setup Guide

## The Error: "No auth credentials found"

This error means the `OPENROUTER_API_KEY` environment variable is not being read by your Vercel deployment.

## Step-by-Step Fix

### Step 1: Verify Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project (`co-create-ai-umber` or similar)
3. Go to **Settings** → **Environment Variables**
4. Look for `OPENROUTER_API_KEY`
5. **Check these things:**
   - ✅ The name is exactly `OPENROUTER_API_KEY` (case-sensitive, no spaces)
   - ✅ The value starts with `sk-or-v1-...`
   - ✅ It's enabled for **Production** environment (and Preview/Development if needed)
   - ✅ Click **Save** if you made any changes

### Step 2: Verify API Key Format

Your OpenRouter API key should:
- Start with `sk-or-v1-`
- Be about 60+ characters long
- Not have any spaces or line breaks
- Be copied from [OpenRouter Keys](https://openrouter.ai/keys)

**Common mistakes:**
- ❌ Extra spaces before/after the key
- ❌ Missing `sk-or-v1-` prefix
- ❌ Using the old disabled key
- ❌ Copying only part of the key

### Step 3: Redeploy After Adding Variable

**CRITICAL:** Environment variables only take effect after redeployment!

**Option A: Automatic Redeploy (Recommended)**
1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Fix: Update API route error handling"
   git push
   ```
2. Vercel will automatically redeploy

**Option B: Manual Redeploy**
1. Go to Vercel Dashboard → **Deployments**
2. Click on the latest deployment
3. Click **Redeploy** (three dots menu → Redeploy)
4. Wait for deployment to complete

### Step 4: Verify Deployment

1. After redeploy, wait 1-2 minutes
2. Visit your Vercel app URL
3. Try using the chat feature
4. Check browser console (F12) for errors

## Troubleshooting

### Still getting "No auth credentials found"?

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Your Project → **Functions** tab
   - Click on `/api/openrouter`
   - Check the logs for errors
   - Look for "OPENROUTER_API_KEY is not set" message

2. **Verify Variable Name:**
   - Make sure it's exactly `OPENROUTER_API_KEY` (not `OPEN_ROUTER_API_KEY` or `openrouter_api_key`)
   - Environment variable names are case-sensitive

3. **Check Environment Scope:**
   - Make sure the variable is enabled for **Production**
   - If you're testing on a preview deployment, enable it for **Preview** too

4. **Test API Key Directly:**
   - Go to [OpenRouter API Test](https://openrouter.ai/docs)
   - Try making a test request with your key
   - Verify the key is active and has credits

5. **Check for Typos:**
   - Copy the key again from OpenRouter
   - Delete the old variable in Vercel
   - Add it again with the new key
   - Redeploy

### Alternative: Test Locally First

If you want to test locally before deploying:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run locally:
   ```bash
   vercel dev
   ```

3. When prompted, enter your `OPENROUTER_API_KEY`

4. Test at `http://localhost:3000`

## Quick Checklist

- [ ] Environment variable name is exactly `OPENROUTER_API_KEY`
- [ ] API key starts with `sk-or-v1-`
- [ ] Variable is enabled for Production environment
- [ ] Clicked **Save** after adding/editing
- [ ] Redeployed after adding the variable
- [ ] Waited for deployment to complete
- [ ] Checked Vercel function logs for errors

## Still Not Working?

If you've tried everything above:

1. **Delete and Re-add the Variable:**
   - Delete `OPENROUTER_API_KEY` from Vercel
   - Get a fresh key from OpenRouter
   - Add it again in Vercel
   - Redeploy

2. **Check Vercel Function Logs:**
   - Look for specific error messages
   - Share the error with support

3. **Verify API Key is Active:**
   - Go to OpenRouter Dashboard
   - Check if the key is active
   - Check if you have credits

