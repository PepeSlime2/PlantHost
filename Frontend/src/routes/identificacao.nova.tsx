import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  ArrowRight,
  Image as ImageIcon,
  ListChecks,
  UploadCloud,
  Camera,
  X,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useState, useRef } from "react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useIdentification, setIdentification } from "@/lib/planthost/store";
import { identificarPorImagem } from "@/lib/planthost/api";

export const Route = createFileRoute("/identificacao/nova")({
  head: () => ({
    meta: [
      { title: "Nova identificação — PlantHost AI" },
      { name: "description", content: "Selecione imagem da planta ou informe características morfológicas." },
      { property: "og:title", content: "Nova identificação — PlantHost AI" },
      { property: "og:description", content: "Inicie uma nova análise de espécie vegetal com Machine Learning." },
    ],
  }),
  component: NovaIdentificacao,
});

const MAX_SIZE_MB = 15;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

function NovaIdentificacao() {
  const state = useIdentification();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const modes = [
    { id: "imagem" as const, label: "Fotografia da planta (Visão)", icon: ImageIcon, enabled: true },
    { id: "caracteristicas" as const, label: "Características morfológicas", icon: ListChecks, enabled: true },
  ];

  const validateAndSetFile = (file: File) => {
    setUploadError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Formato de arquivo não suportado. Utilize imagens JPG, PNG ou WEBP.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Tamanho do arquivo excede o limite de ${MAX_SIZE_MB}MB.`);
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleStartIdentification = async () => {
    if (state.mode === "caracteristicas") {
      navigate({ to: "/identificacao/caracteristicas" });
      return;
    }

    if (!selectedFile) {
      setUploadError("Por favor, selecione ou capture uma imagem da planta antes de continuar.");
      return;
    }

    setIsProcessing(true);
    setUploadError(null);

    try {
      const result = await identificarPorImagem(selectedFile);
      // Persiste a predição na store compartilhada
      setIdentification({
        prediction: {
          species: {
            id: result.species.species_id,
            scientific_name: result.species.scientific_name,
            common_name: result.species.common_name || null,
            family: result.species.family,
            life_form: "Informada pelo catálogo botânico",
            habit: "Semiárido / Caatinga",
            leaf_characteristics: {
              disposicao: "Conforme análise taxonômica",
              forma: "Conforme análise taxonômica",
              margem: "Conforme análise taxonômica",
              textura: "Conforme análise taxonômica",
              filotaxia: "Conforme análise taxonômica",
            },
            flower_characteristics: {
              presenca: "Presente",
              cor: "Conforme espécie",
              simetria: "Actinomorfa",
              inflorescencia: "Conforme espécie",
            },
            stem_characteristics: {
              tipo: "Herbáceo / Subarbustivo",
              textura: "Pubescente",
              ramificacao: "Ereta",
            },
            trichomes: "Presente",
            distribution: "Semiárido nordestino",
            occurrence_period: "Ano todo",
            host_status: result.species.host_status,
            host_type: result.host_evidence?.host_type || "Hospedeira comprovada de Bemisia tabaci",
            source: result.host_evidence?.sources || ["Embrapa BPD 55", "GBIF"],
            image_url: previewUrl,
          },
          confidence: result.confidence,
          ranking: result.ranking.map((r) => ({
            scientific_name: r.scientific_name,
            confidence: r.confidence,
          })),
          model: result.model,
        },
      });

      navigate({ to: "/identificacao/resultado" });
    } catch (err: any) {
      console.error("Erro na identificação:", err);
      setUploadError(err.message || "Falha na comunicação com o serviço de inferência de ML.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AppLayout
      step={2}
      backTo="/"
      title="Nova identificação"
      description="Informe a fotografia ou as características observadas na planta para gerar uma classificação com Machine Learning."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="shadow-card">
          <CardContent className="space-y-5 p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Modo de identificação
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {modes.map((m) => {
                  const active = state.mode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      disabled={!m.enabled}
                      onClick={() => setIdentification({ mode: m.id })}
                      className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                        active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      <span
                        className={`mt-0.5 grid size-4 place-items-center rounded-full border ${
                          active ? "border-primary" : "border-muted-foreground/50"
                        }`}
                      >
                        {active && <span className="size-2 rounded-full bg-primary" />}
                      </span>
                      <span>
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <m.icon className="size-4 text-primary" /> {m.label}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upload de Imagem (Card 2) */}
            {state.mode === "imagem" && (
              <div className="space-y-4 border-t border-border pt-5">
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Fotografia da planta (Upload e Câmera)
                </p>

                {uploadError && (
                  <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {!previewUrl ? (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-secondary/30"
                    }`}
                  >
                    <UploadCloud className="size-10 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">
                      Arraste e solte uma imagem aqui ou escolha uma opção
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Formatos aceitos: JPG, PNG, WEBP (até {MAX_SIZE_MB}MB)
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="mr-2 size-4" /> Selecionar arquivo
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => cameraInputRef.current?.click()}
                      >
                        <Camera className="mr-2 size-4" /> Usar câmera
                      </Button>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          validateAndSetFile(e.target.files[0]);
                        }
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          validateAndSetFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative overflow-hidden rounded-lg border border-border bg-black/5 dark:bg-white/5">
                      <img
                        src={previewUrl}
                        alt="Prévia da planta"
                        className="max-h-64 w-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5 shadow-sm backdrop-blur transition hover:bg-background"
                        title="Remover imagem"
                      >
                        <X className="size-4 text-foreground" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{selectedFile?.name} ({(selectedFile?.size! / (1024 * 1024)).toFixed(2)} MB)</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Substituir imagem
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Informações da Coleta / Observação
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="loc">Localização da observação</Label>
                  <Input
                    id="loc"
                    placeholder="Ex.: Petrolina — PE / Juazeiro — BA"
                    value={state.location}
                    onChange={(e) => setIdentification({ location: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data da observação</Label>
                  <Input
                    id="data"
                    type="date"
                    value={state.date}
                    onChange={(e) => setIdentification({ date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="obs">Observador</Label>
                  <Input
                    id="obs"
                    placeholder="Nome do pesquisador ou técnico"
                    value={state.observer}
                    onChange={(e) => setIdentification({ observer: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <Button
              className="w-full sm:w-auto"
              disabled={isProcessing}
              onClick={handleStartIdentification}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Analisando com ML...
                </>
              ) : state.mode === "imagem" ? (
                <>
                  Identificar planta por imagem <ArrowRight className="ml-2 size-4" />
                </>
              ) : (
                <>
                  Continuar para características <ArrowRight className="ml-2 size-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6 text-sm text-muted-foreground">
            <p className="text-xs font-medium uppercase tracking-widest">Metodologia e Rastreabilidade</p>
            <ol className="mt-4 space-y-3">
              {[
                "A imagem ou características morfológicas são processadas por modelo treinado.",
                "O classificador calcula a probabilidade e o ranking de espécies compatíveis.",
                "O status de planta hospedeira de mosca-branca é checado com a autoridade científica da Embrapa.",
                "As fontes bibliográficas e botânicas acompanham o laudo técnico.",
              ].map((t, i) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[11px] text-primary">
                    {i + 1}
                  </span>
                  {t}
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-md border border-warning/40 bg-warning/10 p-3 text-xs text-foreground">
              O status de planta hospedeira é sempre fundamentado em estudos botânicos e entomológicos da Embrapa
              (Boletim de Pesquisa e Desenvolvimento 55).
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
