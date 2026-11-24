
import { defineConfig } from "vite";

export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? "/AURELLE/" : "/",
  server: { open: true },
  build: { target: "es2020" },
});
