import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig(async () => {
  const isProd = process.env.NODE_ENV === "production";

  return {
    root: path.resolve(__dirname, "client"),

    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),

      // Replit-only dev plugins (SAFE: disabled in production)
      ...(!isProd && process.env.REPL_ID
        ? [
            (await import("@replit/vite-plugin-cartographer")).cartographer(),
            (await import("@replit/vite-plugin-dev-banner")).devBanner(),
          ]
        : []),
    ],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@assets": path.resolve(__dirname, "client", "src", "assets"),
        "@shared": path.resolve(__dirname, "shared"),
      },
    },

    build: {
      // IMPORTANT: Vercel expects this
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },

    server: {
      host: "0.0.0.0",
      fs: {
        strict: true,
      },
    },
  };
});
