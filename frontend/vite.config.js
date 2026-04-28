import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite build pipeline for the React app with Tailwind processed as a Vite plugin.
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
