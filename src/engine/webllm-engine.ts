import {
  CreateWebWorkerMLCEngine,
  type WebWorkerMLCEngine,
} from "@mlc-ai/web-llm";
import { CONTEXT_WINDOW_SIZE } from "../models";
import type { ChatEngine, ChatMessage, LoadProgress } from "./types";

export class WebLLMEngine implements ChatEngine {
  private engine: WebWorkerMLCEngine | null = null;
  private worker: Worker | null = null;

  async load(
    modelId: string,
    onProgress: (p: LoadProgress) => void,
  ): Promise<void> {
    if (this.engine) {
      onProgress({ progress: 0, text: "" });
      await this.engine.reload(modelId, {
        context_window_size: CONTEXT_WINDOW_SIZE,
      });
      return;
    }
    this.worker = new Worker(new URL("../worker.ts", import.meta.url), {
      type: "module",
    });
    this.engine = await CreateWebWorkerMLCEngine(this.worker, modelId, {
      initProgressCallback: (report) => {
        onProgress({ progress: report.progress, text: report.text });
      },
      logLevel: "WARN",
    }, {
      context_window_size: CONTEXT_WINDOW_SIZE,
    });
  }

  async chatStream(
    messages: ChatMessage[],
    onToken: (delta: string) => void,
    signal: AbortSignal,
  ): Promise<string> {
    if (!this.engine) throw new Error("engine not loaded");
    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 1024,
    });
    let full = "";
    let aborted = false;
    for await (const chunk of chunks) {
      if (signal.aborted && !aborted) {
        aborted = true;
        // 生成を中断してもストリームは最後のチャンクまで流れきるのを待つ
        this.engine.interruptGenerate();
      }
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        full += delta;
        onToken(delta);
      }
    }
    return full;
  }

  async unload(): Promise<void> {
    await this.engine?.unload();
    this.worker?.terminate();
    this.engine = null;
    this.worker = null;
  }
}
