import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  Bell,
  Brain,
  CheckCircle2,
  Filter,
  Flame,
  Info,
  Loader2,
  MapPin,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchAlertas, type AlertaApi } from "@/lib/planthost/api";

export const Route = createFileRoute("/modelos")({
  head: () => ({
    meta: [
      { title: "Painel de Alertas e Modelos — PlantHost AI" },
      {
        name: "description",
        content: "Monitoramento de focos de mosca-branca em plantas hospedeiras e status dos modelos de ML.",
      },
      { property: "og:title", content: "Painel de Alertas e Modelos — PlantHost AI" },
      { property: "og:description", content: "Alertas fitossanitários e prontidão dos classificadores de ML." },
    ],
  }),
  component: PainelAlertasModelos,
});

const CRITICIDADE_BADGE = {
  alta: {
    label: "Criticidade Alta",
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    icon: Flame,
  },
  media: {
    label: "Criticidade Média",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-600",
    icon: AlertTriangle,
  },
  baixa: {
    label: "Criticidade Baixa",
    className: "border-blue-500/40 bg-blue-500/10 text-blue-600",
    icon: Info,
  },
};

function PainelAlertasModelos() {
  const [alertas, setAlertas] = useState<AlertaApi[]>([]);
  const [criticidadeFiltro, setCriticidadeFiltro] = useState<string>("todas");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const carregarAlertas = () => {
    setLoading(true);
    setErrorMsg(null);
    const params: Record<string, string> = {};
    if (criticidadeFiltro !== "todas") params.criticidade = criticidadeFiltro;

    fetchAlertas(params)
      .then(setAlertas)
      .catch((err) => {
        console.warn("Falha ao carregar alertas:", err);
        setErrorMsg("Não foi possível conectar ao motor de alertas do backend.");
        // Fallback resiliente
        setAlertas([
          {
            id: 1,
            especie_id: 1,
            regiao: "Vale do São Francisco (Petrolina/PE - Juazeiro/BA)",
            criticidade: "alta",
            mensagem: "Foco elevado de mosca-branca associado à proliferação de Piptadenia obliqua nas margens de áreas irrigadas.",
            status: "ativo",
            data_ocorrencia: new Date().toISOString(),
          },
          {
            id: 2,
            especie_id: 4,
            regiao: "Submédio São Francisco",
            criticidade: "media",
            mensagem: "Detecção de Canapu (Physalis angulata) atuando como reservatório silvestre do vírus.",
            status: "ativo",
            data_ocorrencia: new Date().toISOString(),
          },
        ]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarAlertas();
  }, [criticidadeFiltro]);

  return (
    <AppLayout
      title="Painel de Alertas Fitossanitários"
      description="Monitoramento regional de plantas hospedeiras e focos potenciais de mosca-branca (Bemisia tabaci)."
    >
      {errorMsg && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={carregarAlertas} className="h-7 text-xs">
            <RefreshCw className="mr-1 size-3" /> Tentar novamente
          </Button>
        </div>
      )}

      {/* Filtro de Alertas (Card 7) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="size-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Alertas Ativos de Campo</h2>
          <Badge variant="outline" className="ml-2 font-mono text-xs">
            {alertas.length} registros
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Select value={criticidadeFiltro} onValueChange={setCriticidadeFiltro}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Criticidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas Criticidades</SelectItem>
              <SelectItem value="alta">Alta Criticidade</SelectItem>
              <SelectItem value="media">Média Criticidade</SelectItem>
              <SelectItem value="baixa">Baixa Criticidade</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={carregarAlertas}>
            <RefreshCw className="mr-1.5 size-3.5" /> Atualizar
          </Button>
        </div>
      </div>

      {/* Lista de Alertas */}
      {loading ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Consultando motor de alertas...</span>
          </div>
        </div>
      ) : alertas.length === 0 ? (
        <Card className="shadow-card">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <CheckCircle2 className="size-10 text-emerald-500" />
            <p className="mt-3 font-semibold">Nenhum alerta fitossanitário registrado</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Não há focos críticos informados para os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alertas.map((alerta) => {
            const config = CRITICIDADE_BADGE[alerta.criticidade] || CRITICIDADE_BADGE.baixa;
            const Icon = config.icon;
            const formattedDate = new Date(alerta.data_ocorrencia).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

            return (
              <Card key={alerta.id} className="shadow-card flex flex-col justify-between overflow-hidden">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className={config.className}>
                      <Icon className="mr-1 size-3" /> {config.label}
                    </Badge>
                    <span className="font-mono text-[11px] text-muted-foreground">{formattedDate}</span>
                  </div>

                  <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
                    <span className="font-medium text-foreground">{alerta.regiao}</span>
                  </div>

                  <p className="text-xs leading-relaxed text-muted-foreground">{alerta.mensagem}</p>

                  {alerta.especie && (
                    <div className="rounded-md border border-border bg-secondary/30 p-2 text-[11px]">
                      <span className="font-semibold text-foreground">Espécie Associada: </span>
                      <span className="italic">{alerta.especie.scientific_name}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modelos de ML Integrados */}
      <div className="mt-10 border-t border-border pt-8">
        <div className="flex items-center gap-2">
          <Brain className="size-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Modelos de Machine Learning</h2>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card className="shadow-card">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">Random Forest / Multi-trait Classifier</p>
                <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px]">
                  v1.2.0 Em Produção
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Classificador morfológico ponderado que avalia família botânica, hábito de crescimento, características de folhas, flores e bioma.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-5 space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">PlantHost-Vision (MobileNetV3-Plant)</p>
                <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-600 text-[10px]">
                  v1.1.0 Ativo
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Pipeline de visão computacional calibrado sobre as classes botânicas do catálogo GBIF e flora do semiárido brasileiro.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

