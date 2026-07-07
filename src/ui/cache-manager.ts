import { MODELS } from "../models";
import { t } from "../i18n";

// WebLLM がモデルデータの保存に使う Cache API のキャッシュ名。
// 6MBのWebLLM本体を読み込まずに済むよう、Cache API を直接操作する。
// URLに model_id が含まれるため、部分ダウンロードのデータも確実に消せる。
const WEBLLM_CACHES = ["webllm/model", "webllm/config", "webllm/wasm"];

async function hasModelData(modelId: string): Promise<boolean> {
  for (const name of WEBLLM_CACHES) {
    if (!(await caches.has(name))) continue;
    const cache = await caches.open(name);
    for (const req of await cache.keys()) {
      if (req.url.includes(`/${modelId}/`)) return true;
    }
  }
  return false;
}

async function deleteModelData(modelId: string): Promise<void> {
  for (const name of WEBLLM_CACHES) {
    if (!(await caches.has(name))) continue;
    const cache = await caches.open(name);
    for (const req of await cache.keys()) {
      if (req.url.includes(`/${modelId}/`)) await cache.delete(req);
    }
  }
}

async function deleteAllModelData(): Promise<void> {
  for (const name of WEBLLM_CACHES) {
    await caches.delete(name);
  }
}

export class CacheManager {
  readonly el: HTMLElement;
  /** データ削除後に呼ばれる(ストレージ表示の更新用) */
  onChanged: () => void = () => {};

  constructor() {
    this.el = document.createElement("div");
    this.el.className = "cache-manager";
    this.el.setAttribute("data-testid", "cache-manager");
  }

  async refresh(): Promise<void> {
    if (!("caches" in window)) {
      this.el.innerHTML = "";
      return;
    }
    const rows = await Promise.all(
      MODELS.map(async (m) => ({ model: m, present: await hasModelData(m.id) })),
    );
    const anyPresent = rows.some((r) => r.present);

    this.el.innerHTML = `<div class="cache-title">${t.manageTitle}</div>`;
    for (const { model, present } of rows) {
      const row = document.createElement("div");
      row.className = "cache-row";
      const label = document.createElement("span");
      label.className = "cache-label";
      label.textContent = model.label;
      const status = document.createElement("span");
      status.className = `cache-status ${present ? "present" : ""}`;
      status.textContent = present ? t.cachePresent : t.cacheAbsent;
      row.append(label, status);
      if (present) {
        const del = document.createElement("button");
        del.className = "btn small danger";
        del.textContent = t.delete;
        del.addEventListener("click", async () => {
          if (!confirm(t.confirmDeleteModel(model.label))) return;
          del.disabled = true;
          await deleteModelData(model.id);
          await this.refresh();
          this.onChanged();
        });
        row.appendChild(del);
      }
      this.el.appendChild(row);
    }
    if (anyPresent) {
      const delAll = document.createElement("button");
      delAll.className = "btn small danger cache-delete-all";
      delAll.textContent = t.deleteAllCaches;
      delAll.addEventListener("click", async () => {
        if (!confirm(t.confirmDeleteAll)) return;
        delAll.disabled = true;
        await deleteAllModelData();
        await this.refresh();
        this.onChanged();
      });
      this.el.appendChild(delAll);
    }
  }
}
