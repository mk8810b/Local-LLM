/** GPUメモリ不足・デバイスロスト系のエラーか判定する */
export function isOutOfMemoryError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /out of memory|device.?lost|buffer size|allocation|maxBufferSize/i.test(
    msg,
  );
}
