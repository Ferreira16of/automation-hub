import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { executeWorkflow } from "@/lib/engine-core.server";

async function handle(request: Request, token: string) {
  if (!/^[0-9a-f-]{36}$/i.test(token)) {
    return new Response("Invalid token", { status: 400 });
  }
  const { data: wf } = await supabaseAdmin
    .from("workflows")
    .select("id,nodes,edges,user_id,active")
    .eq("webhook_token", token)
    .maybeSingle();
  if (!wf) return new Response("Not found", { status: 404 });
  if (!wf.active) return new Response("Workflow inactive", { status: 403 });

  let triggerData: any = {};
  try {
    const url = new URL(request.url);
    const query: Record<string, string> = {};
    url.searchParams.forEach((v, k) => { query[k] = v; });
    let body: any = null;
    if (request.method !== "GET" && request.method !== "HEAD") {
      const ct = request.headers.get("content-type") ?? "";
      if (ct.includes("application/json")) {
        body = await request.json().catch(() => null);
      } else {
        body = await request.text().catch(() => null);
      }
    }
    triggerData = { method: request.method, query, body };
  } catch {}

  const result = await executeWorkflow({
    supabase: supabaseAdmin as any,
    workflowId: wf.id,
    userId: wf.user_id,
    trigger: "webhook",
    triggerData,
    workflow: wf as any,
    filterCredentialsByUser: true,
  });

  await supabaseAdmin
    .from("workflows")
    .update({ last_run_at: new Date().toISOString() })
    .eq("id", wf.id);

  return new Response(JSON.stringify(result), {
    status: result.status === "error" ? 500 : 200,
    headers: { "content-type": "application/json" },
  });
}

export const Route = createFileRoute("/api/public/wh/$token")({
  server: {
    handlers: {
      GET: async ({ request, params }) => handle(request, params.token),
      POST: async ({ request, params }) => handle(request, params.token),
      PUT: async ({ request, params }) => handle(request, params.token),
      DELETE: async ({ request, params }) => handle(request, params.token),
    },
  },
});
