import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAO_INFORMADO, type HostStatus } from "@/lib/planthost/data";
import { useIdentification } from "@/lib/planthost/store";

export const Route = createFileRoute("/identificacao/hospedeiro")({
  head: () => ({
    meta: [
      { title: "Verificação de hospedeiro — PlantHost AI" },
      { name: "description", content: "Consulta do registro da espécie como hospedeira da mosca-branca." },
      { property: "og:title", content: "Verificação de hospedeiro — PlantHost AI" },
      { property: "og:description", content: "Status de registro como hospedeira na base de referência." },
    ],
  }),
  component: Hospedeiro,
});

const STATUS_MAP: Record<HostStatus, { dot: string; label: string; cls: string }> = {
  registrada: { dot: "🟢", label: "Registrada como hospedeira", cls: "border-success/40 bg-success/10" },
  sem_registro: { dot: "🔴", label: "Sem registro encontrado", cls: "border-destructive/40 bg-destructive/10" },
  indisponivel: { dot: "🟡", label: "Informação não disponível", cls: "border-warning/50 bg-warning/10" },
};

function Hospedeiro() {
  const { prediction } = useIdentification();
  const navigate = useNavigate();

  if (!prediction) {
    return (
      <AppLayout step={6} backTo="/identificacao/resultado" title="Registro como hospedeira">
        <Card className="shadow-card">
          <CardContent className="p-8 text-sm text-muted-foreground">
            Nenhuma espécie identificada nesta sessão. Execute uma classificação primeiro.
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const sp = prediction.species;
  const st = STATUS_MAP[sp.host_status];

  return (
    <AppLayout
      step={6}
      backTo="/identificacao/resultado"
      title="Registro como hospedeira"
      description="Consulta direta à base de referência — o sistema não afirma hospedagem sem registro."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className={`shadow-card ${st.cls}`}>
          <CardContent className="p-8 text-center">
            <span className="text-4xl">🦟</span>
            <h2 className="mt-3 font-display text-xl font-semibold">Mosca-branca</h2>
            <p className="mt-1 text-xs text-muted-foreground">Bemisia tabaci</p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium">
              <span>{st.dot}</span> {st.label}
            </div>

            <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
              {[
                { l: "Espécie", v: sp.scientific_name },
                { l: "Família", v: sp.family },
                { l: "Tipo", v: sp.host_type ?? NAO_INFORMADO },
                { l: "Fonte", v: sp.source.join(", ") || NAO_INFORMADO },
              ].map((i) => (
                <div key={i.l} className="rounded-lg border border-border bg-card p-3">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{i.l}</p>
                  <p className="mt-0.5 text-sm font-medium">{i.v}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-8">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Cadeia de verificação</p>
            <div className="mt-6 space-y-2">
              {[
                { t: "Planta identificada", d: sp.scientific_name },
                { t: "Registro na base", d: sp.source.join(", ") || NAO_INFORMADO },
                {
                  t: "Hospedeira da mosca-branca",
                  d: st.label,
                },
              ].map((n, i) => (
                <div key={n.t}>
                  <div className="rounded-lg border border-border bg-secondary/40 p-4">
                    <p className="text-sm font-medium">{n.t}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{n.d}</p>
                  </div>
                  {i < 2 && <ArrowDown className="mx-auto my-1 size-4 text-primary" />}
                </div>
              ))}
            </div>
            <Button className="mt-7" onClick={() => navigate({ to: "/identificacao/evidencias" })}>
              Ver evidências <ArrowRight className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
