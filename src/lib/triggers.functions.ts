import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Input = z.object({
  workflowId: z.string().uuid(),
  provider: z.enum(["telegram", "github", "generic"]),
  credentialId: z.string().uuid().optional(),
  // GitHub-specific
  repo: z.string().optional(),
  events: z.array(z.string()).optional(),
});

export const registerInstantTrigger = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase } = context;

    const { data: wf, error: wfErr } = await supabase
      .from("workflows")
      .select("id,webhook_token,active")
      .eq("id", data.workflowId)
      .single();
    if (wfErr || !wf) throw new Error("Workflow não encontrado");

    const origin = process.env.PUBLIC_APP_URL
      || `https://project--${process.env.LOVABLE_PROJECT_ID ?? ""}.lovable.app`;
    const webhookUrl = `${origin}/api/public/wh/${(wf as any).webhook_token}`;

    if (data.provider === "telegram") {
      if (!data.credentialId) throw new Error("Selecione uma credencial Telegram");
      const { data: cred, error: cErr } = await supabase
        .from("credentials").select("data").eq("id", data.credentialId).single();
      if (cErr || !cred) throw new Error("Credencial não encontrada");
      const token = (cred.data as any)?.bot_token;
      if (!token) throw new Error("Credencial Telegram sem bot_token");
      const r = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, drop_pending_updates: true }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.description ?? "Falha ao registrar Telegram webhook");
      return { ok: true, provider: "telegram", url: webhookUrl, info: j };
    }

    if (data.provider === "github") {
      if (!data.credentialId) throw new Error("Selecione uma credencial GitHub");
      if (!data.repo || !/^[\w.-]+\/[\w.-]+$/.test(data.repo)) throw new Error("Repo inválido (use owner/name)");
      const { data: cred } = await supabase
        .from("credentials").select("data").eq("id", data.credentialId).single();
      const tok = (cred?.data as any)?.api_key || (cred?.data as any)?.token;
      if (!tok) throw new Error("Credencial GitHub sem token");
      const r = await fetch(`https://api.github.com/repos/${data.repo}/hooks`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${tok}`,
          accept: "application/vnd.github+json",
        },
        body: JSON.stringify({
          name: "web",
          active: true,
          events: data.events?.length ? data.events : ["push"],
          config: { url: webhookUrl, content_type: "json" },
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? "Falha ao registrar GitHub webhook");
      return { ok: true, provider: "github", url: webhookUrl, info: j };
    }

    return { ok: true, provider: "generic", url: webhookUrl };
  });
