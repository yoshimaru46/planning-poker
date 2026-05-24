import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore", "firebase/analytics"],
          dnd: ["react-dnd", "react-dnd-html5-backend"],
          router: ["react-router-dom"],
        },
      },
    },
  },
});
