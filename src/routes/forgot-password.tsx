import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/forgot-password")({ component: Page });

function Page() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = z.string().trim().email().safeParse(email);
    if (!parsed.success) return toast.error("E-mail inválido");
    setLoading(true);
    const { error } = await resetPassword(parsed.data);
    setLoading(false);
    if (error) return toast.error(error);
    setSent(true);
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="text-3xl font-bold tracking-tight">Recuperar senha</h1>
        <p className="text-muted-foreground mt-1">Enviaremos um link para redefinir.</p>
        {sent ? (
          <div className="mt-8 p-4 rounded-md bg-secondary text-sm">
            Se o e-mail existir, você receberá um link em instantes.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Enviar link"}
            </Button>
          </form>
        )}
        <p className="mt-6 text-sm text-muted-foreground text-center">
          <Link to="/login" className="text-primary hover:underline">Voltar ao login</Link>
        </p>
      </div>
    </AppShell>
  );
}
