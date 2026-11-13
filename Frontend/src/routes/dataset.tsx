import { createFileRoute } from "@tanstack/react-router";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Database,
  Sprout,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/planthost/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchEspecies, type EspecieApi } from "@/lib/planthost/api";
import { SPECIES as LOCAL_SPECIES } from "@/lib/planthost/data";

export const Route = createFileRoute("/dataset")({
  head: () => ({
    meta: [
      { title: "Acervo Botânico — PlantHost AI" },
      { name: "description", content: "Consulta de espécies catalogadas, características botânicas e status de hospedeira." },
      { property: "og:title", content: "Acervo Botânico — PlantHost AI" },
      { property: "og:description", content: "Espécies do semiárido, famílias e fontes de evidência Embrapa/Reflora." },
    ],
  }),
  component: Dataset,
});

const HOST_BADGE = {
  registrada: { label: "Hospedeira Confirmada", className: "border-primary/40 bg-primary/10 text-primary" },
  sem_registro: { label: "Sem Registro", className: "border-warning/50 bg-warning/15 text-foreground" },
  indisponivel: { label: "Indisponível", className: "border-muted text-muted-foreground" },
};

function Dataset() {
  const [especies, setEspecies] = useState<EspecieApi[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const perPage = 10;

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todas");
  const [hostFilter, setHostFilter] = useState("todos");

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const carregarDados = () => {
    setLoading(true);
    setErrorMsg(null);

    const params: Record<string, any> = {
      page,
      per_page: perPage,
    };
    if (searchTerm.trim()) params.q = searchTerm.trim();
    if (categoryFilter !== "todas") params.category = categoryFilter;
    if (hostFilter !== "todos") params.host_status = hostFilter;

    fetchEspecies(params)
      .then((data) => {
        setEspecies(data.items);
        setTotal(data.total);
        setTotalPages(data.total_pages);
      })
      .catch((err) => {
        console.warn("Backend indisponível, filtrando base local:", err);
        setErrorMsg("Operando com base local de contingência (Backend desconectado).");

        // Fallback local
        let filtradas = LOCAL_SPECIES.map((s, idx) => ({
          id: idx + 1,
          species_id: s.id,
          scientific_name: s.scientific_name,
          common_name: s.common_name,
          family: s.family,
          category: s.life_form.toLowerCase().includes("silvestre") ? "silvestre" : "cultivada",
          habit: s.habit,
          life_form: s.life_form,
          host_status: s.host_status,
          host_type: s.host_type,
          validation_status: "aprovado",
          fontes: s.source.map((src, i) => ({ id: i + 1, nome_fonte: src })),
        }));

        if (searchTerm.trim()) {
          const t = searchTerm.toLowerCase();
          filtradas = filtradas.filter(
            (sp) =>
              sp.scientific_name.toLowerCase().includes(t) ||
              (sp.common_name && sp.common_name.toLowerCase().includes(t)) ||
              sp.family.toLowerCase().includes(t)
          );
        }
        if (categoryFilter !== "todas") {
          filtradas = filtradas.filter((sp) => sp.category === categoryFilter);
        }
        if (hostFilter !== "todos") {
          filtradas = filtradas.filter((sp) => sp.host_status === hostFilter);
        }

        const start = (page - 1) * perPage;
        setTotal(filtradas.length);
        setTotalPages(Math.max(1, Math.ceil(filtradas.length / perPage)));
        setEspecies(filtradas.slice(start, start + perPage));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregarDados();
  }, [page, categoryFilter, hostFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    carregarDados();
  };

  return (
    <AppLayout
      title="Acervo Botânico"
      description="Consulta de espécies catalogadas no semiárido, categorias de cultivo e evidências botânicas de hospedeira."
    >
      {errorMsg && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={carregarDados} className="h-7 text-xs">
            <RefreshCw className="mr-1 size-3" /> Reconectar
          </Button>
        </div>
      )}

      {/* Barra de Filtros e Busca (Card 5) */}
      <Card className="mb-6 shadow-card">
        <CardContent className="p-4 sm:p-5">
          <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome científico, nome comum ou família..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
              <Select
                value={categoryFilter}
                onValueChange={(val) => {
                  setCategoryFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas Categorias</SelectItem>
                  <SelectItem value="silvestre">Silvestres</SelectItem>
                  <SelectItem value="cultivada">Cultivadas</SelectItem>
                  <SelectItem value="invasora">Invasoras</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={hostFilter}
                onValueChange={(val) => {
                  setHostFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Hospedeira" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="registrada">Hospedeiras</SelectItem>
                  <SelectItem value="sem_registro">Sem Registro</SelectItem>
                </SelectContent>
              </Select>

              <Button type="submit" size="sm">
                Buscar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabela de Espécies */}
      <Card className="shadow-card overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40">
                  <TableHead className="w-20">ID</TableHead>
                  <TableHead>Nome Científico</TableHead>
                  <TableHead>Nome Comum</TableHead>
                  <TableHead>Família</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status Hospedeira</TableHead>
                  <TableHead>Fontes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-5 animate-spin text-primary" />
                        <span>Carregando espécies da base botânica...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : especies.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <p className="font-medium text-foreground">Nenhuma espécie encontrada</p>
                        <p className="text-xs">Tente ajustar os filtros ou o termo de busca.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  especies.map((sp) => {
                    const badge = HOST_BADGE[sp.host_status] || HOST_BADGE.indisponivel;
                    return (
                      <TableRow key={sp.id} className="hover:bg-muted/30">
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {sp.species_id}
                        </TableCell>
                        <TableCell className="font-medium italic">
                          {sp.scientific_name}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sp.common_name || <span className="text-xs text-muted-foreground">Não informado</span>}
                        </TableCell>
                        <TableCell className="text-sm">{sp.family}</TableCell>
                        <TableCell>
                          <span className="capitalize text-xs font-medium text-foreground/80">
                            {sp.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={badge.className}>
                            {badge.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {sp.fontes && sp.fontes.length > 0 ? (
                            <span>{sp.fontes.map((f) => f.nome_fonte).join(", ")}</span>
                          ) : (
                            "Embrapa BPD 55"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex flex-wrap items-center justify-between border-t border-border px-4 py-3 sm:px-6">
            <p className="text-xs text-muted-foreground">
              Mostrando <span className="font-medium">{especies.length}</span> de{" "}
              <span className="font-medium">{total}</span> registros catalogados
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="size-4" /> Anterior
              </Button>
              <span className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Próxima <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
