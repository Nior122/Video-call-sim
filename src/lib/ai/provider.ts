import { Persona, ChatMessage } from "../../types";
import { buildPersonaContext } from "./persona-context";

interface GenerateParams {
  persona: Persona;
  messages: Pick<ChatMessage, "role" | "content">[];
}

export async function callOpenAICompatible(
  url: string,
  apiKey: string,
  model: string,
  messages: any[],
  maxTokens: number = 80,
  timeoutMs: number = 9000,
  extraHeaders: Record<string, string> = {}
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.85,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Provider API Error (${response.status}): ${errorText.slice(0, 120)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      throw new Error("Empty response from AI provider");
    }

    return content.trim();
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Generates natural fallback responses tailored to the persona when API keys are not provided
 */
function getLocalFallbackResponse(persona: Persona, lastUserMessage: string): string {
  const text = (lastUserMessage || "").toLowerCase();

  // Socials / Manager / Dates
  if (
    /social|instagram|ig|snap|snapchat|telegram|whatsapp|phone|number|digits|date|meet|meetup|dinner|drinks/i.test(
      text
    )
  ) {
    return `Mmm you'll have to reach out to my manager on Telegram for that: t.me/Dreamgirlteam 😉✨`;
  }

  // Are you a bot / Prove it / Call
  if (/bot|real|fake|ai|robot|prove/i.test(text)) {
    return `Haha excuse me?! 😂 I'm 100% real babe. Let me call you right now! 📞`;
  }

  // Flirty / General greetings
  const greetings = [
    `Hey there! I was just thinking about you... what are you up to? 😉`,
    `Haha you're cute! Tell me something fun about your day ✨`,
    `Just relaxing at home... so glad you messaged me 💕`,
    `Mmm you always know how to make me smile 😏`,
    `Hey babe! How is your day going so far? 🌸`,
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

export async function generatePersonaResponse({
  persona,
  messages,
}: GenerateParams): Promise<{ content: string; provider: string }> {
  const systemPrompt = buildPersonaContext(persona);

  // Truncate history to last 10 messages to maintain a tight, fast context
  const recentMessages = messages.length > 10 ? messages.slice(-10) : messages;

  const formattedMessages = [
    { role: "system", content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    })),
  ];

  const lastUserMsg = messages[messages.length - 1]?.content || "";

  // 1. PRIMARY: Groq (ultra-fast OpenAI-compatible API)
  if (process.env.GROQ_API_KEY) {
    try {
      const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      const content = await callOpenAICompatible(
        "https://api.groq.com/openai/v1/chat/completions",
        process.env.GROQ_API_KEY,
        model,
        formattedMessages,
        80,
        9000
      );
      return { content: sanitizeOutput(content), provider: `Groq (${model})` };
    } catch (err: any) {
      console.warn("Groq request failed, switching to fallback provider:", err?.message || err);
    }
  }

  // 2. FALLBACK: OpenRouter (OpenRouter API)
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const model = process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct";
      const content = await callOpenAICompatible(
        "https://openrouter.ai/api/v1/chat/completions",
        process.env.OPENROUTER_API_KEY,
        model,
        formattedMessages,
        80,
        9000,
        {
          "HTTP-Referer": "https://dreamgirl.app",
          "X-Title": "Dreamgirl AI",
        }
      );
      return { content: sanitizeOutput(content), provider: `OpenRouter (${model})` };
    } catch (err: any) {
      console.warn("OpenRouter fallback request failed:", err?.message || err);
    }
  }

  // 3. OPTIONAL SECONDARY FALLBACK: Standard OpenAI API or OpenAI Proxy
  if (process.env.OPENAI_API_KEY) {
    try {
      const baseUrl = (process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/+$/, "");
      const model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      const content = await callOpenAICompatible(
        `${baseUrl}/chat/completions`,
        process.env.OPENAI_API_KEY,
        model,
        formattedMessages,
        80,
        9000
      );
      return { content: sanitizeOutput(content), provider: `OpenAI (${model})` };
    } catch (err: any) {
      console.warn("OpenAI fallback request failed:", err?.message || err);
    }
  }

  // 4. FINAL SAFEGUARD: Native Persona Response Engine (Zero-Downtime Guarantee)
  console.info("Using persona dynamic fallback (no active API key or all network calls timed out)");
  return {
    content: getLocalFallbackResponse(persona, lastUserMsg),
    provider: "Dreamgirl Engine",
  };
}

function sanitizeOutput(raw: string): string {
  let content = raw.trim();

  // Strip wrapping quotes if LLM added them
  if (
    (content.startsWith('"') && content.endsWith('"')) ||
    (content.startsWith("'") && content.endsWith("'"))
  ) {
    content = content.slice(1, -1).trim();
  }

  // Enforce human length constraint (max ~24 words unless contains link)
  const containsLink = /t\.me\//i.test(content) || /https?:\/\//i.test(content);
  const MAX_WORDS = 24;
  const words = content.split(/\s+/).filter(Boolean);

  if (!containsLink && words.length > MAX_WORDS) {
    const sentences = content.match(/[^.!?]+[.!?]+/g);
    if (sentences && sentences.length > 0) {
      let trimmed = "";
      for (const s of sentences) {
        if ((trimmed + " " + s).trim().split(/\s+/).filter(Boolean).length <= MAX_WORDS) {
          trimmed = (trimmed + " " + s).trim();
        } else {
          break;
        }
      }
      content = trimmed || words.slice(0, 18).join(" ") + "...";
    } else {
      content = words.slice(0, 18).join(" ") + "...";
    }
  }

  return content;
}
