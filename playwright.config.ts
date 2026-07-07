import { defineConfig, devices } from "@playwright/test";

// GitHub Pages と同じベースパスで vite preview に対してテストする
const BASE = "/Local-LLM/";
const PORT = 4173;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  use: {
    baseURL: `http://localhost:${PORT}${BASE}`,
    // iPhone相当のビューポートで検証する。WebKitはこの環境に無いため
    // ブラウザ自体はChromiumを使う。
    ...devices["iPhone 13"],
    browserName: "chromium",
    // CI/コンテナ環境ではプリインストールのChromiumを使う
    launchOptions: process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {},
  },
  webServer: {
    command: `npm run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}${BASE}`,
    reuseExistingServer: !process.env.CI,
  },
});
