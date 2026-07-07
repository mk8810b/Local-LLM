export class ProgressBar {
  readonly el: HTMLElement;
  private fill: HTMLElement;
  private label: HTMLElement;

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "progress hidden";
    this.el.innerHTML = `
      <div class="progress-track"><div class="progress-fill"></div></div>
      <div class="progress-label"></div>
    `;
    this.fill = this.el.querySelector(".progress-fill")!;
    this.label = this.el.querySelector(".progress-label")!;
  }

  show(): void {
    this.el.classList.remove("hidden");
    this.update(0, "");
  }

  hide(): void {
    this.el.classList.add("hidden");
  }

  update(progress: number, text: string): void {
    this.fill.style.width = `${Math.round(progress * 100)}%`;
    this.label.textContent = text;
  }
}
