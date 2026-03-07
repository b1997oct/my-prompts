import type { APIRoute } from "astro";
import { Prompt, ApiKey } from "@/models";
import connectToDatabase from "@/lib/mongodb/connect";

export const GET: APIRoute = async ({ url }) => {
    try {
        // Get token from URL parameter
        const token = url.searchParams.get("token");

        if (!token) {
            return new Response("Error: Token is required in the URL (?token=YOUR_TOKEN)", {
                status: 401,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // Connect to database
        await connectToDatabase();

        // Find the API key and associated user
        const apiKeyDoc = await ApiKey.findOne({ key: token });
        if (!apiKeyDoc || !apiKeyDoc.isActive) {
            return new Response("Error: Invalid or inactive API Key", {
                status: 403,
                headers: { "Content-Type": "text/plain" }
            });
        }

        // Fetch all prompts for this user (excluding soft-deleted ones)
        const prompts = await Prompt.find({
            user: apiKeyDoc.user,
            is_delete: { $ne: true }
        }).sort({ createdAt: -1 });

        // Generate XML content
        const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<prompts_export>
  <user_id>${apiKeyDoc.user}</user_id>
  <total_count>${prompts.length}</total_count>
  <generated_at>${new Date().toISOString()}</generated_at>
  <prompts>
${prompts
                .map(
                    (p) => `    <prompt>
      <id>${p._id}</id>
      <content><![CDATA[${p.prompt}]]></content>
      <source>${p.source || ""}</source>
      <tokenId>${p.tokenId || ""}</tokenId>
      <createdAt>${p.createdAt.toISOString()}</createdAt>
      ${p.meta ? `<meta>${JSON.stringify(p.meta)}</meta>` : ""}
    </prompt>`
                )
                .join("\n")}
  </prompts>
</prompts_export>`;

        // Return as XML file with download hint
        return new Response(xmlContent, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Content-Disposition": 'attachment; filename="prompts-export.xml"'
            },
        });
    } catch (error: any) {
        console.error("[/prompts-data.xml] Export Error:", error);
        return new Response(`Internal Server Error: ${error.message}`, {
            status: 500,
            headers: { "Content-Type": "text/plain" }
        });
    }
};
