export async function retryable(
  fn,
  {
    retries = 5,
    baseDelay = 3_000,
    maxDelay = 20_000,
    factor = 2,
    shouldRetry, // (error, attempt) => boolean | Promise<boolean>
  } = {}
) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await fn(attempt);
      // 필요 시 결과 기반 재시도 판정 훅
      if (shouldRetry) {
        const retry = await shouldRetry(null, attempt, result);
        if (!retry) return result;
      } else {
        return result;
      }
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;

      // 에러 기반 재시도 판정 훅
      if (shouldRetry) {
        const retry = await shouldRetry(err, attempt, undefined);
        if (!retry) throw err;
      }

      // capped exponential backoff
      const backoff = baseDelay * Math.pow(factor, attempt);
      const jitter = Math.random() * backoff * 0.5;
      const delay = Math.min(backoff + jitter, maxDelay);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastErr;
}
