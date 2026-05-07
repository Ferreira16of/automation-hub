import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { INTEGRATIONS, getIntegration, CATEGORIES } from "@/lib/integrations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, KeyRound, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/credentials")({ component: CredentialsPage });

interface Cred { id: string; provider: string; name: string; data: Record<string, string>; created_at: string }

function CredentialsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Cred[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Todas");

  const filtered = useMemo(() => {
    return INTEGRATIONS.filter((i) => i.fields.length > 0).filter((i) => {
      const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === "Todas" || i.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const load = async () => {
    const { data, error } = await supabase
      .from("credentials")
      .select("id,provider,name,data,created_at")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setItems((data ?? []) as Cred[]);
  };

  useEffect(() => { load(); }, []);

  const remove = async (id: string) => {
    if (!confirm("Excluir credencial?")) return;
    const { error } = await supabase.from("credentials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setItems((s) => s.filter((c) => c.id !== id));
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Credenciais</h1>
            <p className="text-muted-foreground">Suas chaves ficam isoladas e só você as acessa.</p>
          </div>
          <Button onClick={() => setOpen(true)}><Plus className="size-4 mr-1.5" /> Nova credencial</Button>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <KeyRound className="size-10 mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">Nenhuma credencial cadastrada.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((c) => {
              const int = getIntegration(c.provider);
              return (
                <div key={c.id} className="rounded-lg border border-border bg-card p-4 flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{int?.name ?? c.provider}</div>
                  </div>
                  <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive" aria-label="Excluir">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Escolha um serviço</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2 sticky top-0 bg-background py-2 z-10">
              <div className="relative flex-1">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input className="pl-9" placeholder="Buscar serviço…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todas">Todas</SelectItem>
                  {CATEGORIES.filter((c) => c !== "Core").map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filtered.map((i) => (
                <CredentialFormTrigger key={i.id} integrationId={i.id} userId={user!.id} onSaved={() => { load(); setOpen(false); }} />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}

function CredentialFormTrigger({ integrationId, userId, onSaved }: { integrationId: string; userId: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const integration = getIntegration(integrationId)!;
  const [name, setName] = useState(`${integration.name} (principal)`);
  const [data, setData] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const save = async () => {
    for (const f of integration.fields) {
      if (f.required && !data[f.key]?.trim()) return toast.error(`Campo obrigatório: ${f.label}`);
    }
    setSaving(true);
    const { error } = await supabase.from("credentials").insert({
      user_id: userId,
      provider: integration.id,
      name: name.trim() || integration.name,
      data,
    });
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Credencial salva");
    setOpen(false);
    onSaved();
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-left rounded-lg border border-border bg-card hover:border-primary/50 p-3 transition-colors"
      >
        <div className="font-medium text-sm">{integration.name}</div>
        <div className="text-xs text-muted-foreground">{integration.category}</div>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conectar {integration.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome da credencial</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {integration.fields.map((f) => (
              <div key={f.key} className="space-y-2">
                <Label>{f.label}{f.required && <span className="text-destructive"> *</span>}</Label>
                <Input
                  type={f.type === "password" ? "password" : f.type === "url" ? "url" : "text"}
                  placeholder={f.placeholder}
                  value={data[f.key] ?? ""}
                  onChange={(e) => setData((s) => ({ ...s, [f.key]: e.target.value }))}
                />
                {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
              </div>
            ))}
            {integration.docsUrl && (
              <a href={integration.docsUrl} target="_blank" rel="noreferrer noopener" className="text-xs text-primary hover:underline inline-block">
                Documentação oficial ↗
              </a>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Salvando…" : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
