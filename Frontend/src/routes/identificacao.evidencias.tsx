import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight, ChevronRight, FileDown, ImageOff } from "lucide-react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NAO_INFORMADO } from "@/lib/planthost/data";
import { exportIdentificationReport } from "@/lib/planthost/report";
import { useIdentification } from "@/lib/planthost/store";

export const Route = createFileRoute("/identificacao/evidencias")({
  head: () => ({
    meta: [
      { title: "Evidências e dados da espécie — PlantHost AI" },
      { name: "description", content: "Fontes botânicas e rastreamento das informações usadas na identificação." },
      { property: "og:title", content: "Evidências da identificação — PlantHost AI" },
      { property: "og:description", content: "Embrapa, Flora e Funga do Brasil e Reflora como fontes associadas." },
    ],
  }),
  component: Evidencias,
});

const SOURCES = [
  { name: "Embrapa", desc: "Registro de hospedeiro" },
  { name: "Flora e Funga do Brasil", desc: "Dados botânicos e taxonômicos" },
  { name: "Reflora", desc: "Imagens e registros complementares" },
];

function Evidencias() {
  const { prediction } = useIdentification();
  const navigate = useNavigate();
  const sp = prediction?.species;

  return (
    <AppLayout
      step={7}
      backTo="/identificacao/hospedeiro"
      title="Evidências da identificação"
      description="Origem das informações utilizadas pelo sistema."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="grid aspect-[4/3] place-items-center rounded-lg border border-dashed border-border bg-secondary/40 text-center">
              {sp?.image_url ? (
                <img src={sp.image_url} alt={sp.scientific_name} className="h-full w-full rounded-lg object-cover" />
              ) : (
                <div className="text-muted-foreground">
                  <ImageOff className="mx-auto size-6" />
                  <p className="mt-2 text-sm">Imagem não disponível</p>
                </div>
              )}
            </div>
            <div className="mt-5 space-y-3">
              {SOURCES.map((s) => (
                <div key={s.name} className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Informações botânicas
              </p>
              <dl className="mt-4 divide-y divide-border text-sm">
                {[
                  { l: "Nome científico", v: sp?.scientific_name },
                  { l: "Família", v: sp?.family },
                  { l: "Forma de vida", v: sp?.life_form },
                  { l: "Hábito", v: sp?.habit },
                  { l: "Distribuição", v: sp?.distribution },
                  { l: "Época de ocorrência", v: sp?.occurrence_period },
                ].map((i) => (
                  <div key={i.l} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-muted-foreground">{i.l}</dt>
                    <dd className="text-right font-medium">{i.v || NAO_INFORMADO}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Rastreamento</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
                {["Fonte", "Registro", "Características", "Modelo", "Resultado"].map((t, i) => (
                  <span key={t} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight className="size-3.5 text-muted-foreground" />}
                    <span className="rounded-md border border-border bg-secondary/50 px-2.5 py-1">{t}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => navigate({ to: "/identificacao/resultado" })}>
              ← Voltar para resultado
            </Button>
            <Button onClick={() => navigate({ to: "/avaliacao" })}>
              Avaliar modelos <ArrowRight className="size-4" />
            </Button>
            {prediction && (
              <Button variant="outline" onClick={() => exportIdentificationReport()}>
                <FileDown className="size-4" /> Exportar relatório (PDF)
              </Button>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
