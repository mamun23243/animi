// DeepSeek → OpenRouter (uncensored model) → OpenAI — যেটা key থাকবে সেটা ব্যবহার হবে
const PROVIDERS = [
  {
    name: "deepseek",
    url: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat",
    key: process.env.DEEPSEEK_API_KEY,
  },
  {
    name: "openrouter",
    url: "https://openrouter.ai/api/v1/chat/completions",
    model: (mood: string) =>
      mood === "adult"
        ? "sao10k/l3.1-euryale-70b" // NSFW-capable model
        : "meta-llama/llama-3.1-70b-instruct",
    key: process.env.OPENROUTER_API_KEY,
  },
  {
    name: "openai",
    url: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4o-mini",
    key: process.env.OPENAI_API_KEY,
  },
];

export async function streamAI(
  messages: { role: string; content: string }[],
  mood: string
): Promise<ReadableStream<Uint8Array>> {
  for (const p of PROVIDERS) {
    if (!p.key) continue;
    try {
      const model = typeof p.model === "function" ? p.model(mood) : p.model;
      const res = await fetch(p.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${p.key}`,
          ...(p.name === "openrouter" ? { "HTTP-Referer": process.env.NEXTAUTH_URL ?? "" } : {}),
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true,
          temperature: mood === "adult" ? 0.9 : 0.7,
          max_tokens: 500,
        }),
      });
      if (!res.ok || !res.body) continue; // এই provider fail → next try
      return res.body;
    } catch {
      continue;
    }
  }
  throw new Error("ALL_AI_PROVIDERS_FAILED");
}