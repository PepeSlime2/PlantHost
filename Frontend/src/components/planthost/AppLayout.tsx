import { Link, useLocation } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  LayoutDashboard,
  Leaf,
  ListChecks,
  Cpu,
  Sparkles,
  Bug,
  FileSearch,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Database,
  Brain,
} from "lucide-react";
import { STEPS } from "./steps";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const ICONS = [LayoutDashboard, Leaf, ListChecks, Cpu, Sparkles, Bug, FileSearch, BarChart3];

const CONSULTAS = [
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/modelos", label: "Modelos", icon: Brain },
];

interface Props {
  /** Etapa atual do fluxo (1–8). Telas fora do fluxo (consultas) omitimos o step. */
  step?: number;
  title: string;
  description?: string;
  backTo?: string;
  children: ReactNode;
}

export function AppLayout({ step, title, description, backTo, children }: Props) {
  const pathname = useLocation().pathname;
  const trail = STEPS.filter((s) => step === undefined || s.n <= step);

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <span className="grid size-9 place-items-center rounded-lg gradient-tech text-sidebar-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">PlantHost AI</p>
            <p className="text-[11px] text-sidebar-foreground/60">MVP acadêmico</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {STEPS.map((s, i) => {
            const Icon = ICONS[i] ?? Leaf;
            const active = step !== undefined && s.n === step;
            return (
              <Link
                key={s.to}
                to={s.to}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="truncate">{s.short}</span>
                <span className="ml-auto font-mono text-[10px] opacity-50">0{s.n}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-3 pt-4">
          <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Consultas</p>
          <nav className="space-y-1">
            {CONSULTAS.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.to}
                  to={c.to}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    pathname === c.to
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{c.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-sidebar-border px-5 py-4 text-[11px] text-sidebar-foreground/60">
          Semiárido do Nordeste · mosca-branca
          <br />
          Ferramenta de apoio à identificação
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b border-border/70 bg-background/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-3">
            <nav className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              {trail.map((s, i) => (
                <span key={s.to} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3 opacity-50" />}
                  <Link
                    to={s.to}
                    className={cn(
                      "truncate hover:text-primary",
                      s.n === step && "font-medium text-foreground",
                    )}
                  >
                    {s.short}
                  </Link>
                </span>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              <Badge variant="outline" className="border-warning/50 bg-warning/15 text-foreground">
                Demonstração do MVP
              </Badge>
              {step !== undefined && (
                <span className="font-mono text-xs text-muted-foreground">Etapa {step}/8</span>
              )}
            </div>
          </div>
          <div className="h-0.5 w-full bg-muted">
            <div className="h-full gradient-tech transition-all" style={{ width: `${((step ?? 8) / 8) * 100}%` }} />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8">
          <div className="mb-6 flex flex-wrap items-end gap-4">
            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center gap-1 rounded-md border border-input bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="size-4" /> Voltar
              </Link>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold">{title}</h1>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
