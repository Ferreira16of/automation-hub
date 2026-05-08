import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const NodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.record(z.string(), z.any()),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});
const EdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

const RunInput = z.object({
  workflowId: z.string().uuid(),
  triggerData: z.any().optional(),
});

type Node = z.infer<typeof NodeSchema>;
type Edge = z.infer<typeof EdgeSchema>;

interface LogEntry {
  nodeId: string;
  nodeType: string;
  status: "ok" | "error" | "skipped";
  output?: any;
  error?: string;
  durationMs: number;
}

function interpolate(template: string, ctx: Record<string, any>): string {
  return template.replace(/\{\{\s*([\w.[\]]+)\s*\}\}/g, (_, path: string) => {
    try {
      const val = path.split(".").reduce((o: any, k: string) => (o == null ? o : o[k]), ctx);
      return val == null ? "" : typeof val === "object" ? JSON.stringify(val) : String(val);
    } catch {
      return "";
    }
  });
}

function deepInterpolate(value: any, ctx: Record<string, any>): any {
  if (typeof value === "string") return interpolate(value, ctx);
  if (Array.isArray(value)) return value.map((v) => deepInterpolate(v, ctx));
  if (value && typeof value === "object") {
    const out: any = {};
    for (const k of Object.keys(value)) out[k] = deepInterpolate(value[k], ctx);
    return out;
  }
  return value;
}

