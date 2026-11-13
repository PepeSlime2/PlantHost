import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  ListChecks,
  Image as ImageIcon,
  CheckCircle2,
  Paperclip,
} from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIdentification, setIdentification } from "@/lib/planthost/store";

export const Route = createFileRoute("/identificacao/nova")({
  head: () => ({
    meta: [
      { title: "Nova identificação — PlantHost AI" },
      { name: "description", content: "Informe local, data, observador e características morfológicas da planta." },
      { property: "og:title", content: "Nova identificação morfológica — PlantHost AI" },
      { property: "og:description", content: "Classificação botânica supervisionada com Machine Learning tabular." },
    ],
  }),
  component: NovaIdentificacao,
});

function NovaIdentificacao() {
  const state = useIdentification();
  const navigate = useNavigate();

  return (
    <AppLayout
      step={2}
      backTo="/"
      title="Nova Identificação Botânica"
      description="Informe os dados da coleta para alimentar o classificador de Machine Learning baseado em morfologia vegetal."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="shadow-card">
          <CardContent className="space-y-5 p-6">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Método de Inferência de IA
                </p>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                  Machine Learning Supervisionado
                </Badge>
              </div>

              <div className="mt-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
                    <ListChecks className="size-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      Classificação por Atributos Morfológicos
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Modelo Random Forest treinado com diagnoses taxonômicas (folha, caule, flor, hábito e família).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Dados da Coleta e Observação
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="loc">Localização / Bioma</Label>
                  <Input
                    id="loc"
                    placeholder="Ex.: Petrolina — PE / Vale do São Francisco"
                    value={state.location}
                    onChange={(e) => setIdentification({ location: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data da Observação</Label>
                  <Input
                    id="data"
                    type="date"
                    value={state.date}
                    onChange={(e) => setIdentification({ date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="obs">Pesquisador / Observador</Label>
                  <Input
                    id="obs"
                    placeholder="Ex.: Pedro Silva (Técnico / Biólogo)"
                    value={state.observer}
                    onChange={(e) => setIdentification({ observer: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full sm:w-auto"
              onClick={() => navigate({ to: "/identificacao/caracteristicas" })}
            >
              Preencher Características Morfológicas <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="text-xs font-medium uppercase tracking-widest">Pipeline de Machine Learning</p>
            <ol className="mt-4 space-y-3">
              {[
                "As características morfológicas preenchidas formam o vetor de atributos tabulares.",
                "O classificador Random Forest (scikit-learn) processa a matriz e gera a probabilidade.",
                "O ranking das espécies mais prováveis é calculado e ordenado.",
                "O status botânico de hospedeira de mosca-branca é cruzado com a base científica da Embrapa.",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[11px] text-primary">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <div className="mt-5 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
              <span className="font-semibold text-primary">Classificação Rastreável:</span> Toda a inferência
              baseia-se em atributos botânicos concretos das 68 espécies catalogadas no Semiárido.
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
