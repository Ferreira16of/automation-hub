import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Política de Privacidade — Luma Hub" }] }),
  component: Page,
});

function Page() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl px-4 py-12 prose prose-invert">
        <h1 className="text-3xl font-bold">Política de Privacidade</h1>
        <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <h2 className="text-xl font-semibold mt-8">1. Dados que coletamos</h2>
        <p>Coletamos apenas o necessário para operar o serviço: e-mail, nome de exibição, workflows que você cria e credenciais de APIs que você cadastra.</p>

        <h2 className="text-xl font-semibold mt-6">2. Como armazenamos</h2>
        <p>Suas credenciais e workflows ficam isolados por usuário através de Row Level Security no banco. Apenas você pode acessar seus próprios dados.</p>

        <h2 className="text-xl font-semibold mt-6">3. Uso de dados</h2>
        <p>Não vendemos nem compartilhamos seus dados com terceiros. Suas chaves de API são utilizadas apenas para executar os workflows que você define.</p>

        <h2 className="text-xl font-semibold mt-6">4. Seus direitos</h2>
        <p>Você pode excluir sua conta e todos os dados associados a qualquer momento entrando em contato.</p>

        <h2 className="text-xl font-semibold mt-6">5. Cookies</h2>
        <p>Usamos armazenamento local apenas para manter sua sessão e preferências de tema.</p>

        <h2 className="text-xl font-semibold mt-6">6. Contato</h2>
        <p>Dúvidas: contato@luma-hub.app</p>
      </article>
    </AppShell>
  );
}
