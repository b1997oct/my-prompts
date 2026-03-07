import type { APIRoute } from "astro";
import { ApiKey } from "@/models";

export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    if (!locals.apiUserId) {
      return Response.json({ ok: false, error: "API Key required" }, { status: 401 });
    }

    const { isActive } = await request.json();
    const result = await ApiKey.findOneAndUpdate(
      { _id: id, user: locals.apiUserId },
      { isActive },
      { new: true }
    );

    if (!result) {
      return Response.json({ ok: false, error: "API Key not found or unauthorized" }, { status: 404 });
    }

    return Response.json({ ok: true, key: result });
  } catch (error: any) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};
