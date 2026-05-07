import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useEdgesState, useNodesState,
  Node as RFNode, Edge as RFEdge, Connection, ReactFlowProvider, Handle, Position,
} from "reactflow";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { INTEGRATIONS, getIntegration } from "@/lib/integrations";
import { useServerFn } from "@tanstack/react-start";
import { runWorkflow } from "@/lib/engine.functions";
import { toast } from "sonner";
import { Play, Save, ArrowLeft, Search, Plus, Trash2, Loader2, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/workflows/$id")({ component: EditorPage });

const NODE_TYPES_INFO: Record<string, { color: string }> = {
  "core.start": { color: "bg-success" },
  "core.webhook": { color: "bg-accent" },
  "core.schedule": { color: "bg-accent" },
  "core.http": { color: "bg-primary" },
  "core.code": { color: "bg-primary" },
  "core.set": { color: "bg-primary" },
  "core.if": { color: "bg-warning" },
};

function FlowNode({ data, selected }: { data: any; selected: boolean }) {
  const integration = getIntegration(data.type);
  const color = NODE_TYPES_INFO[data.type]?.color ?? "bg-primary";
  return (
    <div className={`rounded-xl border bg-card shadow-sm min-w-[180px] ${selected ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
      <Handle type="target" position={Position.Left} />
      <div className="p-3 flex items-center gap-2">
        <div className={`size-8 rounded-md ${color} grid place-items-center text-primary-foreground font-bold text-xs`}>
          {(integration?.name ?? data.type).slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">{integration?.category ?? "Core"}</div>
          <div className="font-semibold text-sm truncate">{data.label ?? integration?.name ?? data.type}</div>
        </div>
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
}

const nodeTypes = { flowNode: FlowNode };

function EditorPage() {
  const { id } = useParams({ from: "/_authenticated/workflows/$id" });
  const { user } = useAuth();
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
  const idRef = useRef(1);

  useEffect(() => {
    (async () => {
      const [{ data: wf, error }, { data: creds }] = await Promise.all([
        supabase.from("workflows").select("*").eq("id", id).single(),
        supabase.from("credentials").select("id,provider,name"),
      ]);
      if (error || !wf) { toast.error("Workflow não encontrado"); nav({ to: "/dashboard" }); return; }
      setName(wf.name);
      const loadedNodes = (wf.nodes as any[]) ?? [];
      const loadedEdges = (wf.edges as any[]) ?? [];
      setNodes(loadedNodes.map((n) => ({ ...n, type: "flowNode" })));
      setEdges(loadedEdges);
      setCredentials(creds ?? []);
      // bootstrap with start node if empty
      if (loadedNodes.length === 0) {
        setNodes([{
          id: "start", type: "flowNode", position: { x: 100, y: 200 },
          data: { type: "core.start", label: "Início", config: {} },
        }]);
      }
      idRef.current = loadedNodes.length + 2;
      setLoading(false);
    })();
  }, [id]);

  const onConnect = useCallback((c: Connection) => setEdges((eds) => addEdge({ ...c, id: `${c.source}-${c.target}-${Date.now()}` }, eds)), [setEdges]);

  const addNode = (type: string) => {
    const integration = getIntegration(type);
    const newNode: RFNode = {
      id: `n${idRef.current++}`,
      type: "flowNode",
      position: { x: 350 + Math.random() * 100, y: 200 + Math.random() * 100 },
      data: { type, label: integration?.name ?? type, config: {}, credentialId: null },
    };
    setNodes((nds) => [...nds, newNode]);
    setPaletteOpen(false);
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
    const cleanNodes = nodes.map((n) => ({ id: n.id, type: n.data.type, position: n.position, data: n.data }));
    const cleanEdges = edges.map((e) => ({ id: e.id, source: e.source, target: e.target }));
    const { error } = await supabase
      .from("workflows")
      .update({ name, nodes: cleanNodes, edges: cleanEdges })
      .eq("id", id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
  };

  const run = async () => {
    await save();
    setRunning(true); setLogs(null);
    try {
      const res = await runFn({ data: { workflowId: id } });
      setLogs(res.logs);
      if (res.status === "success") toast.success("Execução concluída");
      else toast.error(res.error ?? "Falha na execução");
    } catch (e: any) {
      toast.error(e.message ?? "Erro");
    } finally {
      setRunning(false);
    }
  };

  const filteredPalette = useMemo(() => INTEGRATIONS.filter((i) =>
    i.name.toLowerCase().includes(paletteSearch.toLowerCase())
  ), [paletteSearch]);

  if (loading) return <AppShell><div className="p-10 text-muted-foreground">Carregando…</div></AppShell>;

  return (
    <AppShell>
      <div className="h-[calc(100vh-3.5rem-3.75rem)] flex flex-col">
        <div className="border-b border-border bg-card/50 px-4 py-2 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => nav({ to: "/dashboard" })}>
            <ArrowLeft className="size-4" />
          </Button>
          <Input value={name} onChange={(e) => setName(e.target.value)} className="max-w-sm font-medium" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPaletteOpen(true)}>
              <Plus className="size-4 mr-1" /> Nó
            </Button>
            <Button variant="outline" size="sm" onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 animate-spin" /> : <><Save className="size-4 mr-1" /> Salvar</>}
            </Button>
            <Button size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="size-4 animate-spin" /> : <><Play className="size-4 mr-1" /> Executar</>}
            </Button>
          </div>
        </div>

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
                fitView
              >
                <Background gap={20} color="var(--canvas-grid)" />
                <Controls />
                <MiniMap pannable zoomable />
              </ReactFlow>
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

        {logs && (
          <div className="border-t border-border bg-card max-h-64 overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-sm">Logs de execução</h3>
              <button onClick={() => setLogs(null)}><X className="size-4" /></button>
            </div>
            <div className="space-y-2 text-xs font-mono">
              {logs.map((l, i) => (
                <div key={i} className={`p-2 rounded ${l.status === "ok" ? "bg-success/10" : "bg-destructive/10"}`}>
                  <div className="font-bold">{l.nodeType} ({l.durationMs}ms)</div>
                  {l.error && <div className="text-destructive">{l.error}</div>}
                  {l.output != null && <pre className="text-muted-foreground overflow-x-auto">{JSON.stringify(l.output, null, 2).slice(0, 500)}</pre>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {paletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setPaletteOpen(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[70vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 border-b border-border flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              <input autoFocus value={paletteSearch} onChange={(e) => setPaletteSearch(e.target.value)} placeholder="Buscar nó…" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredPalette.map((i) => (
                <button key={i.id} onClick={() => addNode(i.id)} className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-secondary/40 transition-colors">
                  <div className="text-xs text-muted-foreground">{i.category}</div>
                  <div className="font-medium text-sm">{i.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

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
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-muted-foreground">{integration?.category}</div>
          <h3 className="font-semibold">{integration?.name ?? type}</h3>
        </div>
        <button onClick={onClose}><X className="size-4" /></button>
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
