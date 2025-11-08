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

You need to create a `.env` file in the root directory with your Supabase credentials:

1. **Get Supabase URL and Key:**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)
   - Go to **Settings** → **API**
   - Copy the **Project URL** and **anon/public key**

2. **Create `.env` file:**
   ```bash
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key-here
   ```

3. **Deploy Supabase Edge Function:**
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

**http://localhost:5173**

The application will automatically reload when you make changes.

## Troubleshooting

### Port already in use?
If port 5173 is busy, Vite will automatically use the next available port (5174, 5175, etc.)

### Supabase connection issues?
- Make sure your `.env` file has the correct values
- Verify your Supabase project is active
- Check that the Edge Function is deployed

### API errors?
- The Gemini API key is hardcoded in the Supabase function
- Make sure the Edge Function is deployed and working
- Check the browser console for error messages

## Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.


