import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { executeWorkflow, cronMatches } from "@/lib/engine-core.server";

async function tick() {
  const now = new Date();
  const { data: workflows } = await supabaseAdmin
    .from("workflows")
    .select("id,nodes,edges,user_id,schedule_cron,last_run_at")
    .eq("active", true)
    .not("schedule_cron", "is", null);

  const ran: any[] = [];
  for (const wf of workflows ?? []) {
    const cron = (wf as any).schedule_cron as string | null;
    if (!cron) continue;
    // de-dupe within same minute
    const last = (wf as any).last_run_at ? new Date((wf as any).last_run_at) : null;
    if (last && Math.floor(last.getTime() / 60000) === Math.floor(now.getTime() / 60000)) continue;
    if (!cronMatches(cron, now)) continue;

    try {
      const result = await executeWorkflow({
        supabase: supabaseAdmin as any,
        workflowId: (wf as any).id,
        userId: (wf as any).user_id,
        trigger: "schedule",
        triggerData: { firedAt: now.toISOString() },
        workflow: wf as any,
        filterCredentialsByUser: true,
      });
      await supabaseAdmin
        .from("workflows")
        .update({ last_run_at: now.toISOString() })
        .eq("id", (wf as any).id);
      ran.push({ id: (wf as any).id, status: result.status });
    } catch (e: any) {
      ran.push({ id: (wf as any).id, status: "error", error: e?.message });
    }
  }
  return { now: now.toISOString(), checked: workflows?.length ?? 0, ran };
}

export const Route = createFileRoute("/api/public/scheduler/tick")({
  server: {
    handlers: {
      GET: async () => Response.json(await tick()),
      POST: async () => Response.json(await tick()),
    },
  },
});
