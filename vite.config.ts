import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// GitHub Pages のプロジェクトページ URL (https://mk8810b.github.io/Local-LLM/)
// に合わせる。リポジトリ名の大文字小文字と一致させること。
const BASE = "/Local-LLM/";

export default defineConfig({
  base: BASE,
  build: {
    target: "es2022",
  },
  worker: {
    format: "es",
  },
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "ローカルLLMチャット",
        short_name: "LocalLLM",
        description: "スマホのブラウザ内で完結するローカルLLMチャット",
        lang: "ja",
        display: "standalone",
        background_color: "#0f1115",
        theme_color: "#0f1115",
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // アプリシェルのみプリキャッシュする。モデル本体(数百MB〜)は
        // WebLLM が Cache API で自己管理するため Workbox には触れさせない。
        globPatterns: ["**/*.{js,css,html,png,svg,webmanifest}"],
        maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
        // オフライン時のナビゲーションはプリキャッシュ済み index.html で応答する
        navigateFallback: `${BASE}index.html`,
        runtimeCaching: [],
      },
    }),
  ],
});
