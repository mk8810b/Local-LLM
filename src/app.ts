import { detectEngine } from "./engine/detect";
import { isOutOfMemoryError } from "./engine/errors";
import type { ChatEngine } from "./engine/types";
import { DEFAULT_MODEL_ID } from "./models";
import {
  loadConversations,
  saveConversations,
  newConversation,
  titleFrom,
  formatBytes,
  type Conversation,
} from "./storage";
import { CacheManager } from "./ui/cache-manager";
import { ChatView } from "./ui/chat";
import { HistoryDrawer } from "./ui/history-drawer";
import { ModelPicker } from "./ui/model-picker";
import { ProgressBar } from "./ui/progress";
import { t } from "./i18n";

type State = "idle" | "loading" | "ready" | "generating";

// モデル読み込み開始時に立て、成功/失敗(JSエラー)で消すフラグ。
// アプリ起動時に残っていた場合、前回はSafariごと落ちた(=OOM)と判断できる。
const LOAD_FLAG_KEY = "local-llm/load-in-progress";

export class App {
  private state: State = "idle";
  private engine: ChatEngine | null = null;
  private loadedModelId: string | null = null;
  private conversations: Conversation[] = loadConversations();
  private current: Conversation | null = null;
  private abort: AbortController | null = null;

  private root: HTMLElement;
  private statusEl!: HTMLElement;
  private inputEl!: HTMLTextAreaElement;
  private sendBtn!: HTMLButtonElement;
  private footerEl!: HTMLElement;
  private storageEl!: HTMLElement;

  private picker = new ModelPicker(DEFAULT_MODEL_ID);
  private progress = new ProgressBar();
  private chat = new ChatView();
  private drawer = new HistoryDrawer();
  private cacheManager = new CacheManager();

  constructor(root: HTMLElement) {
    this.root = root;
  }

  async start(): Promise<void> {
    const choice = await detectEngine();
    if (choice.kind === "unsupported") {
      this.renderUnsupported();
      return;
    }
    this.engine = choice.engine;
    this.renderShell();
    this.updateStorageEstimate();
  }

  private renderUnsupported(): void {
    this.root.innerHTML = `
      <div class="unsupported" data-testid="unsupported">
        <h1>${t.noWebGpuTitle}</h1>
        <p>${t.noWebGpuBody}</p>
      </div>
    `;
  }

