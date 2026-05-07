import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Workflow, Zap, Shield, Plug, ArrowRight, Bot, Webhook, Mail } from "lucide-react";
import { INTEGRATIONS } from "@/lib/integrations";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: "/dashboard" });
  },
  component: Landing,
});

function Landing() {
  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="hero-glow absolute inset-0 -z-10" />
        <div className="mx-auto max-w-7xl px-4 py-20 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs text-muted-foreground mb-6">
            <Zap className="size-3 text-accent" /> Alternativa visual ao n8n, com IA nativa
          </div>
          <h1 className="font-display font-bold text-4xl md:text-6xl tracking-tight max-w-3xl mx-auto">
            Conecte qualquer API. <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Automatize tudo.</span>
          </h1>
          <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
            FlowForge é um construtor visual de automações. Arraste blocos, conecte serviços e execute fluxos com mais de {INTEGRATIONS.length} integrações prontas.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link to="/signup">Criar conta grátis <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: Workflow, title: "Editor visual", desc: "Canvas com nós conectáveis, baseado em React Flow." },
            { icon: Plug, title: `${INTEGRATIONS.length}+ integrações`, desc: "OpenAI, Anthropic, Stripe, Telegram, Resend e muito mais." },
            { icon: Shield, title: "Suas chaves, seu controle", desc: "Credenciais por usuário, isoladas por RLS no banco." },
            { icon: Bot, title: "IA nativa", desc: "Conecte vários provedores de LLM no mesmo workflow." },
            { icon: Webhook, title: "Webhooks & cron", desc: "Receba eventos externos ou agende execuções." },
            { icon: Mail, title: "E-mail & mensagens", desc: "Resend, SendGrid, Telegram, Slack, Discord, Twilio." },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-6">
              <div className="size-10 rounded-lg bg-secondary grid place-items-center mb-4">
                <f.icon className="size-5 text-primary" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
