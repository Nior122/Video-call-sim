import { generatePersonaResponse } from "../../src/lib/ai/provider";

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();
    const { message, history, personaId, persona } = body;

    if (!message) {
      return new Response(JSON.stringify({ error: "Missing required message field" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Map history to the format expected by provider
    const formattedMessages = Array.isArray(history) ? history : [];
    formattedMessages.push({ role: "user", content: message });

    // Try to get persona from body, or construct a generic one if missing
    // In CallSession.tsx, only personaId is sent, so we must mock a base persona object
    // to pass into generatePersonaResponse (which expects a Persona object for system prompts).
    const fallbackPersona = persona || {
      id: personaId || "unknown",
      name: "Dream Babe",
      slug: "dream-babe",
      systemPrompt: "You are a friendly, flirty persona named Dream Babe. You respond naturally, like a human, and keep answers short (1-2 sentences maximum, never generate essays).",
      profileImage: "",
      headerImage: "",
      description: "A fun, flirty companion",
      isLive: true,
      age: 21,
      occupations: [],
      hobbies: [],
      personalityTraits: [],
      profileGallery: []
    };

    const { content, provider } = await generatePersonaResponse({
      persona: fallbackPersona,
      messages: formattedMessages,
      envOverride: env
    });

    // Note: CallSession.tsx expects the response text in `data.message`
    return new Response(JSON.stringify({ message: content, provider }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Failed to generate AI response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
