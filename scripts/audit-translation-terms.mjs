import assert from "node:assert/strict";
import fs from "node:fs";
import { protectTranslationTerms as protectClientTerms } from "../src/utils/translationTerms.mjs";
import { protectTranslationTerms as protectServerTerms } from "../api/_translation-terms.js";

const source =
  "Statement on access to Fable 5, Claude Opus 4.8, GLM-5.2 and AI APIs";
const protectedValue = protectClientTerms(source, "AUDITTERM");
const serverProtectedValue = protectServerTerms(source, "AUDITTERM");
assert.equal(serverProtectedValue.protectedText, protectedValue.protectedText);
assert.equal(serverProtectedValue.restore(serverProtectedValue.protectedText), source);

assert.ok(!protectedValue.protectedText.includes("Fable 5"));
assert.ok(!protectedValue.protectedText.includes("Claude Opus 4.8"));
assert.ok(!protectedValue.protectedText.includes("GLM-5.2"));
assert.ok(!protectedValue.protectedText.includes("AI"));

const translated = protectedValue.protectedText.replace("Statement on access to", "关于访问");
const restored = protectedValue.restore(translated);
assert.match(restored, /Fable 5/);
assert.match(restored, /Claude Opus 4\.8/);
assert.match(restored, /GLM-5\.2/);
assert.match(restored, /AI APIs/);

const proxySource = fs.readFileSync(new URL("../api/[...path].js", import.meta.url), "utf8");
assert.match(proxySource, /prepareReadableTranslationProxyBody/);
assert.match(proxySource, /body: proxyBody/);
assert.match(proxySource, /item\.original = restore\(item\.original\)/);
assert.match(proxySource, /item\.translated = restore\(item\.translated\)/);
assert.match(proxySource, /readableTranslationProtection\.restoreResponse\(text\)/);

console.log("[translation-terms] shared term protection and serverless wiring verified");
