export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LoadProgress {
  /** 0..1 */
  progress: number;
  text: string;
}

export interface ChatEngine {
  load(
    modelId: string,
    onProgress: (p: LoadProgress) => void,
  ): Promise<void>;
  /** ストリーミング生成。トークンごとに onToken を呼び、完了時に全文を返す。 */
  chatStream(
    messages: ChatMessage[],
    onToken: (delta: string) => void,
    signal: AbortSignal,
  ): Promise<string>;
  unload(): Promise<void>;
}
