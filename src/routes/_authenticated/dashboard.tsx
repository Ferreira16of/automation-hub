import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Plus, Workflow, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/_authenticated/dashboard")({ component: Dashboard });

interface Wf { id: string; name: string; description: string | null; active: boolean; updated_at: string }

function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState<Wf[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("workflows")
      .select("id,name,description,active,updated_at")
      .order("updated_at", { ascending: false });
    if (error) toast.error(error.message);
    else setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!user) return;
    setCreating(true);
    const { data, error } = await supabase
      .from("workflows")
      .insert({ user_id: user.id, name: "Novo workflow" })
      .select("id")
      .single();
    setCreating(false);
    if (error || !data) return toast.error(error?.message ?? "Erro");
    nav({ to: "/workflows/$id", params: { id: data.id } });
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    const { error } = await supabase.from("workflows").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((w) => w.id !== id));
  };

  return (
    <AppShell>
      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir workflow?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
            <p className="text-muted-foreground">Crie e gerencie suas automações.</p>
          </div>
          <Button onClick={create} disabled={creating}>
            {creating ? <Loader2 className="size-4 animate-spin" /> : <><Plus className="size-4 mr-1.5" /> Novo workflow</>}
          </Button>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Carregando…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center">
            <Workflow className="size-10 mx-auto text-muted-foreground" />
            <h3 className="mt-4 font-semibold">Nenhum workflow ainda</h3>
            <p className="text-muted-foreground text-sm mt-1">Comece criando seu primeiro fluxo.</p>
            <Button className="mt-6" onClick={create}><Plus className="size-4 mr-1.5" /> Criar workflow</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((w) => (
              <div key={w.id} className="group rounded-xl border border-border bg-card p-5 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between">
                  <Link to="/workflows/$id" params={{ id: w.id }} className="block flex-1">
                    <h3 className="font-semibold truncate">{w.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{w.description ?? "Sem descrição"}</p>
                  </Link>
                  <button onClick={() => setConfirmId(w.id)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity" aria-label="Excluir">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatDistanceToNow(new Date(w.updated_at), { addSuffix: true })}</span>
                  <span className={`px-2 py-0.5 rounded-full ${w.active ? "bg-success/15 text-success" : "bg-muted"}`}>
                    {w.active ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
