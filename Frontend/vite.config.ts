import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()] }),
        tailwindcss(),
    ],
    server: {
        // The backend's CORS policy allows exactly one origin, http://localhost:5173.
        // Without strictPort, Vite silently falls back to 5174 when 5173 is busy and
        // every API call then fails CORS — a confusing failure a long way from its cause.
        // strictPort makes Vite refuse to start instead, which names the real problem.
        port: 5173,
        strictPort: true,
    },
});
