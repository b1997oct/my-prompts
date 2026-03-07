import type { APIRoute } from "astro";
import { Prompt } from "@/models";

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const now = new Date();
    let payload: any;

    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object" || !payload.prompt || typeof payload.prompt !== "string") {
      return Response.json({ ok: false, error: "`prompt` (string) is required in body" }, { status: 400 });
    }

    const { prompt, source, ...rest } = payload;

    if (!locals.apiUserId) {
      return Response.json({ ok: false, error: "API Key required" }, { status: 401 });
    }

    const newPrompt = await Prompt.create({
      user: locals.apiUserId,
      prompt,
      source,
      tokenId: locals.apiTokenId,
      meta: Object.keys(rest).length > 0 ? rest : undefined,
    });

    return Response.json(
      { ok: true, promptId: newPrompt._id, createdAt: now.toISOString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/promt] Error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};

export const GET: APIRoute = async ({ locals }) => {
  try {
    if (!locals.apiUserId) {
      return Response.json({ ok: false, error: "API Key required" }, { status: 401 });
    }

    const prompts = await Prompt.find({ user: locals.apiUserId, is_delete: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(50);

    return Response.json({ ok: true, prompts });
  } catch (error: any) {
    console.error("[/api/promt] GET Error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};
