import type { ChatEngine } from "./types";

export type EngineChoice =
  | { kind: "webllm"; engine: ChatEngine }
  | { kind: "mock"; engine: ChatEngine }
  | { kind: "unsupported" };

// エンジン実装は動的インポートにして、WebLLM本体(約6MB)を
// 初期表示のチャンクから切り離す。
export async function detectEngine(): Promise<EngineChoice> {
  if (new URLSearchParams(location.search).get("mock") === "1") {
    const { MockEngine } = await import("./mock-engine");
    return { kind: "mock", engine: new MockEngine() };
  }
  if (navigator.gpu) {
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (adapter) {
        const { WebLLMEngine } = await import("./webllm-engine");
        return { kind: "webllm", engine: new WebLLMEngine() };
      }
    } catch {
      // adapter取得失敗は非対応として扱う
    }
  }
  return { kind: "unsupported" };
}
