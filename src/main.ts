import { App } from "./app";
import "./styles.css";

// Safari の7日間ストレージ削除(ITP)対策として永続化を要求する。
// ホーム画面に追加されたPWAでは特に有効。
void navigator.storage?.persist?.();

const root = document.getElementById("app")!;
void new App(root).start();

// vite-plugin-pwa (injectRegister: auto) が生成する仮想モジュールでSW登録
if ("serviceWorker" in navigator) {
  import("virtual:pwa-register").then(({ registerSW }) => {
    registerSW({ immediate: true });
  });
}
