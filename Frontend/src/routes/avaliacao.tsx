import { createFileRoute } from "@tanstack/react-router";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  AlertCircle,
  FileCheck2,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchEspecies, validarEspecie, type EspecieApi } from "@/lib/planthost/api";

export const Route = createFileRoute("/avaliacao")({
  head: () => ({
    meta: [
      { title: "Validação por Especialistas — PlantHost AI" },
      { name: "description", content: "Módulo de validação técnica botânica e parecer de especialistas." },
      { property: "og:title", content: "Validação por Especialistas — PlantHost AI" },
      { property: "og:description", content: "Auditoria e homologação botânica de plantas hospedeiras." },
    ],
  }),
  component: ValidacaoEspecialistas,
});

function ValidacaoEspecialistas() {
  const [especies, setEspecies] = useState<EspecieApi[]>([]);
  const [selectedEspecie, setSelectedEspecie] = useState<EspecieApi | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulário do parecer
  const [especialistaNome, setEspecialistaNome] = useState("");
  const [especialistaEmail, setEspecialistaEmail] = useState("");
  const [decisao, setDecisao] = useState<"aprovado" | "rejeitado" | "necessita_revisao">("aprovado");
  const [observacoes, setObservacoes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const carregarEspecies = () => {
    setLoading(true);
    fetchEspecies({ per_page: 50 })
      .then((res) => {
        setEspecies(res.items);
        if (res.items.length > 0 && !selectedEspecie) {
          setSelectedEspecie(res.items[0]);
        }
      })
      .catch((err) => {
        console.warn("Falha ao carregar espécies:", err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarEspecies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEspecie) return;

    if (!especialistaNome.trim()) {
      setFeedback({ type: "error", text: "Informe o nome do especialista responsável pela validação." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await validarEspecie(selectedEspecie.id, {
        especialista_nome: especialistaNome.trim(),
        especialista_email: especialistaEmail.trim() || undefined,
        decisao,
        observacoes: observacoes.trim() || undefined,
      });

      setFeedback({
        type: "success",
        text: `Parecer para ${selectedEspecie.scientific_name} registrado com sucesso no backend como "${decisao}".`,
      });

      // Atualiza a espécie local
      setSelectedEspecie({ ...selectedEspecie, validation_status: decisao });
      carregarEspecies();
      setObservacoes("");
    } catch (err: any) {
      console.error("Erro na validação:", err);
      setFeedback({
        type: "error",
        text: err.message || "Erro ao persistir validação no servidor.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout
      title="Validação por Especialistas"
      description="Homologação técnica de identificações botânicas e status de hospedeira por pesquisadores e curadores."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <Card className="shadow-card">
          <CardContent className="space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Parecer Técnico do Especialista
              </p>
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
                Auditoria Rastreável
              </Badge>
            </div>

            {feedback && (
              <div
                className={`flex items-center gap-2 rounded-md p-3 text-xs ${
                  feedback.type === "success"
                    ? "border border-emerald-500/30 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300"
                    : "border border-destructive/50 bg-destructive/10 text-destructive"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="size-4 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sp-select">Espécie a Validar</Label>
                <Select
                  value={selectedEspecie ? String(selectedEspecie.id) : ""}
                  onValueChange={(val) => {
                    const sp = especies.find((e) => String(e.id) === val);
                    if (sp) setSelectedEspecie(sp);
                  }}
                >
                  <SelectTrigger id="sp-select">
                    <SelectValue placeholder="Selecione uma espécie para auditoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {especies.map((sp) => (
                      <SelectItem key={sp.id} value={String(sp.id)}>
                        {sp.scientific_name} ({sp.common_name || "sem nome comum"}) — {sp.validation_status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="esp-nome">Nome do Especialista *</Label>
                  <Input
                    id="esp-nome"
                    placeholder="Ex.: Dra. Beatriz Carvalho"
                    value={especialistaNome}
                    onChange={(e) => setEspecialistaNome(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="esp-email">E-mail / Instituição</Label>
                  <Input
                    id="esp-email"
                    type="email"
                    placeholder="Ex.: especialista@embrapa.br"
                    value={especialistaEmail}
                    onChange={(e) => setEspecialistaEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="decisao">Decisão da Auditoria *</Label>
                <Select
                  value={decisao}
                  onValueChange={(val: any) => setDecisao(val)}
                >
                  <SelectTrigger id="decisao">
                    <SelectValue placeholder="Selecione a decisão" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aprovado">Aprovado (Confirmação botânica e taxonômica)</SelectItem>
                    <SelectItem value="rejeitado">Rejeitado (Incompatibilidade taxonômica)</SelectItem>
                    <SelectItem value="necessita_revisao">Necessita Revisão Complementar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="obs">Observações Científicas e Justificativa</Label>
                <Textarea
                  id="obs"
                  rows={4}
                  placeholder="Descreva detalhes de conformidade morfológica foliar, floral ou referências de herbário..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={submitting || !selectedEspecie} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Persistindo Parecer no Backend...
                  </>
                ) : (
                  <>
                    <FileCheck2 className="mr-2 size-4" /> Registrar Validação Técnica
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Detalhes da Espécie Selecionada */}
        <Card className="shadow-card">
          <CardContent className="space-y-4 p-6">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Espécie sob Auditoria
            </p>

            {selectedEspecie ? (
              <div className="space-y-3">
                <div>
                  <h3 className="font-display text-xl font-bold italic text-foreground">
                    {selectedEspecie.scientific_name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedEspecie.common_name ? `Nome popular: ${selectedEspecie.common_name}` : "Nome popular não registrado"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Família: {selectedEspecie.family}</Badge>
                  <Badge variant="secondary">Categoria: {selectedEspecie.category}</Badge>
                  <Badge
                    variant="outline"
                    className={
                      selectedEspecie.validation_status === "aprovado"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                        : selectedEspecie.validation_status === "rejeitado"
                        ? "border-destructive/40 bg-destructive/10 text-destructive"
                        : "border-amber-500/40 bg-amber-500/10 text-amber-600"
                    }
                  >
                    Status: {selectedEspecie.validation_status}
                  </Badge>
                </div>

                <div className="rounded-lg border border-border bg-secondary/30 p-3 text-xs space-y-1.5">
                  <p>
                    <span className="font-semibold">Hospedeira de Mosca-Branca:</span>{" "}
                    {selectedEspecie.host_status === "registrada" ? "Sim (Documentada)" : "Não"}
                  </p>
                  <p>
                    <span className="font-semibold">Tipo:</span> {selectedEspecie.host_type || "Padrão Embrapa"}
                  </p>
                  <p>
                    <span className="font-semibold">Hábito / Forma de vida:</span>{" "}
                    {selectedEspecie.habit || selectedEspecie.life_form || "Não informado"}
                  </p>
                  {selectedEspecie.distribution && (
                    <p>
                      <span className="font-semibold">Distribuição:</span> {selectedEspecie.distribution}
                    </p>
                  )}
                </div>

                {selectedEspecie.image_url && (
                  <div className="overflow-hidden rounded-lg border border-border">
                    <img
                      src={selectedEspecie.image_url}
                      alt={selectedEspecie.scientific_name}
                      className="h-44 w-full object-cover"
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Selecione uma espécie para carregar os metadados.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

