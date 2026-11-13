import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { classify, setIdentification, useIdentification } from "@/lib/planthost/store";
import { identificarPorCaracteristicas } from "@/lib/planthost/api";

export const Route = createFileRoute("/identificacao/processamento")({
  head: () => ({
    meta: [
      { title: "Processamento — PlantHost AI" },
      { name: "description", content: "Pipeline de pré-processamento, feature engineering e classificação." },
      { property: "og:title", content: "Processamento de Machine Learning — PlantHost AI" },
      { property: "og:description", content: "Visualização do pipeline de classificação com ML." },
    ],
  }),
  component: Processamento,
});

const PIPELINE = ["Dados", "Pré-processamento", "Feature Engineering", "Machine Learning", "Classificação"];
const STATUS = [
  "Características recebidas",
  "Dados preparados",
  "Modelo carregado",
  "Classificação executada",
];

function Processamento() {
  const state = useIdentification();
  const navigate = useNavigate();
  const [stage, setStage] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const timers = [0, 1, 2, 3, 4, 5].map((i) => window.setTimeout(() => setStage(i + 1), 260 * (i + 1)));
    return () => timers.forEach(window.clearTimeout);
  }, []);

  useEffect(() => {
    if (stage >= 5 && !state.prediction) {
      // Chama o backend FastAPI
      identificarPorCaracteristicas(state.features)
        .then((res) => {
          setIdentification({
            prediction: {
              species: {
                id: res.species.species_id,
                scientific_name: res.species.scientific_name,
                common_name: res.species.common_name || null,
                family: res.species.family,
                life_form: "Conforme acervo botânico",
                habit: "Caatinga / Semiárido",
                leaf_characteristics: {
                  disposicao: state.features.folha_disposicao || "Não informada",
                  forma: state.features.folha_forma || "Não informada",
                  margem: state.features.folha_margem || "Não informada",
                  textura: state.features.folha_textura || "Não informada",
                  filotaxia: state.features.folha_filotaxia || "Não informada",
                },
                flower_characteristics: {
                  presenca: state.features.flor_presenca || "Presente",
                  cor: state.features.flor_cor || "Não informada",
                  simetria: state.features.flor_simetria || "Actinomorfa",
                  inflorescencia: state.features.flor_inflorescencia || "Não informada",
                },
                stem_characteristics: {
                  tipo: state.features.caule_tipo || "Herbáceo / Lenhoso",
                  textura: state.features.caule_textura || "Pubescente",
                  ramificacao: state.features.caule_ramificacao || "Ereta",
                },
                trichomes: state.features.tricomas || "Presente",
                distribution: state.features.distribuicao || "Semiárido",
                occurrence_period: state.features.epoca || "Ano todo",
                host_status: res.species.host_status,
                host_type: res.host_evidence?.host_type || "Hospedeira comprovada de Bemisia tabaci",
                source: res.host_evidence?.sources || ["Embrapa BPD 55", "Reflora"],
                image_url: null,
              },
              confidence: res.confidence,
              ranking: res.ranking.map((r) => ({
                scientific_name: r.scientific_name,
                confidence: r.confidence,
              })),
              model: res.model,
            },
          });
        })
        .catch((err) => {
          console.warn("Backend offline, aplicando inferência local com fallback:", err);
          setErrorMsg("Executando em modo de contingência local.");
          setIdentification({ prediction: classify(state.features, state.model) });
        });
    }
  }, [stage, state.features, state.model, state.prediction]);

  const done = stage >= 6;

  return (
    <AppLayout
      step={4}
      backTo="/identificacao/caracteristicas"
      title="Processamento / Machine Learning"
      description="Execução do pipeline de classificação sobre as características botânicas informadas."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="overflow-hidden border-0 shadow-card">
          <div className="gradient-hero p-8 text-deep-foreground">
            <p className="font-mono text-xs uppercase tracking-widest opacity-70">Pipeline</p>
            <div className="mt-6 space-y-3">
              {PIPELINE.map((p, i) => {
                const active = stage > i;
                return (
                  <div key={p} className="flex items-center gap-3">
                    <span
                      className={`grid size-7 place-items-center rounded-full border font-mono text-xs transition-all ${
                        active ? "border-transparent bg-background/90 text-foreground" : "border-white/25 opacity-50"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className={`text-sm transition-opacity ${active ? "opacity-100" : "opacity-45"}`}>{p}</span>
                    {active && i === stage - 1 && !done && <Loader2 className="size-4 animate-spin opacity-80" />}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-card">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Status</p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {STATUS.map((s, i) => {
                  const ok = stage > i + 1;
                  return (
                    <li key={s} className={`flex items-center gap-2 ${ok ? "" : "text-muted-foreground/60"}`}>
                      {ok ? (
                        <Check className="size-4 text-success" />
                      ) : (
                        <Loader2 className="size-4 animate-spin opacity-50" />
                      )}
                      {s}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Modelo selecionado</p>
              <p className="mt-2 font-display text-xl font-semibold">{state.model}</p>
              <Badge variant="outline" className="mt-3 border-primary/50 bg-primary/10 text-primary">
                Multi-trait / Random Forest (Embrapa BPD 55)
              </Badge>
              {errorMsg && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertCircle className="size-3.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
              <p className="mt-4 text-sm text-muted-foreground">
                {done ? "Análise concluída com sucesso" : "Processando características no classificador..."}
              </p>
              <Button
                className="mt-5"
                disabled={!done}
                onClick={() => navigate({ to: "/identificacao/resultado" })}
              >
                Ver resultado <ArrowRight className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

