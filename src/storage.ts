import type { ChatMessage } from "./engine/types";

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messages: ChatMessage[];
  updatedAt: number;
}

const KEY = "local-llm/conversations";
// localStorage の圧迫を避けるための上限(概ね2MB)
const MAX_BYTES = 2 * 1024 * 1024;

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveConversations(convs: Conversation[]): void {
  const sorted = [...convs].sort((a, b) => b.updatedAt - a.updatedAt);
  let json = JSON.stringify(sorted);
  // 容量超過時は古い会話から削除する
  while (json.length * 2 > MAX_BYTES && sorted.length > 1) {
    sorted.pop();
    json = JSON.stringify(sorted);
  }
  try {
    localStorage.setItem(KEY, json);
  } catch {
    // QuotaExceeded: 半分に減らして再試行
    sorted.splice(Math.ceil(sorted.length / 2));
    try {
      localStorage.setItem(KEY, JSON.stringify(sorted));
    } catch {
      // 保存できなければ諦める(アプリ動作は継続)
    }
  }
}

export function newConversation(modelId: string): Conversation {
  return {
    id: `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    modelId,
    messages: [],
    updatedAt: Date.now(),
  };
}

export function titleFrom(text: string): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length > 24 ? `${t.slice(0, 24)}…` : t;
}

export function formatBytes(n: number): string {
  if (n >= 1024 ** 3) return `${(n / 1024 ** 3).toFixed(1)}GB`;
  if (n >= 1024 ** 2) return `${(n / 1024 ** 2).toFixed(0)}MB`;
  return `${Math.ceil(n / 1024)}KB`;
}
