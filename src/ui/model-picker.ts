import { MODELS } from "../models";
import { t } from "../i18n";

export class ModelPicker {
  readonly el: HTMLElement;
  private select: HTMLSelectElement;
  private note: HTMLElement;
  onLoadRequest: (modelId: string) => void = () => {};

  constructor(defaultId: string) {
    this.el = document.createElement("section");
    this.el.className = "setup";
    this.el.innerHTML = `
      <p class="welcome">${t.welcome}</p>
      <label class="model-label">${t.modelLabel}
        <select class="model-select" data-testid="model-select"></select>
      </label>
      <p class="model-note"></p>
      <button class="btn primary load-btn" data-testid="load-model">${t.loadModel}</button>
      <p class="dl-note">${t.downloadNote}</p>
      <p class="a2hs-note">${t.addToHomeScreen}</p>
    `;
    this.select = this.el.querySelector(".model-select")!;
    this.note = this.el.querySelector(".model-note")!;
    for (const m of MODELS) {
      const opt = document.createElement("option");
      opt.value = m.id;
      opt.textContent = `${m.label} — ${m.downloadSize}`;
      this.select.appendChild(opt);
    }
    this.select.value = defaultId;
    this.select.addEventListener("change", () => this.renderNote());
    this.renderNote();
    this.el.querySelector(".load-btn")!.addEventListener("click", () => {
      this.onLoadRequest(this.select.value);
    });
  }

  get selectedId(): string {
    return this.select.value;
  }

  set selectedId(id: string) {
    this.select.value = id;
    this.renderNote();
  }

  private renderNote(): void {
    const m = MODELS.find((m) => m.id === this.select.value);
    this.note.textContent = m ? m.note : "";
  }

  show(): void {
    this.el.classList.remove("hidden");
  }

  hide(): void {
    this.el.classList.add("hidden");
  }
}
