import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState,
  Node as RFNode, Edge as RFEdge, Connection, ReactFlowProvider, Handle, Position,
  MarkerType,
} from "reactflow";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { INTEGRATIONS, getIntegration, CATEGORIES } from "@/lib/integrations";
import { getIconInfo, getIconUrl } from "@/lib/integration-icons";
import { useServerFn } from "@tanstack/react-start";
import { runWorkflow } from "@/lib/engine.functions";
import { registerInstantTrigger } from "@/lib/triggers.functions";
import { toast } from "sonner";
import {
  Play, Save, ArrowLeft, Search, Plus, Trash2, Loader2, X, Power, PowerOff,
  Copy, Webhook, Clock, Check, AlertCircle, Activity, Zap, KeyRound,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/workflows/$id")({ component: EditorPage });

// ───────────────────────── helpers ─────────────────────────

function isTriggerType(t: string) {
  return t.startsWith("trigger.") || t === "core.start" || t === "core.webhook" || t === "core.schedule";
}

function NodeIcon({ type, size = 36 }: { type: string; size?: number }) {
  const info = getIconInfo(type);
  const url = getIconUrl(type);
  const [failed, setFailed] = useState(false);
  const bg = `#${info.color}`;
  if (url && !failed) {
    return (
      <div
        className="grid place-items-center rounded-lg shrink-0 border border-border/40"
        style={{ width: size, height: size, background: "color-mix(in oklch, white 6%, transparent)" }}
      >
        <img
          src={url}
          alt=""
          width={size * 0.6}
          height={size * 0.6}
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ filter: "drop-shadow(0 0 6px rgba(0,0,0,.4))" }}
        />
      </div>
    );
  }
  return (
    <div
      className="grid place-items-center rounded-lg shrink-0 font-bold text-white shadow-md"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36 }}
    >
      {info.label ?? type.slice(0, 2).toUpperCase()}
    </div>
  );
}

// ───────────────────────── Custom node ─────────────────────────

