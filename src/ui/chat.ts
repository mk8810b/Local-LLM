import type { ChatMessage } from "../engine/types";

export class ChatView {
  readonly el: HTMLElement;
  private streamingEl: HTMLElement | null = null;

  constructor() {
    this.el = document.createElement("section");
    this.el.className = "chat hidden";
    this.el.setAttribute("data-testid", "chat");
  }

  show(): void {
    this.el.classList.remove("hidden");
  }

  hide(): void {
    this.el.classList.add("hidden");
  }

  render(messages: ChatMessage[]): void {
    this.el.innerHTML = "";
    this.streamingEl = null;
    for (const m of messages) {
      if (m.role === "system") continue;
      this.el.appendChild(this.bubble(m.role, m.content));
    }
    this.scrollToBottom();
  }

  addMessage(role: "user" | "assistant", content: string): void {
    this.el.appendChild(this.bubble(role, content));
    this.scrollToBottom();
  }

  /** ストリーミング先のアシスタント吹き出しを作る */
  startStreaming(): void {
    this.streamingEl = this.bubble("assistant", "");
    this.streamingEl.classList.add("streaming");
    this.el.appendChild(this.streamingEl);
    this.scrollToBottom();
  }

  appendToken(delta: string): void {
    if (!this.streamingEl) return;
    this.streamingEl.textContent += delta;
    this.scrollToBottom();
  }

  endStreaming(): void {
    this.streamingEl?.classList.remove("streaming");
    this.streamingEl = null;
  }

  addNotice(text: string): void {
    const div = document.createElement("div");
    div.className = "notice";
    div.textContent = text;
    this.el.appendChild(div);
    this.scrollToBottom();
  }

  private bubble(role: "user" | "assistant", content: string): HTMLElement {
    const div = document.createElement("div");
    div.className = `bubble ${role}`;
    div.textContent = content;
    return div;
  }

  private scrollToBottom(): void {
    this.el.scrollTop = this.el.scrollHeight;
  }
}
