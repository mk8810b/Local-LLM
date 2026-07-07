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
    id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
    label: "標準(日本語◎)",
    downloadSize: "約950MB",
    note: "日本語の品質と速度のバランスが良いおすすめモデル",
  },
  {
    id: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    label: "軽量(日本語○)",
    downloadSize: "約350MB",
    note: "古い端末やメモリの少ない端末向け",
  },
  {
    id: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    label: "Llama 3.2 1B(英語向け)",
    downloadSize: "約600MB",
    note: "英語中心ならこちら",
  },
];

export const DEFAULT_MODEL_ID = MODELS[0].id;

// KVキャッシュがメモリを最も消費するため、コンテキスト長を絞って
// Safari のタブOOMを避ける。
export const CONTEXT_WINDOW_SIZE = 2048;
