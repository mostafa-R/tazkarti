import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // استخراج متغيرات البيئة بناءً على وضع التشغيل
  const env = loadEnv(mode, ".");

  // استخدام متغير البيئة إذا كان متاحًا، وإلا استخدام عنوان محلي
  const apiUrl = env.VITE_API_URL || "http://localhost:5000";

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      cors: true,
      proxy: {
        "/api": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        "/auth": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
        "/user": {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: true,
    },
  };
});
