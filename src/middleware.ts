import type { MiddlewareHandler } from "astro";
import connectToDatabase from "@/lib/mongodb/connect";
import { ApiKey } from "@/models";
import { adminAuth } from "@/server/firebaseAdmin";

const json = (body: object, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  return authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : authHeader.trim();
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { pathname } = context.url;

  if (!pathname.startsWith("/api/")) {
    return next();
  }

  await connectToDatabase();

  const authHeader = context.request.headers.get("Authorization");
  const token = extractToken(authHeader);

  if (pathname === "/api/auth/sync") {

    try {
      console.log("token", token);
      const decoded = await adminAuth.verifyIdToken(token);
      context.locals.email = String(decoded.email);
      
    } catch (error) {
      console.log("error", error);
      return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    return next();
  }

  if (pathname.startsWith("/api/keys") || pathname.startsWith("/api/promt")) {
    if (!token) {
      return json({ ok: false, error: "API Key required" }, 401);
    }

    const apiKeyDoc = await ApiKey.findOne({ key: token });
    if (!apiKeyDoc) {
      return json({ ok: false, error: "Invalid API Key" }, 401);
    }

    if (!apiKeyDoc.isActive) {
      return json({ ok: false, error: "API Key is not active" }, 403);
    }

    context.locals.apiUserId = String(apiKeyDoc.user);
    context.locals.apiTokenId = `key_${apiKeyDoc._id}`;
  }

  return next();
};
