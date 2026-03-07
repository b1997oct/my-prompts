import type { APIRoute } from "astro";
import { ApiKey } from "@/models";
import crypto from "crypto";

export const GET: APIRoute = async ({ request, locals }) => {
  try {
    if (!locals.apiUserId) {
      return Response.json({ ok: false, error: "API Key required" }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const query: any = { user: locals.apiUserId };

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const keys = await ApiKey.find(query).sort({ createdAt: 1 });
    return Response.json({ ok: true, keys });
  } catch (error: any) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ locals }) => {
  try {
    if (!locals.apiUserId) {
      return Response.json({ ok: false, error: "API Key required" }, { status: 401 });
    }

    const apiKeyString = crypto.randomBytes(24).toString("hex");
    const newKey = await ApiKey.create({
      user: locals.apiUserId,
      key: apiKeyString,
      isActive: true,
    });

    return Response.json({ ok: true, key: newKey }, { status: 201 });
  } catch (error: any) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};
