import type { APIRoute } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { User, ApiKey } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const { isActive } = await request.json();

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return json({ ok: false, error: "User not found" }, 404);
    }

    const result = await ApiKey.findOneAndUpdate(
      { _id: id, user: user._id },
      { isActive },
      { new: true }
    );

    if (!result) {
      return json({ ok: false, error: "API Key not found or unauthorized" }, 404);
    }

    return json({ ok: true, key: result });
  } catch (error: any) {
    return json({ ok: false, error: error.message }, 500);
  }
};
