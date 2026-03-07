import type { APIRoute } from "astro";
import { Prompt } from "@/models";

export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;
    if (!locals.apiUserId) {
      return Response.json({ ok: false, error: "API Key required" }, { status: 401 });
    }

    // Soft delete: set is_delete to true
    const result = await Prompt.findOneAndUpdate(
      { _id: id, user: locals.apiUserId },
      { is_delete: true },
      { new: true }
    );

    if (!result) {
      return Response.json({ ok: false, error: "Prompt not found or unauthorized" }, { status: 404 });
    }

    return Response.json({ ok: true, message: "Prompt deleted successfully" });
  } catch (error: any) {
    console.error("[/api/promt/[id]] DELETE Error:", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};
