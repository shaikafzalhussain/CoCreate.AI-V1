# 🚀 How to Run CoCreate.AI Locally

## Quick Start

### Option 1: Using npm (Recommended)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file (see below for values)
cp .env.example .env

# 3. Start development server
npm run dev
```

### Option 2: Using bun (if you have bun installed)

```bash
# 1. Install dependencies
bun install

# 2. Create .env file
cp .env.example .env

# 3. Start development server
bun run dev
```

## Environment Variables Setup

### Local Development

You need to create a `.env` file in the root directory with your Supabase credentials:

1. **Get Supabase URL and Key:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

2. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and add your values:
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   
   # Optional: For local development with npm run dev
   # Add your OpenRouter API key here (only for local testing)
   VITE_OPENROUTER_API_KEY=sk-or-v1-your-key-here
   ```

3. **For Local Development:**

   **Option A: Using npm run dev (Recommended for quick testing)**
   - Add `VITE_OPENROUTER_API_KEY` to your `.env` file (see above)
   - Run: `npm run dev`
   - The app will use OpenRouter API directly in development mode
   - ⚠️ **Note:** This exposes the API key in the browser (only for local dev)

   **Option B: Using Vercel CLI (Recommended for testing API routes)**
   - Install Vercel CLI:
     ```bash
     npm install -g vercel
     ```
   - Run the dev server with Vercel:
     ```bash
     vercel dev
     ```
   - This will allow the API routes (`/api/openrouter`) to work locally
   - You'll be prompted to set `OPENROUTER_API_KEY` during setup
   - ✅ **Note:** This keeps the API key secure (server-side)

### Vercel Deployment (Production)

**IMPORTANT:** The OpenRouter API key must be set in Vercel's environment variables, NOT in your code or `.env` file.

1. **Set OpenRouter API Key in Vercel:**
   - Go to your [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project
   - Go to **Settings** → **Environment Variables**
   - Add a new variable:
     - **Name:** `OPENROUTER_API_KEY`
     - **Value:** Your OpenRouter API key (starts with `sk-or-v1-...`)
     - **Environment:** Production, Preview, Development (select all)
   - Click **Save**

2. **Get Your OpenRouter API Key:**
   - Go to [OpenRouter Keys](https://openrouter.ai/keys)
   - Create a new key or use an existing one
   - Copy the key (it starts with `sk-or-v1-...`)

3. **Redeploy Your Application:**
   - After adding the environment variable, redeploy your app:
     - Push to GitHub (if auto-deploy is enabled), OR
     - Go to Vercel Dashboard → Deployments → Redeploy

### Deploy Supabase Edge Function (Optional)

- The Gemini API key is already configured in `supabase/functions/ai-cocreate/index.ts`
- Deploy the function to Supabase:
  ```bash
  # Install Supabase CLI if you haven't
  npm install -g supabase
  
  # Login to Supabase
  supabase login
  
  # Link your project
  supabase link --project-ref your-project-ref
  
  # Deploy the function
  supabase functions deploy ai-cocreate
  ```

## Access the Application

Once the dev server is running, open your browser and go to:

**http://localhost:8081** (or the port shown in your terminal)

The application will automatically reload when you make changes.

**Note:** If you're using `vercel dev` for local development, it will use a different port (usually 3000).

## Troubleshooting

### Port already in use?
If port 5173 is busy, Vite will automatically use the next available port (5174, 5175, etc.)

### Supabase connection issues?
- Make sure your `.env` file has the correct values
- Verify your Supabase project is active
- Check that the Edge Function is deployed

### API errors?
- **For OpenRouter API:** Make sure `OPENROUTER_API_KEY` is set in Vercel environment variables
- **For local development:** Use `vercel dev` to run API routes locally
- **Network errors on Vercel:** Check that the environment variable is set correctly and redeploy
- Check the browser console for error messages
- Verify your OpenRouter API key is valid and has credits

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.



