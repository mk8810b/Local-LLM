// 日本語UI文字列を一元管理する
export const t = {
  appTitle: "ローカルLLMチャット",
  tagline: "すべての推論はこの端末の中だけで実行されます",
  send: "送信",
  stop: "停止",
  newChat: "新しい会話",
  history: "履歴",
  close: "閉じる",
  delete: "削除",
  emptyHistory: "保存された会話はありません",
  inputPlaceholder: "メッセージを入力…",
  modelLabel: "モデル",
  loadModel: "モデルを読み込む",
  downloadNote: "初回はモデルをダウンロードします(Wi-Fi推奨)。2回目以降はキャッシュから読み込みます。",
  loading: "読み込み中…",
  generating: "生成中…",
  ready: "準備完了",
  welcome: "モデルを選んで「モデルを読み込む」を押してください。",
  addToHomeScreen:
    "ヒント: Safariの共有メニューから「ホーム画面に追加」すると、ダウンロードしたモデルが自動削除されにくくなり、アプリとして使えます。",
  noWebGpuTitle: "WebGPUが利用できません",
  noWebGpuBody:
    "このブラウザはWebGPUに対応していないため、LLMを実行できません。iPhoneの場合は iOS 26 以降に更新し、Safariで開いてください。AndroidはChrome最新版に対応しています。",
  oomSuggestion:
    "メモリが不足した可能性があります。「軽量」モデルに切り替えて再度お試しください。",
  loadError: "モデルの読み込みに失敗しました",
  genError: "生成中にエラーが発生しました",
  crashRecovery:
    "前回のモデル読み込みが最後まで完了しませんでした。メモリ不足でSafariが再読み込みした可能性があります。「軽量」モデルをお試しください。",
  manageTitle: "ダウンロード済みデータの管理",
  cachePresent: "保存データあり",
  cacheAbsent: "保存データなし",
  deleteAllCaches: "すべてのモデルデータを削除",
  confirmDeleteModel: (label: string) =>
    `「${label}」のモデルデータを削除しますか?(会話履歴は残ります)`,
  confirmDeleteAll:
    "すべてのモデルデータを削除しますか?(会話履歴は残ります)",
  storageUsage: (used: string, quota: string) => `ストレージ使用量: ${used} / ${quota}`,
  confirmDelete: "この会話を削除しますか?",
  systemPrompt:
    "あなたは親切なアシスタントです。日本語で簡潔に答えてください。",
} as const;
