import { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard, KeyRound, LogOut, Workflow as WorkflowIcon } from "lucide-react";

export function AppShell({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const links = [
    { to: "/dashboard", label: "Workflows", icon: LayoutDashboard },
    { to: "/credentials", label: "Credenciais", icon: KeyRound },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Logo />
            {user && (
              <nav className="hidden md:flex items-center gap-1">
                {links.map((l) => {
                  const active = loc.pathname.startsWith(l.to);
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      className={`px-3 py-1.5 rounded-md text-sm flex items-center gap-2 transition-colors ${
                        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      }`}
                    >
                      <l.icon className="size-4" />
                      {l.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await signOut();
                  nav({ to: "/" });
                }}
              >
                <LogOut className="size-4 mr-1.5" /> Sair
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Começar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border bg-card/30 py-6">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <WorkflowIcon className="size-4" />
            <span>© {new Date().getFullYear()} FlowForge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground">Política de Privacidade</Link>
            <Link to="/terms" className="hover:text-foreground">Termos e Condições</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
