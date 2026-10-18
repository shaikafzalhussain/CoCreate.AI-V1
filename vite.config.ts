import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { IncomingMessage, ServerResponse } from "node:http";
import { componentTagger } from "lovable-tagger";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import openrouterHandler from "./api/openrouter";

function localOpenRouterApi(serverEnv: Record<string, string>): Plugin {
  return {
    name: "local-openrouter-api",
    configureServer(server) {
      // This bypass exists only inside the temporary Vite preview; Vercel never loads this middleware.
      if (process.env.VERCEL !== "1") process.env.COCREATE_PREVIEW_AUTH_BYPASS = "true";
      server.middlewares.use("/api/openrouter", (req, res) => {
        const chunks: Buffer[] = [];
        req.on("data", (chunk: Buffer | string) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
        req.on("end", () => {
          try {
            const request = req as IncomingMessage & { body?: unknown };
            request.body = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
            process.env.OPENROUTER_API_KEY ||= serverEnv.OPENROUTER_API_KEY || "";
            process.env.OPENROUTER_REFINE_API_KEY ||= serverEnv.OPENROUTER_REFINE_API_KEY || "";
            process.env.SUPABASE_URL ||= serverEnv.SUPABASE_URL || serverEnv.VITE_SUPABASE_URL || "";
            process.env.SUPABASE_PUBLISHABLE_KEY ||= serverEnv.SUPABASE_PUBLISHABLE_KEY || serverEnv.VITE_SUPABASE_PUBLISHABLE_KEY || "";
            const localResponse = Object.assign(res, {
              status(code: number) {
                res.statusCode = code;
                return localResponse;
              },
              json(body: unknown) {
                res.setHeader("Content-Type", "application/json");
                res.end(JSON.stringify(body));
                return localResponse;
              },
            }) as ServerResponse & VercelResponse;
            void openrouterHandler(request as VercelRequest, localResponse);
          } catch {
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Invalid JSON request body" }));
          }
        });
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const serverEnv = loadEnv(mode, process.cwd(), "");
  return ({
  server: {
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: [".replit.dev", ".e2b.app"],
  },
  plugins: [react(), mode === "development" && localOpenRouterApi(serverEnv), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize chunk sizes
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'utils-vendor': ['clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
    // Increase chunk size warning limit (optional)
    chunkSizeWarningLimit: 600,
  },
  });
});
