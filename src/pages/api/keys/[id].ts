import type { APIRoute } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { User, ApiKey } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";

export const PATCH: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const { isActive } = await request.json();

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "User not found" }), { status: 404 });
    }

    const result = await ApiKey.findOneAndUpdate(
      { _id: id, user: user._id },
      { isActive },
      { new: true }
    );
    
    if (!result) {
      return new Response(JSON.stringify({ ok: false, error: "API Key not found or unauthorized" }), { status: 404 });
    }

    return new Response(JSON.stringify({ ok: true, key: result }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
};
