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

export const DELETE: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ ok: false, error: "Authorization required" }, { status: 401 });
    }

    const token = authHeader.slice("Bearer ".length).trim();
    await connectToDatabase();

    let userId: any = null;
    try {
      // Try verifying as an ID token
      const decoded = await adminAuth.verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid });
      if (user) userId = user._id;
    } catch (err) {
      // Try verifying as an API key
      const apiKeyDoc = await ApiKey.findOne({ key: token });
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

    // Soft delete: set is_delete to true
    const result = await Prompt.findOneAndUpdate(
      { _id: id, user: userId },
      { is_delete: true },
      { new: true }
    );

    if (!result) {
      return jsonResponse({ ok: false, error: "Prompt not found or unauthorized" }, { status: 404 });
    }

    return jsonResponse({ ok: true, message: "Prompt deleted successfully" });
  } catch (error: any) {
    console.error("[/api/promt/[id]] DELETE Error:", error);
    return jsonResponse({ ok: false, error: error.message }, { status: 500 });
  }
};
