import assert from "node:assert/strict";
import { resolveFeedbackConfig } from "../src/config/feedback.mjs";

const disabled = resolveFeedbackConfig({});
assert.equal(disabled.provider, "off");
assert.equal(disabled.enabled, false);
assert.equal(disabled.url, "");
assert.equal(disabled.portalUrl, "");
assert.equal(disabled.productName, "DailyHot");
assert.equal(disabled.productKey, "dailyhot");

const quackback = resolveFeedbackConfig({
  VITE_FEEDBACK_PROVIDER: "quackback",
  VITE_FEEDBACK_URL: "https://feedback.example.com/",
  VITE_FEEDBACK_PRODUCT_NAME: "Example Hot",
  VITE_FEEDBACK_PRODUCT_KEY: "example-hot",
});
assert.equal(quackback.provider, "quackback");
assert.equal(quackback.enabled, true);
assert.equal(quackback.url, "https://feedback.example.com");
assert.equal(quackback.portalUrl, "https://feedback.example.com/");
assert.equal(quackback.productName, "Example Hot");
assert.equal(quackback.productKey, "example-hot");

const github = resolveFeedbackConfig({
  VITE_FEEDBACK_PROVIDER: "github",
  VITE_FEEDBACK_URL: "https://github.com/example/repo/issues",
});
assert.equal(github.provider, "github");
assert.equal(github.enabled, true);

const customUrl = resolveFeedbackConfig({
  VITE_FEEDBACK_PROVIDER: "url",
  VITE_FEEDBACK_URL: "https://example.com/feedback?from=dailyhot",
});
assert.equal(customUrl.provider, "url");
assert.equal(customUrl.enabled, true);
assert.equal(customUrl.portalUrl, "https://example.com/feedback?from=dailyhot");

const unsafeUrl = resolveFeedbackConfig({
  VITE_FEEDBACK_PROVIDER: "url",
  VITE_FEEDBACK_URL: "javascript:alert(1)",
});
assert.equal(unsafeUrl.provider, "off");
assert.equal(unsafeUrl.enabled, false);

const invalidProvider = resolveFeedbackConfig({
  VITE_FEEDBACK_PROVIDER: "invalid",
  VITE_FEEDBACK_URL: "https://example.com",
});
assert.equal(invalidProvider.provider, "off");
assert.equal(invalidProvider.enabled, false);

const missingUrl = resolveFeedbackConfig({
  VITE_FEEDBACK_PROVIDER: "quackback",
});
assert.equal(missingUrl.provider, "off");
assert.equal(missingUrl.enabled, false);

console.log("[feedback] configuration audit passed");
