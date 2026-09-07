const settle = (promise, source) =>
  Promise.resolve(promise).then(
    (value) => ({ ok: true, source, value }),
    (error) => ({ ok: false, source, error }),
  );

export const raceWithDelayedFallback = async ({
  primary,
  fallback,
  delayMs = 0,
}) => {
  let fallbackTimer;
  let fallbackPromise;

  const startFallback = () => {
    if (!fallbackPromise) {
      fallbackPromise = Promise.resolve().then(fallback);
    }
    return fallbackPromise;
  };

  const primaryPromise = Promise.resolve().then(primary);
  const delayedFallback = new Promise((resolve, reject) => {
    fallbackTimer = setTimeout(() => {
      startFallback().then(resolve, reject);
    }, Math.max(0, Number(delayMs) || 0));
  });

  const first = await Promise.race([
    settle(primaryPromise, "primary"),
    settle(delayedFallback, "fallback"),
  ]);

  if (first.ok) {
    if (first.source === "primary") clearTimeout(fallbackTimer);
    return { source: first.source, value: first.value };
  }

  if (first.source === "primary") {
    clearTimeout(fallbackTimer);
    const second = await settle(startFallback(), "fallback");
    if (second.ok) return { source: "fallback", value: second.value };
    throw new AggregateError(
      [first.error, second.error],
      "Primary and fallback requests failed",
    );
  }

  const second = await settle(primaryPromise, "primary");
  if (second.ok) return { source: "primary", value: second.value };
  throw new AggregateError(
    [second.error, first.error],
    "Primary and fallback requests failed",
  );
};
