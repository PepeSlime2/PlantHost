/**
 * Cliente de Conexão com o Backend PlantHost AI (FastAPI).
 * Gerencia chamadas HTTP aos endpoints de ML, acervo botânico, alertas e validações.
 */

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || "http://localhost:8000/api";

export interface DashboardStats {
  total_especies: number;
  total_silvestres: number;
  total_cultivadas: number;
  total_hospedeiras: number;
  total_alertas_ativos: number;
  total_validacoes: number;
  modelos_disponiveis: string[];
}

export interface EspecieApi {
  id: number;
  species_id: string;
  scientific_name: string;
  scientific_name_original?: string;
  common_name?: string | null;
  family: string;
  category: string;
  habit?: string | null;
  life_form?: string | null;
  life_cycle?: string | null;
  distribution?: string | null;
  host_status: "registrada" | "sem_registro" | "indisponivel";
  host_type?: string | null;
  validation_status: string;
  image_url?: string | null;
  fontes?: { id: number; nome_fonte: string; url_fonte?: string }[];
}

export interface EspeciesPaginadas {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  items: EspecieApi[];
}

export interface IdentificacaoResponse {
  species: {
    species_id: string;
    scientific_name: string;
    common_name?: string | null;
    family: string;
    category: string;
    host_status: "registrada" | "sem_registro" | "indisponivel";
    confidence: number;
  };
  confidence: number;
  ranking: {
    species_id: string;
    scientific_name: string;
    common_name?: string | null;
    family: string;
    category: string;
    host_status: "registrada" | "sem_registro" | "indisponivel";
    confidence: number;
  }[];
  model: string;
  model_version: string;
  status: string;
  input_mode: string;
  host_evidence?: {
    is_host: boolean;
    host_status: string;
    host_type: string;
    sources: string[];
    validation_status: string;
  };
  image_metadata?: {
    filename: string;
    width: number;
    height: number;
    green_index: number;
  };
}

export interface AlertaApi {
  id: number;
  especie_id: number;
  regiao: string;
  criticidade: "alta" | "media" | "baixa";
  mensagem: string;
  status: string;
  data_ocorrencia: string;
  especie?: EspecieApi;
}

/**
 * Consulta indicadores consolidados do dashboard.
 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!res.ok) {
    throw new Error(`Erro ao obter estatísticas: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Consulta espécies com paginação, busca e filtros.
 */
export async function fetchEspecies(params?: {
  q?: string;
  category?: string;
  host_status?: string;
  validation_status?: string;
  page?: number;
  per_page?: number;
}): Promise<EspeciesPaginadas> {
  const query = new URLSearchParams();
  if (params?.q) query.append("q", params.q);
  if (params?.category) query.append("category", params.category);
  if (params?.host_status) query.append("host_status", params.host_status);
  if (params?.validation_status) query.append("validation_status", params.validation_status);
  if (params?.page) query.append("page", String(params.page));
  if (params?.per_page) query.append("per_page", String(params.per_page));

  const url = `${API_BASE_URL}/especies?${query.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ao buscar espécies: ${res.statusText}`);
  }
  return res.json();
}

/**
 * Envia imagem fotográfica para identificação pelo modelo de Visão Computacional.
 */
export async function identificarPorImagem(file: File): Promise<IdentificacaoResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/identificar/imagem`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || "Falha na identificação por imagem.");
  }
  return res.json();
}

/**
 * Envia características botânicas para identificação pelo modelo Multi-trait / Random Forest.
 */
export async function identificarPorCaracteristicas(
  features: Record<string, any>
): Promise<IdentificacaoResponse> {
  const res = await fetch(`${API_BASE_URL}/identificar/caracteristicas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(features),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || "Falha na identificação por características.");
  }
  return res.json();
}

/**
 * Registra validação de especialista botânico.
 */
export async function validarEspecie(
  especieId: number,
  dados: {
    especialista_nome: string;
    especialista_email?: string;
    decisao: "aprovado" | "rejeitado" | "necessita_revisao";
    observacoes?: string;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/especies/${especieId}/validar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Erro ao registrar validação.");
  }
  return res.json();
}

/**
 * Consulta alertas fitossanitários.
 */
export async function fetchAlertas(params?: {
  regiao?: string;
  criticidade?: string;
  status_alerta?: string;
}): Promise<AlertaApi[]> {
  const query = new URLSearchParams();
  if (params?.regiao) query.append("regiao", params.regiao);
  if (params?.criticidade) query.append("criticidade", params.criticidade);
  if (params?.status_alerta) query.append("status_alerta", params.status_alerta);

  const res = await fetch(`${API_BASE_URL}/alertas?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Erro ao buscar alertas: ${res.statusText}`);
  }
  return res.json();
}
