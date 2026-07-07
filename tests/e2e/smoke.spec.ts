import { test, expect, type Page } from "@playwright/test";

// ヘッドレス環境にはWebGPUが無いため、モックエンジン (?mock=1) で
// UIの全フロー(モデル読込→送信→ストリーミング→履歴保存)を検証する。

async function loadMockModel(page: Page) {
  await page.goto("?mock=1");
  await page.getByTestId("load-model").click();
  await expect(page.getByTestId("input")).toBeVisible({ timeout: 10_000 });
}

test("モデル選択画面が表示される", async ({ page }) => {
  await page.goto("?mock=1");
  await expect(page).toHaveTitle(/ローカルLLM/);
  await expect(page.getByTestId("model-select")).toBeVisible();
  await expect(page.getByTestId("load-model")).toBeVisible();
  // デフォルトはQwen2.5 1.5B
  await expect(page.getByTestId("model-select")).toHaveValue(
    "Qwen2.5-1.5B-Instruct-q4f16_1-MLC",
  );
});

test("モデル読込→チャット送信→ストリーミング応答", async ({ page }) => {
  await loadMockModel(page);
  await page.getByTestId("input").fill("こんにちは");
  await page.getByTestId("send").click();
  await expect(page.locator(".bubble.user")).toHaveText("こんにちは");
  await expect(page.locator(".bubble.assistant")).toContainText(
    "モック応答: 「こんにちは」を受け取りました。",
    { timeout: 10_000 },
  );
});

test("会話が履歴に保存され、リロード後も残る", async ({ page }) => {
  await loadMockModel(page);
  await page.getByTestId("input").fill("履歴テスト");
  await page.getByTestId("send").click();
  // 生成完了(=履歴保存)まで待つ: 送信ボタンが「停止」から「送信」に戻る
  await expect(page.getByTestId("send")).toHaveText("送信", {
    timeout: 10_000,
  });

  await page.reload();
  await page.getByTestId("history-btn").click();
  const item = page.locator(".drawer-title", { hasText: "履歴テスト" });
  await expect(item).toBeVisible();

  // 履歴から会話を開くと過去メッセージが表示される(モデル未ロードなので設定画面に戻る)
  await item.click();
  await expect(page.getByTestId("load-model")).toBeVisible();
  await page.getByTestId("load-model").click();
  await expect(page.locator(".bubble.user")).toHaveText("履歴テスト");
});

test("WebGPU非対応環境ではエラー画面を表示する", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", { value: undefined });
  });
  await page.goto(".");
  await expect(page.getByTestId("unsupported")).toBeVisible();
  await expect(page.getByTestId("unsupported")).toContainText("iOS 26");
});

test("Service Worker が登録される", async ({ page }) => {
  await page.goto("?mock=1");
  const swScope = await page.evaluate(async () => {
    const reg = await navigator.serviceWorker.ready;
    return reg.scope;
  });
  expect(swScope).toContain("/Local-LLM/");
});

test("オフラインでもアプリシェルが読み込める", async ({ page, context }) => {
  await page.goto("?mock=1");
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByTestId("load-model")).toBeVisible({
    timeout: 10_000,
  });
  await context.setOffline(false);
});
