import { Link, useLocation } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
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
  Menu,
  X,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { STEPS } from "./steps";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ICONS = [LayoutDashboard, Leaf, ListChecks, Cpu, Sparkles, Bug, FileSearch, BarChart3];

const CONSULTAS = [
  { to: "/dataset", label: "Acervo Botânico", icon: Database },
  { to: "/avaliacao", label: "Validação Especialista", icon: ShieldCheck },
  { to: "/modelos", label: "Modelos & Alertas", icon: Bell },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <span className="grid size-9 place-items-center rounded-lg gradient-tech text-sidebar-primary-foreground">
            <Leaf className="size-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-semibold">PlantHost AI</p>
            <p className="text-[11px] text-sidebar-foreground/60">Semiárido & Mosca-branca</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
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
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
          <p className="px-3 pb-2 text-[10px] uppercase tracking-widest text-sidebar-foreground/50">Módulos</p>
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
                      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
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
          Semiárido do Nordeste · Embrapa BPD 55
          <br />
          Identificação Rastreável com IA
        </div>
      </aside>

      {/* Drawer / Menu Móvel */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative flex w-4/5 max-w-xs flex-1 flex-col bg-sidebar p-5 text-sidebar-foreground shadow-2xl">
            <div className="flex items-center justify-between border-b border-sidebar-border pb-4">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-lg gradient-tech text-sidebar-primary-foreground">
                  <Leaf className="size-4" />
                </span>
                <p className="font-display text-sm font-semibold">PlantHost AI</p>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Fluxo Principal</p>
              {STEPS.map((s, i) => {
                const Icon = ICONS[i] ?? Leaf;
                const active = step !== undefined && s.n === step;
                return (
                  <Link
                    key={s.to}
                    to={s.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span>{s.short}</span>
                  </Link>
                );
              })}

              <div className="pt-4">
                <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-sidebar-foreground/50">Módulos</p>
                {CONSULTAS.map((c) => {
                  const Icon = c.icon;
                  return (
                    <Link
                      key={c.to}
                      to={c.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                        pathname === c.to
                          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{c.label}</span>
                    </Link>
                  );
                })}
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="min-w-0 flex-1 overflow-x-hidden">
        {/* Header Superior Responsivo */}
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="grid size-9 place-items-center rounded-md border border-border md:hidden"
                onClick={() => setMobileMenuOpen(true)}
                aria-label="Abrir menu"
              >
                <Menu className="size-5" />
              </button>

              <nav className="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground">
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
            </div>

            {step && (
              <Badge variant="outline" className="hidden shrink-0 font-mono text-[11px] sm:inline-flex">
                Etapa {step} de 8
              </Badge>
            )}
          </div>
        </header>

        {/* Corpo da Página */}
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              {backTo && (
                <Link
                  to={backTo}
                  className="mb-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="size-3.5" /> Voltar
                </Link>
              )}
              <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>

          <div className="w-full min-w-0 overflow-x-hidden">{children}</div>
        </main>
      </div>
    </div>
  );
}
