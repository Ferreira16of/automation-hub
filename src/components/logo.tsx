import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2.5 font-display font-bold ${className}`}>
      <span className="relative grid place-items-center size-8 rounded-md bg-card border border-border luma-glow">
        <span className="size-2 rounded-full bg-[var(--color-cyan)] luma-glow-pulse" />
      </span>
      <span className="text-[15px] tracking-[0.18em] uppercase">
        Luma <span className="text-[var(--color-cyan)]">Hub</span>
      </span>
    </Link>
  );
}