async function runNode(
  node: Node,
  ctx: Record<string, any>,
  credentialsByProvider: Record<string, any>
): Promise<any> {
  const cfg = deepInterpolate(node.data?.config ?? {}, ctx);
  const cred = node.data?.credentialId ? credentialsByProvider[node.data.credentialId] : null;

  switch (node.type) {
    case "core.start":
    case "core.webhook":
    case "core.schedule":
      return ctx.$trigger ?? {};

    case "core.set": {
      const out: Record<string, any> = {};
      for (const item of cfg.items ?? []) out[item.key] = item.value;
      return out;
    }

    case "core.if": {
      const left = cfg.left;
      const right = cfg.right;
      const op = cfg.operator ?? "==";
      let pass = false;
      switch (op) {
        case "==": pass = String(left) === String(right); break;
        case "!=": pass = String(left) !== String(right); break;
        case "contains": pass = String(left).includes(String(right)); break;
        case "truthy": pass = !!left; break;
      }
      return { passed: pass };
    }

    case "core.code": {
      const code = String(cfg.code ?? "return $input;");
      // eslint-disable-next-line no-new-func
      const fn = new Function("$input", "$ctx", `"use strict"; ${code}`);
      const result = await fn(ctx.$last, ctx);
      return result;
    }

    case "core.http": {
      const url = String(cfg.url ?? "");
      if (!url) throw new Error("URL obrigatória");
      const method = String(cfg.method ?? "GET").toUpperCase();
      const headers: Record<string, string> = { ...(cfg.headers ?? {}) };
      let body: any = cfg.body;
      if (typeof body === "object") {
        headers["content-type"] ??= "application/json";
        body = JSON.stringify(body);
      }
      const r = await fetch(url, { method, headers, body: method === "GET" ? undefined : body });
      const text = await r.text();
      let parsed: any = text;
      try { parsed = JSON.parse(text); } catch {}
      if (!r.ok) throw new Error(`HTTP ${r.status}: ${text.slice(0, 200)}`);
      return parsed;
    }

    case "telegram": {
      if (!cred?.bot_token) throw new Error("Credencial Telegram ausente");
      const r = await fetch(`https://api.telegram.org/bot${cred.bot_token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: cfg.chat_id, text: cfg.text, parse_mode: cfg.parse_mode || undefined }),
      });
      const j = await r.json();
      if (!j.ok) throw new Error(j.description ?? "Erro Telegram");
      return j.result;
    }

    case "openai": {
      if (!cred?.api_key) throw new Error("Credencial OpenAI ausente");
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${cred.api_key}` },
        body: JSON.stringify({
          model: cfg.model ?? "gpt-4o-mini",
          messages: [
            ...(cfg.system ? [{ role: "system", content: cfg.system }] : []),
            { role: "user", content: cfg.prompt ?? "" },
          ],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? "Erro OpenAI");
      return { text: j.choices?.[0]?.message?.content, raw: j };
    }

    case "anthropic": {
      if (!cred?.api_key) throw new Error("Credencial Anthropic ausente");
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": cred.api_key, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: cfg.model ?? "claude-3-5-sonnet-latest",
          max_tokens: Number(cfg.max_tokens ?? 1024),
          system: cfg.system || undefined,
          messages: [{ role: "user", content: cfg.prompt ?? "" }],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? "Erro Anthropic");
      return { text: j.content?.[0]?.text, raw: j };
    }

    case "groq":
    case "deepseek":
    case "mistral":
    case "together": {
      if (!cred?.api_key) throw new Error("Credencial ausente");
      const baseUrls: Record<string, string> = {
        groq: "https://api.groq.com/openai/v1/chat/completions",
        deepseek: "https://api.deepseek.com/chat/completions",
        mistral: "https://api.mistral.ai/v1/chat/completions",
        together: "https://api.together.xyz/v1/chat/completions",
      };
      const defaults: Record<string, string> = {
        groq: "llama-3.3-70b-versatile",
        deepseek: "deepseek-chat",
        mistral: "mistral-small-latest",
        together: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
      };
      const r = await fetch(baseUrls[node.type], {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${cred.api_key}` },
        body: JSON.stringify({
          model: cfg.model ?? defaults[node.type],
          messages: [
            ...(cfg.system ? [{ role: "system", content: cfg.system }] : []),
            { role: "user", content: cfg.prompt ?? "" },
          ],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? `Erro ${node.type}`);
      return { text: j.choices?.[0]?.message?.content, raw: j };
    }

    case "google_ai": {
      if (!cred?.api_key) throw new Error("Credencial Google AI ausente");
      const model = cfg.model ?? "gemini-2.5-flash";
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cred.api_key}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          systemInstruction: cfg.system ? { parts: [{ text: cfg.system }] } : undefined,
          contents: [{ role: "user", parts: [{ text: cfg.prompt ?? "" }] }],
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error?.message ?? "Erro Gemini");
      return { text: j.candidates?.[0]?.content?.parts?.[0]?.text, raw: j };
    }

    case "resend": {
      if (!cred?.api_key) throw new Error("Credencial Resend ausente");
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${cred.api_key}` },
        body: JSON.stringify({
          from: cfg.from,
          to: Array.isArray(cfg.to) ? cfg.to : [cfg.to],
          subject: cfg.subject,
          html: cfg.html,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? "Erro Resend");
      return j;
    }

    case "sendgrid": {
      if (!cred?.api_key) throw new Error("Credencial SendGrid ausente");
      const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${cred.api_key}` },
        body: JSON.stringify({
          personalizations: [{ to: (Array.isArray(cfg.to) ? cfg.to : [cfg.to]).map((email: string) => ({ email })) }],
          from: { email: cfg.from },
          subject: cfg.subject,
          content: [{ type: "text/html", value: cfg.html ?? "" }],
        }),
      });
      if (!r.ok) throw new Error(`SendGrid HTTP ${r.status}: ${await r.text()}`);
      return { sent: true };
    }

    case "discord": {
      const webhook = cfg.webhook_url || cred?.webhook_url;
      if (!webhook) throw new Error("Webhook URL Discord ausente");
      const r = await fetch(webhook, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: cfg.content, username: cfg.username || undefined }),
      });
      if (!r.ok && r.status !== 204) throw new Error(`Discord HTTP ${r.status}`);
      return { sent: true };
    }

    case "openweather": {
      if (!cred?.api_key) throw new Error("Credencial OpenWeather ausente");
      const q = encodeURIComponent(cfg.city ?? "");
      const units = cfg.units ?? "metric";
      const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${q}&units=${units}&appid=${cred.api_key}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? "Erro OpenWeather");
      return j;
    }

    case "coingecko": {
      const ids = encodeURIComponent(cfg.ids ?? "bitcoin");
      const vs = encodeURIComponent(cfg.vs_currencies ?? "usd");
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=${vs}`);
      const j = await r.json();
      if (!r.ok) throw new Error("Erro CoinGecko");
      return j;
    }

    default:
      throw new Error(`Tipo de nó não suportado: ${node.type}`);
  }
}

export const runWorkflow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RunInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: wf, error } = await supabase
      .from("workflows")
      .select("id,nodes,edges")
      .eq("id", data.workflowId)
      .single();
    if (error || !wf) throw new Error("Workflow não encontrado");

    const nodes = (wf.nodes as any[]).map((n) => NodeSchema.parse(n));
    const edges = (wf.edges as any[]).map((e) => EdgeSchema.parse(e));

    // Load all credentials in single query
    const { data: creds } = await supabase.from("credentials").select("id,data");
    const credsById: Record<string, any> = {};
    for (const c of creds ?? []) credsById[c.id] = c.data;

    // Find start node
    const incoming = new Set(edges.map((e) => e.target));
    const start = nodes.find((n) => !incoming.has(n.id) && (n.type === "core.start" || n.type === "core.webhook" || n.type === "core.schedule" || !incoming.has(n.id)));
    if (!start) throw new Error("Nenhum nó inicial encontrado");

    const logs: LogEntry[] = [];
    const ctx: Record<string, any> = { $trigger: data.triggerData ?? {}, $nodes: {} };

    // Execution insert
    const { data: exec } = await supabase
      .from("executions")
      .insert({ workflow_id: wf.id, user_id: userId, status: "running" })
      .select("id")
      .single();

    let current: Node | undefined = start;
    let lastOutput: any = data.triggerData ?? {};
    let errorMsg: string | null = null;

    try {
      while (current) {
        const t0 = Date.now();
        ctx.$last = lastOutput;
        try {
          const out = await runNode(current, ctx, credsById);
          lastOutput = out;
          ctx.$nodes[current.id] = out;
          logs.push({ nodeId: current.id, nodeType: current.type, status: "ok", output: out, durationMs: Date.now() - t0 });
        } catch (e: any) {
          logs.push({ nodeId: current.id, nodeType: current.type, status: "error", error: e.message, durationMs: Date.now() - t0 });
          throw e;
        }

        // Pick next edge — for IF, choose by passed
        const out = ctx.$nodes[current.id];
        const outgoing = edges.filter((e) => e.source === current!.id);
        let nextEdge = outgoing[0];
        if (current.type === "core.if" && outgoing.length > 1) {
          // edges may be labeled via id suffix "true"/"false"
          const wanted = out?.passed ? "true" : "false";
          nextEdge = outgoing.find((e) => e.id.endsWith(wanted)) ?? outgoing[0];
        }
        current = nextEdge ? nodes.find((n) => n.id === nextEdge.target) : undefined;
      }
    } catch (e: any) {
      errorMsg = e.message ?? String(e);
    }

    const status = errorMsg ? "error" : "success";
    if (exec) {
      await supabase
        .from("executions")
        .update({ status, logs: logs as any, result: lastOutput as any, error: errorMsg, finished_at: new Date().toISOString() })
        .eq("id", exec.id);
    }

    return { status, logs, result: lastOutput, error: errorMsg };
  });
