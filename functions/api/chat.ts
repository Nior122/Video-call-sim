import { generatePersonaResponse } from "../../src/lib/ai/provider";

export async function onRequestPost({ request, env }: any) {
  try {
    const body = await request.json();
    const { messages, persona, isVoiceMode, userName } = body;

    if (!messages || !persona) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Optional admin security logic
    if (env.ADMIN_SECRET && env.ADMIN_SECRET.length > 0) {
      const authHeader = request.headers.get("Authorization");
      if (!authHeader || authHeader !== `Bearer ${env.ADMIN_SECRET}`) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    const { content, provider } = await generatePersonaResponse({
      persona,
      messages,
      envOverride: env
    });

    return new Response(JSON.stringify({ response: content, provider }), {
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
