// WebLLM のプリビルドモデルカタログから、iPhone のタブメモリ上限
// (概ね 1.5〜3GB) に収まる小型モデルを選定している。
// q4f16_1 は shader-f16 が必要だが、iOS 26+ / Apple GPU は対応済み。
export interface ModelInfo {
  id: string;
  label: string;
  downloadSize: string;
  note: string;
}

export const MODELS: ModelInfo[] = [
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "軽量(日本語○)",
    downloadSize: "約350MB",
    note: "ほとんどのiPhoneで安定して動くおすすめモデル",
  },
  {
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "標準(日本語◎)",
    downloadSize: "約950MB",
    note: "日本語の品質が高い。メモリ6GB以上の機種(iPhone 13 Pro以降など)推奨。メモリ4GBの機種ではSafariが落ちることがあります",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B(英語向け)",
    downloadSize: "約600MB",
    note: "英語中心ならこちら",
  },
];

// 軽量モデルをデフォルトにする(1.5BはRAM 4GBのiPhoneでSafariごと落ちるため)
export const DEFAULT_MODEL_ID = MODELS[0].id;

// KVキャッシュがメモリを最も消費するため、コンテキスト長を絞って
// Safari のタブOOMを避ける。
export const CONTEXT_WINDOW_SIZE = 2048;
