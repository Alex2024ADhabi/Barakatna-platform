import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { tempo } from "tempo-devtools/dist/vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tempo()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // @ts-ignore
    allowedHosts: process.env.TEMPO === "true" ? true : undefined,
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "i18next",
      "react-i18next",
    ],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore certain warnings
        if (warning.code === "CIRCULAR_DEPENDENCY") return;
        warn(warning);
      },
    },
  },
});