function FlowNode({ data, selected }: { data: any; selected: boolean }) {
  const integration = getIntegration(data.type);
  const isTrigger = isTriggerType(data.type);
  const status = data._status as undefined | "running" | "ok" | "error";
  const info = getIconInfo(data.type);
  const accent = `#${info.color}`;

  return (
    <div
      className={[
        "relative rounded-xl bg-card border w-[230px] overflow-hidden transition-all",
        selected ? "border-primary shadow-[0_0_0_2px_var(--color-primary),0_8px_24px_-6px_color-mix(in_oklch,var(--color-primary)_40%,transparent)]" : "border-border shadow-md hover:border-primary/40",
      ].join(" ")}
    >
      {/* accent stripe */}
      <div className="h-1" style={{ background: accent }} />

      {/* trigger wedge */}
      {isTrigger && (
        <div
          className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-5 h-5 rotate-45 border-l border-b border-border bg-card"
          aria-hidden
        />
      )}

      {/* handles */}
      {!isTrigger && <Handle type="target" position={Position.Left} id="in" />}
      <Handle type="source" position={Position.Right} id="out" />

      <div className="p-3 flex items-start gap-3">
        <NodeIcon type={data.type} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium truncate">
              {isTrigger ? "Trigger" : integration?.category ?? "Custom"}
            </span>
            {data.credentialId && (
              <span className="text-success" title="Credencial configurada">
                <KeyRound className="size-3" />
              </span>
            )}
          </div>
          <div className="font-semibold text-sm leading-tight truncate">
            {data.label ?? integration?.name ?? data.type}
          </div>
          {integration?.description && (
            <div className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-snug">
              {integration.description}
            </div>
          )}
        </div>
      </div>

      {/* status dot */}
      {status && (
        <div className="absolute top-2 right-2">
          {status === "running" && <Loader2 className="size-3.5 animate-spin text-primary" />}
          {status === "ok" && (
            <div className="size-3.5 rounded-full bg-success grid place-items-center">
              <Check className="size-2.5 text-background" strokeWidth={4} />
            </div>
          )}
          {status === "error" && (
            <div className="size-3.5 rounded-full bg-destructive grid place-items-center">
              <X className="size-2.5 text-white" strokeWidth={4} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };
const defaultEdgeOptions: Partial<RFEdge> = {
  type: "smoothstep",
  animated: true,
  style: { strokeWidth: 1.6 },
  markerEnd: { type: MarkerType.ArrowClosed },
};

// ───────────────────────── Page ─────────────────────────

function EditorPage() {
  const { id } = useParams({ from: "/_authenticated/workflows/$id" });
  const nav = useNavigate();
  const runFn = useServerFn(runWorkflow);

  const [name, setName] = useState("");
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selected, setSelected] = useState<RFNode | null>(null);
  const [credentials, setCredentials] = useState<{ id: string; provider: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<any[] | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState("");
  const [paletteCat, setPaletteCat] = useState<string>("All");
  const [active, setActive] = useState(false);
  const [scheduleCron, setScheduleCron] = useState<string>("");
  const [webhookToken, setWebhookToken] = useState<string>("");
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);
  const [recentRuns, setRecentRuns] = useState<{ status: string; trigger: string | null; started_at: string }[]>([]);
  const [triggersOpen, setTriggersOpen] = useState(false);
  const [registerProvider, setRegisterProvider] = useState<"telegram" | "github">("telegram");
  const [registerCredId, setRegisterCredId] = useState<string>("");
  const [registerRepo, setRegisterRepo] = useState<string>("");
  const [registering, setRegistering] = useState(false);
  const [pinging, setPinging] = useState(false);
  const registerFn = useServerFn(registerInstantTrigger);
  const idRef = useRef(1);

  const webhookUrl = useMemo(() => {
    if (!webhookToken || typeof window === "undefined") return "";
    return `${window.location.origin}/api/public/wh/${webhookToken}`;
  }, [webhookToken]);

  const loadRuns = useCallback(async () => {
    const { data: execs } = await supabase
      .from("executions")
      .select("status,trigger,started_at")
      .eq("workflow_id", id)
      .order("started_at", { ascending: false })
      .limit(10);
    setRecentRuns((execs as any) ?? []);
  }, [id]);

  useEffect(() => {
    (async () => {
      const [{ data: wf, error }, { data: creds }] = await Promise.all([
        supabase.from("workflows").select("*").eq("id", id).single(),
        supabase.from("credentials").select("id,provider,name"),
      ]);
      if (error || !wf) { toast.error("Workflow não encontrado"); nav({ to: "/dashboard" }); return; }
      setName(wf.name);
      setActive(!!(wf as any).active);
      setScheduleCron(((wf as any).schedule_cron as string | null) ?? "");
      setWebhookToken(((wf as any).webhook_token as string | null) ?? "");
      setLastRunAt(((wf as any).last_run_at as string | null) ?? null);
      const loadedNodes = (wf.nodes as any[]) ?? [];
      const loadedEdges = (wf.edges as any[]) ?? [];
      setNodes(loadedNodes.map((n) => ({ ...n, type: "flowNode" })));
      setEdges(loadedEdges.map((e: any) => ({ ...e, ...defaultEdgeOptions, type: "smoothstep", animated: true })));
      setCredentials(creds ?? []);
      if (loadedNodes.length === 0) {
        setNodes([{
          id: "trigger",
          type: "flowNode",
          position: { x: 120, y: 200 },
          data: { type: "trigger.manual", label: "Início manual", config: {} },
        }]);
      }
      idRef.current = loadedNodes.length + 2;
      await loadRuns();
      setLoading(false);
    })();
  }, [id]);

  // Realtime executions feed (background runs)
  useEffect(() => {
    const channel = supabase
      .channel(`executions:${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "executions", filter: `workflow_id=eq.${id}` }, () => {
        loadRuns();
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "workflows", filter: `id=eq.${id}` }, (p: any) => {
        if (p.new?.last_run_at) setLastRunAt(p.new.last_run_at);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, loadRuns]);

  const onConnect = useCallback(
    (c: Connection) => setEdges((eds) => addEdge({ ...c, ...defaultEdgeOptions, id: `${c.source}-${c.target}-${Date.now()}` }, eds)),
    [setEdges]
  );

  const addNode = (type: string, atPos?: { x: number; y: number }) => {
    const integration = getIntegration(type);
    const newNode: RFNode = {
      id: `n${idRef.current++}`,
      type: "flowNode",
      position: atPos ?? { x: 380 + Math.random() * 80, y: 220 + Math.random() * 80 },
      data: { type, label: integration?.name ?? type, config: {}, credentialId: null },
    };
    setNodes((nds) => [...nds, newNode]);
    setPaletteOpen(false);
    setPaletteSearch("");
  };

  const updateSelected = (patch: Partial<any>) => {
    if (!selected) return;
    setNodes((nds) => nds.map((n) => n.id === selected.id ? { ...n, data: { ...n.data, ...patch } } : n));
    setSelected((s) => s ? { ...s, data: { ...s.data, ...patch } } : s);
  };
  const updateConfig = (patch: Record<string, any>) => {
    updateSelected({ config: { ...(selected?.data.config ?? {}), ...patch } });
  };

  const deleteSelected = () => {
    if (!selected) return;
    setNodes((nds) => nds.filter((n) => n.id !== selected.id));
    setEdges((eds) => eds.filter((e) => e.source !== selected.id && e.target !== selected.id));
    setSelected(null);
  };

  const save = async () => {
    setSaving(true);
    const cleanNodes = nodes.map((n) => ({
      id: n.id,
      type: n.data.type,
      position: n.position,
      data: { ...n.data, _status: undefined },
    }));
    const cleanEdges = edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
    const { error } = await supabase
      .from("workflows")
      .update({
        name,
        nodes: cleanNodes as any,
        edges: cleanEdges as any,
        active,
        schedule_cron: scheduleCron.trim() ? scheduleCron.trim() : null,
      } as any)
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
  };

  const toggleActive = async (next: boolean) => {
    setActive(next);
    const { error } = await supabase.from("workflows").update({ active: next } as any).eq("id", id);
    if (error) { setActive(!next); toast.error(error.message); return; }
    toast.success(next ? "🟢 Ativo — rodando em segundo plano" : "Workflow desativado");
  };

  const copyWebhook = async () => {
    if (!webhookUrl) return;
    try { await navigator.clipboard.writeText(webhookUrl); toast.success("URL copiada"); }
    catch { toast.error("Falha ao copiar"); }
  };

  const setNodeStatus = (nodeId: string, st: "running" | "ok" | "error" | undefined) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, _status: st } } : n));
  };

  const run = async () => {
    await save();
    setRunning(true); setLogs(null);
    setNodes((nds) => nds.map((n) => ({ ...n, data: { ...n.data, _status: undefined } })));
    try {
      const res = await runFn({ data: { workflowId: id } });
      setLogs(res.logs);
      for (const l of res.logs) setNodeStatus(l.nodeId, l.status === "ok" ? "ok" : "error");
      if (res.status === "success") toast.success("Execução concluída");
      else toast.error(res.error ?? "Falha na execução");
      loadRuns();
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    } finally {
      setRunning(false);
    }
  };

  const filteredPalette = useMemo(() => {
    const q = paletteSearch.toLowerCase().trim();
    return INTEGRATIONS.filter((i) => {
      if (paletteCat !== "All" && i.category !== paletteCat) return false;
      if (!q) return true;
      return (
        i.name.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    });
  }, [paletteSearch, paletteCat]);

  // keyboard: '/' opens palette, Esc closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT","TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault(); setPaletteOpen(true);
      }
      if (e.key === "Escape") { setPaletteOpen(false); setSelected(null); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) return <AppShell><div className="p-10 text-muted-foreground">Carregando…</div></AppShell>;

  const successRate = recentRuns.length
    ? Math.round((recentRuns.filter((r) => r.status === "success").length / recentRuns.length) * 100)
    : null;

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem-3.75rem)] flex flex-col">
        {/* ───── Top bar ───── */}
        <div className="border-b border-border bg-card/60 backdrop-blur px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav({ to: "/dashboard" })}>
            <ArrowLeft className="size-4" />
          </Button>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm font-medium" />

          {/* status pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background/40 text-xs">
            <span className={`size-2 rounded-full ${active ? "bg-success animate-pulse" : "bg-muted-foreground/40"}`} />
            <span className="text-muted-foreground">{active ? "Em segundo plano" : "Pausado"}</span>
            {lastRunAt && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <span className="text-muted-foreground">última: {new Date(lastRunAt).toLocaleTimeString()}</span>
              </>
            )}
            {successRate !== null && (
              <>
                <span className="text-muted-foreground/40">·</span>
                <Activity className="size-3 text-primary" />
                <span className="font-mono">{successRate}%</span>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2 px-2 py-1 rounded-md border border-border">
              {active ? <Power className="size-3.5 text-success" /> : <PowerOff className="size-3.5 text-muted-foreground" />}
              <span className="text-xs text-muted-foreground hidden sm:inline">{active ? "Ativo" : "Inativo"}</span>
              <Switch checked={active} onCheckedChange={toggleActive} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setTriggersOpen((v) => !v)}>
              <Webhook className="size-4 mr-1" /> Triggers
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
              <Plus className="size-4 mr-1" /> Nó <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-muted hidden md:inline">/</span>
            </Button>
            <Button variant="outline" size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1" /> Salvar</>}
            </Button>
            <Button size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <><Play className="size-4 mr-1" /> Executar</>}
            </Button>
          </div>
        </div>

        {/* ───── Triggers panel ───── */}
        {triggersOpen && (
          <div className="border-b border-border bg-card/40 px-4 py-3 grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Webhook className="size-3.5" /> URL do Webhook (público)</Label>
              <div className="flex gap-2">
                <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                <Button type="button" variant="outline" size="sm" onClick={copyWebhook}><Copy className="size-4" /></Button>
                <Button
                  type="button" variant="outline" size="sm"
                  disabled={pinging || !webhookUrl}
                  onClick={async () => {
                    if (!active) { toast.error("Ative o workflow para receber triggers"); return; }
                    setPinging(true);
                    try {
                      const r = await fetch(webhookUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ test: true, at: new Date().toISOString() }) });
                      if (r.ok) toast.success("Trigger disparado");
                      else toast.error(`HTTP ${r.status}`);
                    } catch (e: any) { toast.error(e?.message ?? "Falha"); }
                    finally { setPinging(false); }
                  }}
                >
                  {pinging ? <Loader2 className="size-4 animate-spin" /> : <><Zap className="size-4 mr-1" /> Disparar</>}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Aceita GET/POST/PUT/DELETE. Dispara <strong>instantaneamente</strong> quando ativo.</p>

              <div className="pt-2 mt-2 border-t border-border space-y-2">
                <Label className="text-xs">Auto-registrar URL em…</Label>
                <div className="grid grid-cols-[120px_1fr_auto] gap-2">
                  <Select value={registerProvider} onValueChange={(v) => setRegisterProvider(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="telegram">Telegram</SelectItem>
                      <SelectItem value="github">GitHub</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={registerCredId} onValueChange={setRegisterCredId}>
                    <SelectTrigger><SelectValue placeholder="Credencial…" /></SelectTrigger>
                    <SelectContent>
                      {credentials.filter((c) => c.provider === registerProvider).map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button" size="sm" disabled={registering || !registerCredId || (registerProvider === "github" && !registerRepo)}
                    onClick={async () => {
                      setRegistering(true);
                      try {
                        const res = await registerFn({ data: { workflowId: id, provider: registerProvider, credentialId: registerCredId, repo: registerRepo || undefined } });
                        toast.success(`Registrado em ${res.provider}`);
                      } catch (e: any) { toast.error(e?.message ?? "Falha ao registrar"); }
                      finally { setRegistering(false); }
                    }}
                  >
                    {registering ? <Loader2 className="size-4 animate-spin" /> : "Registrar"}
                  </Button>
                </div>
                {registerProvider === "github" && (
                  <Input value={registerRepo} onChange={(e) => setRegisterRepo(e.target.value)} placeholder="owner/repo" className="text-xs" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock className="size-3.5" /> Agendamento (cron UTC)</Label>
              <div className="flex gap-2">
                <Input
                  value={scheduleCron}
                  onChange={(e) => setScheduleCron(e.target.value)}
                  placeholder="*/5 * * * *  (a cada 5 min)"
                  className="font-mono text-xs"
                />
                <Button type="button" variant="outline" size="sm" onClick={save}>Salvar</Button>
              </div>
              <p className="text-xs text-muted-foreground">5 campos: minuto hora dia mês dow. Verificado a cada minuto enquanto Ativo.</p>

              {recentRuns.length > 0 && (
                <div className="pt-2 mt-2 border-t border-border">
                  <Label className="text-xs flex items-center gap-2"><Activity className="size-3.5" /> Últimas execuções</Label>
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {recentRuns.map((r, i) => (
                      <div
                        key={i}
                        title={`${r.trigger ?? "manual"} · ${new Date(r.started_at).toLocaleString()}`}
                        className={`size-5 rounded ${
                          r.status === "success" ? "bg-success" :
                          r.status === "error" ? "bg-destructive" :
                          "bg-muted-foreground/40 animate-pulse"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ───── Canvas + Properties ───── */}
        <div className="flex-1 flex min-h-0">
          <div className="flex-1 relative">
            <ReactFlowProvider>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={(_, n) => setSelected(n)}
                onPaneClick={() => setSelected(null)}
                nodeTypes={nodeTypes}
                defaultEdgeOptions={defaultEdgeOptions}
                fitView
                proOptions={{ hideAttribution: true }}
              >
                <Background gap={24} size={1.2} color="var(--canvas-grid)" />
                <Controls showInteractive={false} />
                <MiniMap pannable zoomable maskColor="color-mix(in oklch, var(--color-background) 80%, transparent)" />
              </ReactFlow>

              {/* Floating add button */}
              <button
                onClick={() => setPaletteOpen(true)}
                className="absolute bottom-4 right-4 size-12 rounded-full bg-primary text-primary-foreground grid place-items-center shadow-lg luma-glow hover:scale-105 transition-transform"
                title="Adicionar nó (/)"
              >
                <Plus className="size-5" />
              </button>
            </ReactFlowProvider>
          </div>

          {selected && (
            <aside className="w-80 border-l border-border bg-card overflow-y-auto">
              <PropertiesPanel
                node={selected}
                credentials={credentials}
                onUpdateData={updateSelected}
                onUpdateConfig={updateConfig}
                onDelete={deleteSelected}
                onClose={() => setSelected(null)}
              />
            </aside>
          )}
        </div>

        {/* ───── Logs ───── */}
        {logs && (
          <div className="border-t border-border bg-card max-h-64 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm flex items-center gap-2"><Activity className="size-4" /> Logs de execução</h3>
              <button onClick={() => setLogs(null)}><X className="size-4" /></button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              {logs.map((l, i) => (
                <div key={i} className={`p-2 rounded border ${l.status === "ok" ? "bg-success/10 border-success/20" : "bg-destructive/10 border-destructive/20"}`}>
                  <div className="font-bold flex items-center gap-2">
                    {l.status === "ok" ? <Check className="size-3 text-success" /> : <AlertCircle className="size-3 text-destructive" />}
                    {l.nodeType} <span className="text-muted-foreground">({l.durationMs}ms)</span>
                  </div>
                  {l.error && <div className="text-destructive mt-1">{l.error}</div>}
                  {l.output != null && <pre className="text-muted-foreground overflow-x-auto mt-1">{JSON.stringify(l.output, null, 2).slice(0, 500)}</pre>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ───── Palette modal ───── */}
      {paletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={() => setPaletteOpen(false)}>
          <div className="bg-card border border-border rounded-2xl w-full max-w-4xl h-[78vh] overflow-hidden flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-border flex items-center gap-3">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={paletteSearch}
                onChange={(e) => setPaletteSearch(e.target.value)}
                placeholder="Buscar entre 180+ nós (ex: gpt, telegram, stripe…)"
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button onClick={() => setPaletteOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Categories */}
              <div className="w-48 border-r border-border overflow-y-auto p-2 shrink-0">
                {(["All", "Triggers", ...CATEGORIES] as string[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => setPaletteCat(c === "Triggers" ? "All" : c)}
                    className={`w-full text-left px-3 py-1.5 text-xs rounded-md mb-0.5 transition-colors ${
                      paletteCat === c || (c === "Triggers" && paletteSearch.startsWith("trigger"))
                        ? "bg-primary/15 text-foreground"
                        : "text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    {c === "Triggers" ? "⚡ Triggers" : c}
                  </button>
                ))}
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 content-start">
                {filteredPalette.length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-12 text-sm">
                    Nada encontrado para “{paletteSearch}”
                  </div>
                )}
                {filteredPalette.map((i) => (
                  <button
                    key={i.id}
                    onClick={() => addNode(i.id)}
                    className="text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all flex gap-3 items-start group"
                  >
                    <NodeIcon type={i.id} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{i.name}</span>
                        {i.id.startsWith("trigger.") && (
                          <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">trigger</span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-2 leading-snug">{i.description}</div>
                      <div className="text-[10px] text-muted-foreground/70 mt-0.5">{i.category}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

// ───────────────────────── Properties ─────────────────────────

function PropertiesPanel({
  node, credentials, onUpdateData, onUpdateConfig, onDelete, onClose,
}: {
  node: RFNode; credentials: { id: string; provider: string; name: string }[];
  onUpdateData: (p: any) => void; onUpdateConfig: (p: any) => void; onDelete: () => void; onClose: () => void;
}) {
  const type = node.data.type as string;
  const integration = getIntegration(type);
  const cfg = node.data.config ?? {};
  const filteredCreds = credentials.filter((c) => c.provider === type);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <NodeIcon type={type} size={40} />
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{integration?.category}</div>
            <h3 className="font-semibold truncate">{integration?.name ?? type}</h3>
            {integration?.description && (
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{integration.description}</p>
            )}
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
      </div>

      <div className="space-y-2">
        <Label>Rótulo</Label>
        <Input value={node.data.label ?? ""} onChange={(e) => onUpdateData({ label: e.target.value })} />
      </div>

      {integration?.fields.length ? (
        <div className="space-y-2">
          <Label>Credencial</Label>
          {filteredCreds.length === 0 ? (
            <p className="text-xs text-muted-foreground">Nenhuma credencial para {integration.name}. Crie em Credenciais.</p>
          ) : (
            <Select value={node.data.credentialId ?? ""} onValueChange={(v) => onUpdateData({ credentialId: v })}>
              <SelectTrigger><SelectValue placeholder="Selecione…" /></SelectTrigger>
              <SelectContent>
                {filteredCreds.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        </div>
      ) : null}

      {/* Per-type config */}
      {type === "core.http" && (
        <>
          <Field label="Método">
            <Select value={cfg.method ?? "GET"} onValueChange={(v) => onUpdateConfig({ method: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["GET","POST","PUT","PATCH","DELETE"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="URL"><Input value={cfg.url ?? ""} onChange={(e) => onUpdateConfig({ url: e.target.value })} placeholder="https://api.example.com/..." /></Field>
          <Field label="Body (JSON)">
            <Textarea rows={4} value={cfg.bodyText ?? ""} onChange={(e) => {
              const txt = e.target.value;
              let parsed: any = txt;
              try { parsed = JSON.parse(txt); } catch {}
              onUpdateConfig({ bodyText: txt, body: parsed });
            }} placeholder='{"key": "value"}' />
          </Field>
        </>
      )}

      {type === "core.set" && (
        <Field label="Itens (JSON array)">
          <Textarea rows={5} value={cfg.itemsText ?? ""} onChange={(e) => {
            const txt = e.target.value;
            let items: any[] = [];
            try { items = JSON.parse(txt); } catch {}
            onUpdateConfig({ itemsText: txt, items });
          }} placeholder='[{"key":"name","value":"World"}]' />
        </Field>
      )}

      {type === "core.if" && (
        <>
          <Field label="Esquerda"><Input value={cfg.left ?? ""} onChange={(e) => onUpdateConfig({ left: e.target.value })} /></Field>
          <Field label="Operador">
            <Select value={cfg.operator ?? "=="} onValueChange={(v) => onUpdateConfig({ operator: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["==","!=","contains","truthy"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Direita"><Input value={cfg.right ?? ""} onChange={(e) => onUpdateConfig({ right: e.target.value })} /></Field>
        </>
      )}

      {type === "core.code" && (
        <Field label="Código JavaScript (return)">
          <Textarea rows={8} className="font-mono text-xs" value={cfg.code ?? "return $input;"} onChange={(e) => onUpdateConfig({ code: e.target.value })} />
        </Field>
      )}

      {isTriggerType(type) && (
        <div className="rounded-md border border-border bg-muted/30 p-3 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5"><Zap className="size-3.5 text-primary" /> Como acionar</div>
          {type === "trigger.manual" && <p className="text-muted-foreground">Clique em <strong>Executar</strong> ou inicie por outro workflow.</p>}
          {(type === "trigger.webhook" || type === "core.webhook") && <p className="text-muted-foreground">Use a URL pública em <strong>Triggers</strong>. Aceita GET/POST/PUT/DELETE.</p>}
          {(type === "trigger.schedule" || type === "core.schedule") && <p className="text-muted-foreground">Defina o cron em <strong>Triggers</strong> e ative o workflow.</p>}
          {type === "trigger.telegram" && <p className="text-muted-foreground">Em <strong>Triggers</strong>, registre a URL no bot via setWebhook (auto).</p>}
          {type === "trigger.github" && <p className="text-muted-foreground">Em <strong>Triggers</strong>, auto-registre webhook no repo (push/PR/issue).</p>}
          {type === "trigger.stripe" && <p className="text-muted-foreground">Em Stripe → Webhooks, cole a URL pública.</p>}
          {type === "trigger.discord" && <p className="text-muted-foreground">Em Server Settings → Integrations → Webhooks, cole a URL.</p>}
          {type === "trigger.slack" && <p className="text-muted-foreground">Em Slack App → Event Subscriptions, cole a URL.</p>}
          {type === "trigger.shopify" && <p className="text-muted-foreground">Em Shopify Admin → Settings → Notifications → Webhooks.</p>}
          {(type === "trigger.calendly" || type === "trigger.typeform" || type === "trigger.airtable" || type === "trigger.notion" || type === "trigger.gmail" || type === "trigger.email" || type === "trigger.form") && (
            <p className="text-muted-foreground">Configure o webhook do provedor com a URL pública gerada em <strong>Triggers</strong>.</p>
          )}
          <p className="text-muted-foreground/70">Acesse os dados via <code className="bg-muted px-1 rounded">{`{{$trigger.body.campo}}`}</code>.</p>
        </div>
      )}

      {type === "telegram" && (
        <>
          <Field label="Chat ID"><Input value={cfg.chat_id ?? ""} onChange={(e) => onUpdateConfig({ chat_id: e.target.value })} /></Field>
          <Field label="Mensagem"><Textarea rows={3} value={cfg.text ?? ""} onChange={(e) => onUpdateConfig({ text: e.target.value })} /></Field>
        </>
      )}

      {type === "openai" && (
        <>
          <Field label="Modelo"><Input value={cfg.model ?? "gpt-4o-mini"} onChange={(e) => onUpdateConfig({ model: e.target.value })} /></Field>
          <Field label="System (opcional)"><Textarea rows={2} value={cfg.system ?? ""} onChange={(e) => onUpdateConfig({ system: e.target.value })} /></Field>
          <Field label="Prompt"><Textarea rows={4} value={cfg.prompt ?? ""} onChange={(e) => onUpdateConfig({ prompt: e.target.value })} /></Field>
        </>
      )}

      {type === "resend" && (
        <>
          <Field label="From"><Input value={cfg.from ?? ""} onChange={(e) => onUpdateConfig({ from: e.target.value })} placeholder="Nome <onboarding@resend.dev>" /></Field>
          <Field label="To"><Input value={cfg.to ?? ""} onChange={(e) => onUpdateConfig({ to: e.target.value })} /></Field>
          <Field label="Subject"><Input value={cfg.subject ?? ""} onChange={(e) => onUpdateConfig({ subject: e.target.value })} /></Field>
          <Field label="HTML"><Textarea rows={4} value={cfg.html ?? ""} onChange={(e) => onUpdateConfig({ html: e.target.value })} /></Field>
        </>
      )}

      {(type === "anthropic" || type === "groq" || type === "deepseek" || type === "mistral" || type === "together" || type === "google_ai") && (
        <>
          <Field label="Modelo"><Input value={cfg.model ?? ""} onChange={(e) => onUpdateConfig({ model: e.target.value })} placeholder="ex: claude-3-5-sonnet-latest" /></Field>
          <Field label="System (opcional)"><Textarea rows={2} value={cfg.system ?? ""} onChange={(e) => onUpdateConfig({ system: e.target.value })} /></Field>
          <Field label="Prompt"><Textarea rows={4} value={cfg.prompt ?? ""} onChange={(e) => onUpdateConfig({ prompt: e.target.value })} /></Field>
        </>
      )}

      {type === "sendgrid" && (
        <>
          <Field label="From"><Input value={cfg.from ?? ""} onChange={(e) => onUpdateConfig({ from: e.target.value })} /></Field>
          <Field label="To"><Input value={cfg.to ?? ""} onChange={(e) => onUpdateConfig({ to: e.target.value })} /></Field>
          <Field label="Subject"><Input value={cfg.subject ?? ""} onChange={(e) => onUpdateConfig({ subject: e.target.value })} /></Field>
          <Field label="HTML"><Textarea rows={4} value={cfg.html ?? ""} onChange={(e) => onUpdateConfig({ html: e.target.value })} /></Field>
        </>
      )}

      {type === "discord" && (
        <>
          <Field label="Webhook URL (opcional)"><Input value={cfg.webhook_url ?? ""} onChange={(e) => onUpdateConfig({ webhook_url: e.target.value })} /></Field>
          <Field label="Username (opcional)"><Input value={cfg.username ?? ""} onChange={(e) => onUpdateConfig({ username: e.target.value })} /></Field>
          <Field label="Mensagem"><Textarea rows={3} value={cfg.content ?? ""} onChange={(e) => onUpdateConfig({ content: e.target.value })} /></Field>
        </>
      )}

      {type === "openweather" && (
        <>
          <Field label="Cidade"><Input value={cfg.city ?? ""} onChange={(e) => onUpdateConfig({ city: e.target.value })} placeholder="São Paulo,BR" /></Field>
          <Field label="Unidades">
            <Select value={cfg.units ?? "metric"} onValueChange={(v) => onUpdateConfig({ units: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{["metric","imperial","standard"].map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
        </>
      )}

      {type === "coingecko" && (
        <>
          <Field label="IDs"><Input value={cfg.ids ?? "bitcoin"} onChange={(e) => onUpdateConfig({ ids: e.target.value })} placeholder="bitcoin,ethereum" /></Field>
          <Field label="Moedas (vs)"><Input value={cfg.vs_currencies ?? "usd"} onChange={(e) => onUpdateConfig({ vs_currencies: e.target.value })} /></Field>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        Use <code className="bg-muted px-1 rounded">{`{{$last.campo}}`}</code> ou <code className="bg-muted px-1 rounded">{`{{$nodes.id.campo}}`}</code> para referenciar dados.
      </p>

      <Button variant="destructive" size="sm" onClick={onDelete} className="w-full"><Trash2 className="size-4 mr-1" /> Excluir nó</Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}</div>;
}
