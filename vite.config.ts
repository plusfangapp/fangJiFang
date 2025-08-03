import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Function to safely import Replit plugins
async function getReplitPlugins() {
  if (process.env.REPL_ID === undefined) {
    return [];
  }
  
  const plugins = [];
  
  try {
    const runtimeErrorOverlay = await import("@replit/vite-plugin-runtime-error-modal");
    plugins.push(runtimeErrorOverlay.default());
  } catch (error) {
    console.log("Replit runtime error overlay not available");
  }
  
  try {
    if (process.env.NODE_ENV !== "production") {
      const cartographer = await import("@replit/vite-plugin-cartographer");
      plugins.push(cartographer.cartographer());
    }
  } catch (error) {
    console.log("Replit cartographer not available");
  }
  
  return plugins;
}

export default defineConfig(async () => {
  const replitPlugins = await getReplitPlugins();
  
  return {
    plugins: [
      react(),
      ...replitPlugins,
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "client", "src"),
        "@shared": path.resolve(import.meta.dirname, "shared"),
        "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      },
    },
    root: path.resolve(import.meta.dirname, "client"),
    build: {
      outDir: path.resolve(import.meta.dirname, "dist"),
      emptyOutDir: true,
    },
  };
});
