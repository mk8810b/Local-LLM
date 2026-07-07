/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// WebGPU の存在判定に必要な最小限の型定義
// (@webgpu/types を入れるほどのAPIは使わないためローカル宣言で済ませる)
interface Navigator {
  gpu?: {
    requestAdapter(): Promise<object | null>;
  };
}
