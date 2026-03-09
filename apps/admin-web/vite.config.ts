import path from "path";

import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const normalizeViteBase = (value: string | undefined) => {
  if (!value || value.trim() === "" || value.trim() === "/") {
    return "/";
  }

  const trimmed = value.trim();
  const prefixed = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return prefixed.endsWith("/") ? prefixed : `${prefixed}/`;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: normalizeViteBase(env.VITE_APP_BASE_PATH),
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src")
      }
    }
  };
});
