export function withTimeout<T>(promise: Promise<T>, timeout?: number): Promise<T> {
  if (timeout === undefined) {
    return promise;
  }

  if (!Number.isSafeInteger(timeout) || timeout <= 0) {
    return Promise.reject(new TypeError("KV timeout must be a positive integer."));
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeout);
  }).then(() => {
    throw new Error(`KV operation timed out after ${timeout}ms.`);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timer) {
      clearTimeout(timer);
    }
  });
}
