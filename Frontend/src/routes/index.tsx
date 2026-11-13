import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Bug, Brain, Search, Sprout, AlertTriangle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { DATASET_STATS } from "@/lib/planthost/data";
import { fetchDashboardStats, type DashboardStats } from "@/lib/planthost/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PlantHost AI — Plantas hospedeiras da mosca-branca" },
      {
        name: "description",
        content:
          "Sistema de apoio à identificação de plantas silvestres hospedeiras da mosca-branca no semiárido nordestino com aprendizado de máquina.",
      },
      { property: "og:title", content: "PlantHost AI — Identificação de plantas hospedeiras" },
      {
        property: "og:description",
        content:
          "MVP acadêmico de identificação de espécies vegetais do semiárido com características botânicas e machine learning.",
      },
    ],
  }),
  component: Dashboard,
});

const PIPELINE = [
  { icon: Sprout, label: "Dados Embrapa" },
  { icon: Database, label: "Acervo Botânico" },
  { icon: Brain, label: "Machine Learning" },
  { icon: Search, label: "Identificação" },
  { icon: Bug, label: "Hospedeiro" },
];

function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_especies: DATASET_STATS.total,
    total_silvestres: DATASET_STATS.silvestres,
    total_cultivadas: DATASET_STATS.cultivadas,
    total_hospedeiras: DATASET_STATS.hospedeiras,
    total_alertas_ativos: 3,
    total_validacoes: 10,
    modelos_disponiveis: ["Random Forest", "Vision CNN"],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetchDashboardStats()
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Backend offline, operando com dados de referência locais:", err);
          setError("Backend desconectado — exibindo dados locais de referência.");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const statsCards = [
    { value: stats.total_hospedeiras, label: "Espécies hospedeiras confirmadas" },
    { value: stats.total_silvestres, label: "Espécies silvestres monitoradas" },
    { value: stats.total_cultivadas, label: "Espécies cultivadas documentadas" },
    { value: stats.modelos_disponiveis?.length || 2, label: "Modelos de ML integrados" },
  ];

  return (
    <AppLayout step={1} title="PlantHost AI" description="Identificação inteligente de plantas hospedeiras da mosca-branca">
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-600" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              setLoading(true);
              fetchDashboardStats()
                .then(setStats)
                .then(() => setError(null))
                .catch(() => {})
                .finally(() => setLoading(false));
            }}
            className="flex items-center gap-1 font-medium underline"
          >
            <RefreshCw className="size-3" /> Tentar reconectar
          </button>
        </div>
      )}

      <Card className="overflow-hidden border-0 shadow-card">
        <div className="gradient-hero px-8 py-10 text-deep-foreground">
          <p className="font-mono text-xs uppercase tracking-widest opacity-70">Semiárido · Caatinga · Bemisia tabaci</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold">
            Identificação inteligente de plantas hospedeiras da mosca-branca
          </h2>
          <p className="mt-4 max-w-2xl text-sm opacity-80">
            Sistema de apoio à identificação de espécies vegetais do semiárido nordestino utilizando características
            botânicas, visão computacional e evidências científicas Embrapa/Reflora.
          </p>
          <Link
            to="/identificacao/nova"
            className="mt-7 inline-flex items-center gap-2 rounded-md bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-transform hover:-translate-y-0.5"
          >
            Iniciar identificação <ArrowRight className="size-4" />
          </Link>
        </div>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((s) => (
          <Card key={s.label} className="shadow-card">
            <CardContent className="p-5">
              <p className="font-display text-3xl font-semibold text-primary">
                {loading ? "..." : s.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 shadow-card">
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Fluxo do sistema</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {PIPELINE.map((p, i) => (
              <div key={p.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/60 px-3 py-2">
                  <p.icon className="size-4 text-primary" />
                  <span className="text-sm">{p.label}</span>
                </div>
                {i < PIPELINE.length - 1 && <ArrowRight className="size-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
