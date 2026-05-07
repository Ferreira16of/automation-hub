import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, MailCheck } from "lucide-react";

export const Route = createFileRoute("/signup")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: SignupPage,
});

const schema = z.object({
  displayName: z.string().trim().min(2, "Nome muito curto").max(80),
  email: z.string().trim().email("E-mail inválido").max(255),
  password: z.string().min(8, "Use pelo menos 8 caracteres").max(72),
});

function SignupPage() {
  const { signUp } = useAuth();
  const nav = useNavigate();
  const [displayName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ displayName, email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { error } = await signUp(parsed.data.email, parsed.data.password, parsed.data.displayName);
    setLoading(false);
    if (error) return toast.error(error);
    setSent(true);
  };

  if (sent) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <MailCheck className="size-12 mx-auto text-primary" />
          <h1 className="text-2xl font-bold mt-4">Confirme seu e-mail</h1>
          <p className="text-muted-foreground mt-2">
            Enviamos um link de confirmação para <strong>{email}</strong>. Clique nele para ativar sua conta.
          </p>
          <Button className="mt-6" onClick={() => nav({ to: "/login" })}>Ir para login</Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Criar conta</h1>
        <p className="text-muted-foreground mt-1">Comece a automatizar em minutos.</p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" required value={displayName} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-muted-foreground">Mínimo 8 caracteres. Verificamos contra vazamentos conhecidos.</p>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Criar conta"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Ao continuar, você concorda com os <Link to="/terms" className="underline">Termos</Link> e a <Link to="/privacy" className="underline">Política de Privacidade</Link>.
          </p>
        </form>
        <p className="mt-6 text-sm text-muted-foreground text-center">
          Já tem conta? <Link to="/login" className="text-primary hover:underline">Entrar</Link>
        </p>
      </div>
    </AppShell>
  );
}