  private renderShell(): void {
    this.root.innerHTML = `
      <header class="topbar">
        <button class="btn small" data-testid="history-btn">${t.history}</button>
        <div class="titles">
          <h1>${t.appTitle}</h1>
          <p class="status" data-testid="status"></p>
        </div>
        <button class="btn small" data-testid="new-chat">${t.newChat}</button>
      </header>
      <main class="content"></main>
      <footer class="composer hidden">
        <textarea rows="1" data-testid="input" placeholder="${t.inputPlaceholder}"></textarea>
        <button class="btn primary" data-testid="send">${t.send}</button>
      </footer>
      <p class="storage-line"></p>
    `;
    const main = this.root.querySelector(".content")!;
    main.append(this.picker.el, this.progress.el, this.chat.el);
    this.root.appendChild(this.drawer.el);

    // 前回タブごと落ちていた場合の案内(フラグが残っている=読み込み中にクラッシュ)
    if (localStorage.getItem(LOAD_FLAG_KEY)) {
      localStorage.removeItem(LOAD_FLAG_KEY);
      const warn = document.createElement("p");
      warn.className = "crash-notice";
      warn.setAttribute("data-testid", "crash-notice");
      warn.textContent = t.crashRecovery;
      this.picker.el.prepend(warn);
    }
    this.picker.el.appendChild(this.cacheManager.el);
    this.cacheManager.onChanged = () => this.updateStorageEstimate();

    this.statusEl = this.root.querySelector(".status")!;
    this.inputEl = this.root.querySelector("textarea")!;
    this.sendBtn = this.root.querySelector('[data-testid="send"]')!;
    this.footerEl = this.root.querySelector(".composer")!;
    this.storageEl = this.root.querySelector(".storage-line")!;

    this.picker.onLoadRequest = (id) => this.loadModel(id);
    this.sendBtn.addEventListener("click", () => this.onSendOrStop());
    this.inputEl.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        this.onSendOrStop();
      }
    });
    this.root
      .querySelector('[data-testid="new-chat"]')!
      .addEventListener("click", () => this.newChat());
    this.root
      .querySelector('[data-testid="history-btn"]')!
      .addEventListener("click", () =>
        this.drawer.show(this.conversations),
      );
    this.drawer.onSelect = (id) => this.openConversation(id);
    this.drawer.onDelete = (id) => this.deleteConversation(id);

    this.setState("idle");
  }

  private setState(s: State): void {
    this.state = s;
    switch (s) {
      case "idle":
        this.statusEl.textContent = t.tagline;
        this.picker.show();
        this.progress.hide();
        this.chat.hide();
        this.footerEl.classList.add("hidden");
        void this.cacheManager.refresh();
        break;
      case "loading":
        this.statusEl.textContent = t.loading;
        this.picker.hide();
        this.progress.show();
        this.chat.hide();
        this.footerEl.classList.add("hidden");
        break;
      case "ready":
        this.statusEl.textContent = t.ready;
        this.picker.hide();
        this.progress.hide();
        this.chat.show();
        this.footerEl.classList.remove("hidden");
        this.sendBtn.textContent = t.send;
        this.sendBtn.disabled = false;
        break;
      case "generating":
        this.statusEl.textContent = t.generating;
        this.sendBtn.textContent = t.stop;
        break;
    }
  }

  private async loadModel(modelId: string): Promise<void> {
    if (!this.engine || this.state === "loading") return;
    this.setState("loading");
    localStorage.setItem(LOAD_FLAG_KEY, modelId);
    try {
      await this.engine.load(modelId, (p) =>
        this.progress.update(p.progress, p.text),
      );
      this.loadedModelId = modelId;
      if (!this.current) {
        this.current = newConversation(modelId);
        this.current.messages.push({
          role: "system",
          content: t.systemPrompt,
        });
      }
      this.chat.render(this.current.messages);
      this.setState("ready");
      this.updateStorageEstimate();
    } catch (err) {
      console.error(err);
      this.setState("idle");
      const detail = err instanceof Error ? err.message : String(err);
      alert(
        isOutOfMemoryError(err)
          ? `${t.loadError}\n${t.oomSuggestion}`
          : `${t.loadError}\n${detail}`,
      );
    } finally {
      // JSエラーで生き残った場合はフラグを消す。タブごと落ちた場合だけ残る
      localStorage.removeItem(LOAD_FLAG_KEY);
    }
  }

  private onSendOrStop(): void {
    if (this.state === "generating") {
      this.abort?.abort();
      return;
    }
    void this.send();
  }

  private async send(): Promise<void> {
    if (this.state !== "ready" || !this.engine || !this.current) return;
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.inputEl.value = "";

    this.current.messages.push({ role: "user", content: text });
    if (!this.current.title) this.current.title = titleFrom(text);
    this.chat.addMessage("user", text);
    this.setState("generating");
    this.chat.startStreaming();
    this.abort = new AbortController();

    try {
      const reply = await this.engine.chatStream(
        this.current.messages,
        (delta) => this.chat.appendToken(delta),
        this.abort.signal,
      );
      this.current.messages.push({ role: "assistant", content: reply });
      this.persist();
    } catch (err) {
      console.error(err);
      this.chat.addNotice(
        isOutOfMemoryError(err) ? t.oomSuggestion : t.genError,
      );
      // 失敗したユーザー発話は履歴に残す(再送可能にするため)
      this.persist();
    } finally {
      this.chat.endStreaming();
      this.abort = null;
      this.setState("ready");
    }
  }

  private persist(): void {
    if (!this.current) return;
    this.current.updatedAt = Date.now();
    const idx = this.conversations.findIndex((c) => c.id === this.current!.id);
    if (idx >= 0) this.conversations[idx] = this.current;
    else this.conversations.unshift(this.current);
    saveConversations(this.conversations);
    this.conversations = loadConversations();
  }

  private newChat(): void {
    if (this.state === "generating") this.abort?.abort();
    this.current = newConversation(this.loadedModelId ?? DEFAULT_MODEL_ID);
    this.current.messages.push({ role: "system", content: t.systemPrompt });
    if (this.state === "idle" || this.state === "loading") return;
    this.chat.render(this.current.messages);
    this.setState("ready");
  }

  private openConversation(id: string): void {
    const conv = this.conversations.find((c) => c.id === id);
    if (!conv) return;
    if (this.state === "generating") this.abort?.abort();
    this.current = conv;
    this.chat.render(conv.messages);
    if (this.loadedModelId) {
      this.setState("ready");
    } else {
      // モデル未ロードなら、その会話のモデルを選択状態にして読み込みを促す
      this.picker.selectedId = conv.modelId;
      this.setState("idle");
    }
  }

  private deleteConversation(id: string): void {
    this.conversations = this.conversations.filter((c) => c.id !== id);
    saveConversations(this.conversations);
    if (this.current?.id === id) this.newChat();
    this.drawer.show(this.conversations);
  }

  private async updateStorageEstimate(): Promise<void> {
    if (!navigator.storage?.estimate) return;
    try {
      const est = await navigator.storage.estimate();
      if (est.usage != null && est.quota != null) {
        this.storageEl.textContent = t.storageUsage(
          formatBytes(est.usage),
          formatBytes(est.quota),
        );
      }
    } catch {
      // 非対応ブラウザでは表示しない
    }
  }
}
