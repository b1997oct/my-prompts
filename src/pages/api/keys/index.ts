import type { APIRoute } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { User, ApiKey } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";
import crypto from "crypto";

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export const GET: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return json({ ok: false, error: "User not found" }, 404);
    }

    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const query: any = { user: user._id };

    if (status === "active") {
      query.isActive = true;
    } else if (status === "inactive") {
      query.isActive = false;
    }

    const keys = await ApiKey.find(query).sort({ createdAt: 1 });
    return json({ ok: true, keys });
  } catch (error: any) {
    return json({ ok: false, error: error.message }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ ok: false, error: "Unauthorized" }, 401);
    }

    const idToken = authHeader.slice("Bearer ".length).trim();
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;

    await connectToDatabase();
    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return json({ ok: false, error: "User not found" }, 404);
    }

    const apiKeyString = crypto.randomBytes(24).toString("hex");
    const newKey = await ApiKey.create({
      user: user._id,
      key: apiKeyString,
      isActive: true,
    });

    return json({ ok: true, key: newKey }, 201);
  } catch (error: any) {
    return json({ ok: false, error: error.message }, 500);
  }
};
