import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, FileDown, Leaf, RotateCcw } from "lucide-react";
import { exportIdentificationReport } from "@/lib/planthost/report";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { NAO_INFORMADO } from "@/lib/planthost/data";
import { resetIdentification, useIdentification } from "@/lib/planthost/store";

export const Route = createFileRoute("/identificacao/resultado")({
  head: () => ({
    meta: [
      { title: "Resultado da identificação — PlantHost AI" },
      { name: "description", content: "Espécie provável, confiança da classificação e ranking de possibilidades." },
      { property: "og:title", content: "Resultado da identificação — PlantHost AI" },
      { property: "og:description", content: "Espécie provável e confiança retornadas pelo classificador." },
    ],
  }),
  component: Resultado,
});

function Ring({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 128 128" className="size-36">
      <circle cx="64" cy="64" r={r} fill="none" stroke="var(--muted)" strokeWidth="12" />
      <circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="var(--primary)"
        strokeWidth="12"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (value / 100) * c}
        transform="rotate(-90 64 64)"
      />
      <text x="64" y="70" textAnchor="middle" className="fill-foreground font-display text-2xl font-semibold">
        {value}%
      </text>
    </svg>
  );
}

function Resultado() {
  const { prediction } = useIdentification();
  const navigate = useNavigate();

  if (!prediction) {
    return (
      <AppLayout step={5} backTo="/identificacao/caracteristicas" title="Resultado da identificação">
        <Card className="shadow-card">
          <CardContent className="p-8 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Confiança disponível após execução do modelo</p>
            <p className="mt-2">
              Nenhuma classificação foi executada nesta sessão. Preencha as características e execute a análise.
            </p>
            <Button className="mt-5" onClick={() => navigate({ to: "/identificacao/caracteristicas" })}>
              Ir para características
            </Button>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  const sp = prediction.species;

  return (
    <AppLayout
      step={5}
      backTo="/identificacao/processamento"
      title="Resultado da identificação"
      description="Espécie provável estimada pelo classificador — resultado de apoio, não determinação taxonômica."
    >
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Card className="shadow-card">
          <CardContent className="p-7">
            <div className="flex items-start gap-4">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-2xl">🌿</span>
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Espécie provável</p>
                <h2 className="mt-1 font-display text-2xl font-semibold italic">{sp.scientific_name}</h2>
                <p className="text-sm text-muted-foreground">{sp.common_name ?? NAO_INFORMADO}</p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-3">
              {[
                { l: "Família", v: sp.family },
                { l: "Forma de vida", v: sp.life_form },
                { l: "Hábito", v: sp.habit },
              ].map((i) => (
                <div key={i.l} className="rounded-lg border border-border bg-secondary/40 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{i.l}</p>
                  <p className="mt-1 text-sm font-medium">{i.v || NAO_INFORMADO}</p>
                </div>
              ))}
            </div>

            <div className="mt-7">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Ranking de possibilidades
              </p>
              <div className="mt-4 space-y-3">
                {prediction.ranking.map((r, i) => (
                  <div key={r.scientific_name}>
                    <div className="flex justify-between text-sm">
                      <span className="italic">
                        {i + 1}. {r.scientific_name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">{r.confidence}%</span>
                    </div>
                    <Progress value={r.confidence} className="mt-1.5" />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={() => navigate({ to: "/identificacao/hospedeiro" })}>
                Verificar hospedeiro <ArrowRight className="size-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  resetIdentification();
                  navigate({ to: "/identificacao/nova" });
                }}
              >
                <RotateCcw className="size-4" /> Nova identificação
              </Button>
              <Button variant="outline" onClick={() => exportIdentificationReport()}>
                <FileDown className="size-4" /> Exportar relatório (PDF)
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center p-7 text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Confiança da classificação
            </p>
            <div className="mt-4">
              <Ring value={prediction.confidence} />
            </div>
            <Badge variant="outline" className="mt-4 border-warning/50 bg-warning/15 text-foreground">
              Demonstração do MVP · {prediction.model}
            </Badge>
            <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Leaf className="size-3.5 text-primary" />
              Confiança do modelo ≠ registro como hospedeira
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
