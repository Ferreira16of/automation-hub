import { Workflow } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 font-display font-bold ${className}`}>
      <span className="grid place-items-center size-8 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
        <Workflow className="size-4" />
      </span>
      <span className="text-lg tracking-tight">FlowForge</span>
    </Link>
  );
}
