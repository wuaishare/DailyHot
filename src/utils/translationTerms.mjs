export const PROTECTED_TRANSLATION_TERM_PATTERN =
  /\b(?:GPT(?:-\d+(?:\.\d+)*)?|ChatGPT|Claude|Sonnet|Opus|Haiku|Fable|Mythos|Gemini|Gemma|DiffusionGemma|GLM|Llama|Grok|Qwen|DeepSeek|Mistral|Mixtral|Kimi|ERNIE|Hunyuan|Doubao|Yi|Phi|Command|Aya|Cohere|Anthropic|OpenAI|DeepMind|Hugging Face|OpenRouter|xAI|DALL[·-]E|Sora|Codex|Copilot|JDK)(?:\s+\d+(?:\.\d+)*)?|\b(?:AI|AGI|API|MCP|LLM)\b/g;

export const protectTranslationTerms = (text = "", tokenPrefix = "DHTERM") => {
  const terms = [];
  const protectedText = String(text || "").replace(
    PROTECTED_TRANSLATION_TERM_PATTERN,
    (term) => {
      const token = `${tokenPrefix}${terms.length}X`;
      terms.push([token, term]);
      return token;
    },
  );
  const restore = (value = "") =>
    terms.reduce(
      (nextValue, [token, term]) => nextValue.replaceAll(token, term),
      String(value || ""),
    );
  return { protectedText, restore };
};
