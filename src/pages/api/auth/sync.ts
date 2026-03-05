import type { APIRoute } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { User } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email } = decodedToken;

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { firebaseUid: uid },
      { 
        email, 
        lastLogin: new Date().toISOString(),
      },
      { upsert: true, new: true }
    );

    return new Response(JSON.stringify({ ok: true, user }), { status: 200 });
  } catch (error: any) {
    console.error("[Sync User Error]", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
};
