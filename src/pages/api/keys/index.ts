import type { APIRoute } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { User, ApiKey } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";
import crypto from "crypto";

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "User not found" }), { status: 404 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const query: any = { user: user._id };
    
    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const keys = await ApiKey.find(query).sort({ createdAt: -1 });
    return new Response(JSON.stringify({ ok: true, keys }), { status: 200 });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), { status: 401 });
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return new Response(JSON.stringify({ ok: false, error: "User not found" }), { status: 404 });
    }

    const apiKeyString = crypto.randomBytes(24).toString("hex");
    const newKey = await ApiKey.create({
      user: user._id,
      key: apiKeyString,
      isActive: true,
    });

    return new Response(JSON.stringify({ ok: true, key: newKey }), { status: 201 });
  } catch (error: any) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), { status: 500 });
  }
};
