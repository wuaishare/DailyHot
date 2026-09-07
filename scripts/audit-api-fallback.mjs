import assert from "node:assert/strict";
import { raceWithDelayedFallback } from "../src/api/fallbackRace.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

{
  let fallbackCalls = 0;
  const result = await raceWithDelayedFallback({
    primary: async () => "primary",
    fallback: async () => {
      fallbackCalls += 1;
      return "fallback";
    },
    delayMs: 25,
  });
  assert.deepEqual(result, { source: "primary", value: "primary" });
  await sleep(35);
  assert.equal(fallbackCalls, 0);
}

{
  const result = await raceWithDelayedFallback({
    primary: async () => {
      await sleep(40);
      return "slow-primary";
    },
    fallback: async () => "fallback",
    delayMs: 5,
  });
  assert.deepEqual(result, { source: "fallback", value: "fallback" });
}

{
  const primaryError = Object.assign(new Error("primary_failed"), {
    usedApi2: false,
  });
  const fallbackError = Object.assign(new Error("fallback_failed"), {
    usedApi2: true,
  });

  await assert.rejects(
    () =>
      raceWithDelayedFallback({
        primary: async () => {
          throw primaryError;
        },
        fallback: async () => {
          throw fallbackError;
        },
        delayMs: 50,
      }),
    (error) => {
      assert.equal(error instanceof AggregateError, true);
      assert.deepEqual(error.errors, [primaryError, fallbackError]);
      return true;
    },
  );
}

console.log("[api-fallback] primary, delayed fallback, and dual-failure audit passed");
