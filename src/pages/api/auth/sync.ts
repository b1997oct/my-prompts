import type { APIRoute } from "astro";
import { ApiKey, User } from "@/models";
import crypto from "crypto";

export const POST: APIRoute = async ({ locals }) => {
  try {
    if (!locals.email) {
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOneAndUpdate(
      { email: locals.email },
      {
        email: locals.email,
        lastLogin: new Date().toISOString(),
      },
      { upsert: true, new: true }
    );

    let token = await ApiKey.findOne({ user: user._id });
    if (!token) {
      const newKey = await ApiKey.create({ user: user._id, key: crypto.randomBytes(24).toString("hex") });
      token = newKey;
    }

    return Response.json({ ok: true, user, token: token.key }, { status: 200 });
  } catch (error: any) {
    console.error("[Sync User Error]", error);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
};
