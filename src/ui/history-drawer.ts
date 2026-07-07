import type { Conversation } from "../storage";
import { t } from "../i18n";

export class HistoryDrawer {
  readonly el: HTMLElement;
  private list: HTMLElement;
  onSelect: (id: string) => void = () => {};
  onDelete: (id: string) => void = () => {};

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "drawer hidden";
    this.el.innerHTML = `
      <div class="drawer-backdrop"></div>
      <div class="drawer-panel" data-testid="history-drawer">
        <div class="drawer-head">
          <span>${t.history}</span>
          <button class="btn small drawer-close">${t.close}</button>
        </div>
        <ul class="drawer-list"></ul>
      </div>
    `;
    this.list = this.el.querySelector(".drawer-list")!;
    this.el
      .querySelector(".drawer-backdrop")!
      .addEventListener("click", () => this.hide());
    this.el
      .querySelector(".drawer-close")!
      .addEventListener("click", () => this.hide());
  }

  show(convs: Conversation[]): void {
    this.list.innerHTML = "";
    if (convs.length === 0) {
      const li = document.createElement("li");
      li.className = "drawer-empty";
      li.textContent = t.emptyHistory;
      this.list.appendChild(li);
    }
    for (const c of convs) {
      const li = document.createElement("li");
      li.className = "drawer-item";
      const title = document.createElement("button");
      title.className = "drawer-title";
      title.textContent = c.title || "(無題)";
      title.addEventListener("click", () => {
        this.hide();
        this.onSelect(c.id);
      });
      const del = document.createElement("button");
      del.className = "btn small danger";
      del.textContent = t.delete;
      del.addEventListener("click", () => {
        if (confirm(t.confirmDelete)) this.onDelete(c.id);
      });
      li.append(title, del);
      this.list.appendChild(li);
    }
    this.el.classList.remove("hidden");
  }

  hide(): void {
    this.el.classList.add("hidden");
  }
}
