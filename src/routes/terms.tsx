import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Termos e Condições — FlowForge" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">Termos e Condições</h1>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="text-xl font-semibold mt-8">1. Aceitação</h2>
        <p>Ao usar o FlowForge, você concorda com estes termos.</p>

        <h2 className="text-xl font-semibold mt-6">2. Uso aceitável</h2>
        <p>Você não deve usar o serviço para enviar spam, executar atividades ilegais ou abusar de APIs de terceiros.</p>

        <h2 className="text-xl font-semibold mt-6">3. Conta</h2>
        <p>Você é responsável pela segurança da sua conta e por todas as ações realizadas a partir dela.</p>

        <h2 className="text-xl font-semibold mt-6">4. APIs de terceiros</h2>
        <p>O FlowForge é um orquestrador. Você é responsável por respeitar os termos das APIs que conectar.</p>

        <h2 className="text-xl font-semibold mt-6">5. Limitação de responsabilidade</h2>
        <p>O serviço é fornecido "como está", sem garantias de disponibilidade ou adequação a qualquer propósito específico.</p>

        <h2 className="text-xl font-semibold mt-6">6. Encerramento</h2>
        <p>Podemos suspender contas que violem estes termos.</p>
      </article>
    </AppShell>
  );
}
