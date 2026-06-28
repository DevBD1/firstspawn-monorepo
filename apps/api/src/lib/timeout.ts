/** Rejects with a timeout error if `promise` doesn't settle within `timeoutMs`. */
export const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  label = "operation"
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new Error(`${label} timed out after ${timeoutMs}ms`)),
      timeoutMs
    );
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    clearTimeout(timer!);
  }
};
