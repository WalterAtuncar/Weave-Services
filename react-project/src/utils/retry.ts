export type RetryOptions = {
  retries?: number;
  delayMs?: number;
};

export async function retry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { retries = 2, delayMs = 300 } = options;
  let attempt = 0;
  let lastError: any;
  while (attempt <= retries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries) break;
      await new Promise(res => setTimeout(res, delayMs));
      attempt++;
    }
  }
  throw lastError;
}