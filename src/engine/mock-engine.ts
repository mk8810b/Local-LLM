import type { ChatEngine, ChatMessage, LoadProgress } from "./types";

// E2Eテスト用のモックエンジン (?mock=1 で有効化)。
// WebGPU が無いヘッドレス環境でも UI の全フローを検証できるようにする。
export class MockEngine implements ChatEngine {
  async load(
    modelId: string,
    onProgress: (p: LoadProgress) => void,
  ): Promise<void> {
    for (let i = 1; i <= 4; i++) {
      onProgress({
        progress: i / 4,
        text: `Fetching ${modelId} [${i}/4]`,
      });
      await new Promise((r) => setTimeout(r, 50));
    }
  }

  async chatStream(
    messages: ChatMessage[],
    onToken: (delta: string) => void,
    signal: AbortSignal,
  ): Promise<string> {
    const last = messages[messages.length - 1]?.content ?? "";
    const reply = `モック応答: 「${last}」を受け取りました。`;
    let full = "";
    for (const ch of reply) {
      if (signal.aborted) break;
      full += ch;
      onToken(ch);
      await new Promise((r) => setTimeout(r, 10));
    }
    return full;
  }

  async unload(): Promise<void> {}
}
