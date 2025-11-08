# 🔑 Fix: Update Your API Key

## The Problem

You're using the **OLD DISABLED API KEY** in your `.env` file:
```
VITE_OPENROUTER_API_KEY=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
```

This key was disabled by OpenRouter because it was exposed on GitHub. That's why you're getting "User not found" error.

## The Fix

### Step 1: Get a NEW API Key

1. Go to: https://openrouter.ai/keys
2. Click **"Create Key"** or use an existing active key
3. Copy the new key (it starts with `sk-or-v1-...`)

### Step 2: Update Your `.env` File

Open your `.env` file and replace the old key:

```bash
# Replace this line:
VITE_OPENROUTER_API_KEY=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

# With your NEW key:
VITE_OPENROUTER_API_KEY=sk-or-v1-YOUR-NEW-KEY-HERE
```

### Step 3: Restart Dev Server

1. Stop your dev server (Ctrl+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Step 4: Test

Try using the chat feature - it should work now!

## Important Notes

- ✅ Use the **NEW** key from OpenRouter
- ✅ Make sure the key starts with `sk-or-v1-...`
- ✅ Don't commit the `.env` file to GitHub (it's already in `.gitignore`)
- ✅ For production, the key is already set correctly in Vercel environment variables

## Quick Command

If you want to edit the file directly:

```bash
# Open .env file in your editor
nano .env
# or
code .env
```

Then replace the old key with your new one!

