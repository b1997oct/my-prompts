import type { APIRoute } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { User, ApiKey, Prompt } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";

// Helper to build JSON responses
function jsonResponse(body: unknown, init?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: init?.status ?? 200,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const now = new Date();
    let payload: any;

    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!payload || typeof payload !== "object" || !payload.prompt || typeof payload.prompt !== "string") {
      return jsonResponse({ ok: false, error: "`prompt` (string) is required in body" }, { status: 400 });
    }

    const { prompt, source, ...rest } = payload;

    // Resolve user via ID token or API Key
    const authHeader = request.headers.get("Authorization");
    let userId: any = null;

    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ ok: false, error: "Authorization required" }, { status: 401 });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    await connectToDatabase();

    let tokenId = "session"; // Default for ID tokens

    try {
      // 1. Try verifying as an ID token
      const decoded = await adminAuth.verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (user) userId = user._id;
    } catch (err) {
      // 2. Try verifying as an API key
      const apiKeyDoc = await ApiKey.findOne({ key: token });
      if (apiKeyDoc) {
        if (!apiKeyDoc.isActive) {
          return jsonResponse({ ok: false, error: "API Key is not active" }, { status: 403 });
        }
        userId = apiKeyDoc.user;
        tokenId = `key_${apiKeyDoc._id}`; // Store the API key's internal ID
      }
    }

    if (!userId) {
      return jsonResponse({ ok: false, error: "Invalid authentication token" }, { status: 401 });
    }

    const newPrompt = await Prompt.create({
      user: userId,
      prompt,
      source,
      tokenId,
      meta: Object.keys(rest).length > 0 ? rest : undefined,
    });

    return jsonResponse(
      { ok: true, promptId: newPrompt._id, createdAt: now.toISOString() },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[/api/promt] Error:", error);
    return jsonResponse({ ok: false, error: error.message }, { status: 500 });
  }
};

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ ok: false, error: "Authorization required" }, { status: 401 });
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    await connectToDatabase();

    let userId: any = null;
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (user) userId = user._id;
    } catch (err) {
      // If it's a dashboard fetch, it should be an ID token.
      // But we can also support API key for consistency.
      const apiKeyDoc = await ApiKey.findOne({ key: idToken });
      if (apiKeyDoc) {
        if (!apiKeyDoc.isActive) {
          return jsonResponse({ ok: false, error: "API Key is not active" }, { status: 403 });
        }
        userId = apiKeyDoc.user;
      }
    }

    if (!userId) {
      return jsonResponse({ ok: false, error: "Invalid authentication token" }, { status: 401 });
    }

    const prompts = await Prompt.find({ user: userId, is_delete: { $ne: true } }).sort({ createdAt: -1 }).limit(50);

    return jsonResponse({ ok: true, prompts });
  } catch (error: any) {
    console.error("[/api/promt] GET Error:", error);
    return jsonResponse({ ok: false, error: error.message }, { status: 500 });
  }
};
