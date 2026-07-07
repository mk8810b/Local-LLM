# ローカルLLMチャット (Local-LLM)

スマホの**ブラウザの中だけ**でLLMが動くチャットアプリ(PWA)です。
推論はWebGPU([WebLLM](https://github.com/mlc-ai/web-llm))で端末上で実行され、メッセージが外部サーバーに送信されることはありません。初回にモデルをダウンロードした後は**オフラインでも動作**します。

## 使い方(iPhone)

1. **iOS 26以降**に更新した iPhone の Safari で公開URLを開く
   - デプロイ後のURL: `https://mk8810b.github.io/Local-LLM/`
2. モデルを選んで「モデルを読み込む」をタップ(初回のみダウンロード。**Wi-Fi推奨**)
3. チャットを開始

> **ヒント**: Safariの共有メニューから**「ホーム画面に追加」**してください。アプリとして全画面で使えるほか、Safariの7日間非使用時のストレージ自動削除を回避でき、ダウンロード済みモデル(約350MB〜1GB)の再ダウンロードを防げます。

AndroidはChrome最新版(WebGPU対応)でも動作します。

## 搭載モデル

| モデル | サイズ | 特徴 |
|---|---|---|
| Qwen2.5-1.5B-Instruct(標準) | 約950MB | 日本語の品質と速度のバランスが良い |
| Qwen2.5-0.5B-Instruct(軽量) | 約350MB | メモリの少ない端末・古い端末向け |
| Llama-3.2-1B-Instruct | 約600MB | 英語中心の用途向け |

メモリ不足エラーが出る場合は「軽量」モデルに切り替えてください。

## デプロイ(GitHub Pages)

`main` ブランチへの push で `.github/workflows/deploy.yml` が自動デプロイします。

**初回のみ必要な設定**: リポジトリの **Settings → Pages → Build and deployment → Source** を **「GitHub Actions」** に変更してください。

## 開発

```bash
npm install
npm run dev        # 開発サーバー
npm run build      # 型チェック + 本番ビルド (dist/)
npm test           # Playwright E2E テスト(モックエンジンでUI検証)
```

- WebGPUが使えない環境向けに `?mock=1` を付けるとモックエンジンでUIを確認できます。
- E2Eテストは `CHROMIUM_PATH=<chromiumのパス> npm test` のように実行ファイルを指定できます。

## 構成

- `src/engine/` — エンジン抽象化(`types.ts`)、WebLLM実装(`webllm-engine.ts`、Web Worker + WebGPU)、テスト用モック、WebGPU検出
- `src/ui/` — チャット表示・モデル選択・進捗バー・履歴ドロワー
- `src/storage.ts` — 会話履歴のlocalStorage保存(約2MB上限で古い順に削除)
- `vite.config.ts` — GitHub Pages のベースパス(`/Local-LLM/`)とPWA設定。モデル本体のキャッシュはWebLLMがCache APIで自己管理し、Service Workerはアプリシェルのみをキャッシュします
