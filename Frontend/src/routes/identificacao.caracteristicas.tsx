import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FAMILIES, HABITS, LIFE_FORMS, OPTIONS } from "@/lib/planthost/data";
import {
  FEATURE_GROUPS,
  filledGroups,
  setFeature,
  useIdentification,
  type Features,
} from "@/lib/planthost/store";

export const Route = createFileRoute("/identificacao/caracteristicas")({
  head: () => ({
    meta: [
      { title: "Características da planta — PlantHost AI" },
      { name: "description", content: "Formulário de características botânicas usadas pelo classificador." },
      { property: "og:title", content: "Características da planta — PlantHost AI" },
      { property: "og:description", content: "Folhas, flores, caule, tricomas, distribuição e época de ocorrência." },
    ],
  }),
  component: Caracteristicas,
});

const FIELD_LABELS: Record<keyof Features, string> = {
  familia: "Família",
  forma_vida: "Forma de vida",
  habito: "Hábito",
  folha_disposicao: "Disposição",
  folha_forma: "Forma",
  folha_margem: "Margem",
  folha_textura: "Textura",
  folha_filotaxia: "Filotaxia",
  flor_presenca: "Presença",
  flor_cor: "Cor",
  flor_simetria: "Simetria",
  flor_inflorescencia: "Inflorescência",
  caule_tipo: "Tipo",
  caule_textura: "Textura",
  caule_ramificacao: "Ramificação",
  tricomas: "Tricomas",
  distribuicao: "Região / localidade",
  epoca: "Período de ocorrência",
};

const FIELD_OPTIONS: Record<keyof Features, readonly string[]> = {
  familia: FAMILIES,
  forma_vida: LIFE_FORMS,
  habito: HABITS,
  folha_disposicao: OPTIONS.folha_disposicao,
  folha_forma: OPTIONS.folha_forma,
  folha_margem: OPTIONS.folha_margem,
  folha_textura: OPTIONS.folha_textura,
  folha_filotaxia: OPTIONS.folha_filotaxia,
  flor_presenca: OPTIONS.flor_presenca,
  flor_cor: OPTIONS.flor_cor,
  flor_simetria: OPTIONS.flor_simetria,
  flor_inflorescencia: OPTIONS.flor_inflorescencia,
  caule_tipo: OPTIONS.caule_tipo,
  caule_textura: OPTIONS.caule_textura,
  caule_ramificacao: OPTIONS.caule_ramificacao,
  tricomas: OPTIONS.tricomas,
  distribuicao: OPTIONS.distribuicao,
  epoca: OPTIONS.epoca,
};

function Caracteristicas() {
  const state = useIdentification();
  const navigate = useNavigate();
  const filled = filledGroups(state.features);

  return (
    <AppLayout
      step={3}
      backTo="/identificacao/nova"
      title="Características da planta"
      description="Selecione os atributos observados. Campos sem informação podem ser marcados como “Não informado”."
    >
      <Card className="mb-6 shadow-card">
        <CardContent className="flex flex-wrap items-center gap-4 p-5">
          <div className="min-w-48 flex-1">
            <p className="text-sm font-medium">Características preenchidas: {filled}/8</p>
            <Progress value={(filled / 8) * 100} className="mt-2" />
          </div>
          <Button
            variant="outline"
            onClick={() =>
              FEATURE_GROUPS.forEach((g) =>
                g.keys.forEach((k) => {
                  const opts = FIELD_OPTIONS[k];
                  if (!state.features[k] && opts[0]) setFeature(k, opts[0]);
                }),
              )
            }
          >
            Preencher exemplo de demonstração
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        {FEATURE_GROUPS.map((g) => (
          <Card key={g.id} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-primary">{g.id}</span>
                <h2 className="text-sm font-semibold uppercase tracking-wide">{g.label}</h2>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {g.keys.map((k) => (
                  <div key={k} className="space-y-1.5">
                    <Label>{FIELD_LABELS[k]}</Label>
                    <Select value={state.features[k] ?? ""} onValueChange={(v) => setFeature(k, v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {FIELD_OPTIONS[k].map((o) => (
                          <SelectItem key={o} value={o}>
                            {o}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" onClick={() => navigate({ to: "/identificacao/nova" })}>
          ← Voltar
        </Button>
        <Button disabled={filled === 0} onClick={() => navigate({ to: "/identificacao/processamento" })}>
          Analisar planta <ArrowRight className="size-4" />
        </Button>
      </div>
    </AppLayout>
  );
}
