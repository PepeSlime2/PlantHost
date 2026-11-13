/**
 * Base de referência do MVP (DEMONSTRAÇÃO).
 *
 * Os nomes científicos, famílias e formas de vida são taxonomicamente válidos,
 * porém o conjunto abaixo é um recorte reduzido usado apenas para demonstrar o
 * fluxo do sistema. Nenhuma métrica de Machine Learning é inventada: os campos
 * de avaliação permanecem vazios até que modelos reais sejam executados.
 */

export const NAO_INFORMADO = "Não informado";

export type HostStatus = "registrada" | "sem_registro" | "indisponivel";

export interface Species {
  id: string;
  scientific_name: string;
  common_name: string | null;
  family: string;
  life_form: string;
  habit: string;
  leaf_characteristics: {
    disposicao: string;
    forma: string;
    margem: string;
    textura: string;
    filotaxia: string;
  };
  flower_characteristics: {
    presenca: string;
    cor: string;
    simetria: string;
    inflorescencia: string;
  };
  stem_characteristics: {
    tipo: string;
    textura: string;
    ramificacao: string;
  };
  trichomes: string;
  distribution: string;
  occurrence_period: string;
  host_status: HostStatus;
  host_type: string | null;
  source: string[];
  image_url: string | null;
}

export const SPECIES: Species[] = [
  {
    id: "sp-01",
    scientific_name: "Sida cordifolia L.",
    common_name: "malva-branca",
    family: "Malvaceae",
    life_form: "Arbustiva",
    habit: "Ruderal / terrícola",
    leaf_characteristics: {
      disposicao: "Alterna",
      forma: "Cordiforme",
      margem: "Serreada",
      textura: "Aveludada",
      filotaxia: "Espiralada",
    },
    flower_characteristics: {
      presenca: "Presente",
      cor: "Amarela",
      simetria: "Actinomorfa",
      inflorescencia: "Solitária axilar",
    },
    stem_characteristics: {
      tipo: "Herbáceo-lenhoso",
      textura: "Pubescente",
      ramificacao: "Ramificado",
    },
    trichomes: "Presente — estrelado",
    distribution: "Caatinga (PE, PB, BA, CE)",
    occurrence_period: "Estação chuvosa e início da seca",
    host_status: "registrada",
    host_type: "Silvestre",
    source: ["Embrapa", "Flora e Funga do Brasil"],
    image_url: "https://inaturalist-open-data.s3.amazonaws.com/photos/607799915/original.jpg",
  },
  {
    id: "sp-02",
    scientific_name: "Herissantia crispa (L.) Brizicky",
    common_name: "mela-bode",
    family: "Malvaceae",
    life_form: "Herbácea",
    habit: "Ruderal / terrícola",
    leaf_characteristics: {
      disposicao: "Alterna",
      forma: "Cordiforme",
      margem: "Crenada",
      textura: "Membranácea",
      filotaxia: "Espiralada",
    },
    flower_characteristics: {
      presenca: "Presente",
      cor: "Branca a creme",
      simetria: "Actinomorfa",
      inflorescencia: "Solitária axilar",
    },
    stem_characteristics: {
      tipo: "Herbáceo",
      textura: "Pilosa",
      ramificacao: "Ramificado",
    },
    trichomes: "Presente — simples",
    distribution: "Semiárido do Nordeste",
    occurrence_period: "Estação chuvosa",
    host_status: "registrada",
    host_type: "Silvestre",
    source: ["Embrapa", "Reflora"],
    image_url: null,
  },
  {
    id: "sp-03",
    scientific_name: "Merremia aegyptia (L.) Urb.",
    common_name: "corda-de-viola",
    family: "Convolvulaceae",
    life_form: "Trepadeira",
    habit: "Volúvel",
    leaf_characteristics: {
      disposicao: "Alterna",
      forma: "Palmatilobada",
      margem: "Inteira",
      textura: "Membranácea",
      filotaxia: "Espiralada",
    },
    flower_characteristics: {
      presenca: "Presente",
      cor: "Branca",
      simetria: "Actinomorfa",
      inflorescencia: "Cimeira",
    },
    stem_characteristics: {
      tipo: "Herbáceo",
      textura: "Hirsuta",
      ramificacao: "Ramificado",
    },
    distribution: "Caatinga e áreas agrícolas do Nordeste",
    occurrence_period: "Estação chuvosa",
    trichomes: "Presente — hirsuto",
    host_status: "registrada",
    host_type: "Silvestre",
    source: ["Embrapa", "Flora e Funga do Brasil"],
    image_url: "https://inaturalist-open-data.s3.amazonaws.com/photos/607799915/original.jpg",
  },
  {
    id: "sp-04",
    scientific_name: "Cleome affinis DC.",
    common_name: "mussambê",
    family: "Cleomaceae",
    life_form: "Herbácea",
    habit: "Ruderal / terrícola",
    leaf_characteristics: {
      disposicao: "Alterna",
      forma: "Composta digitada",
      margem: "Inteira",
      textura: "Membranácea",
      filotaxia: "Espiralada",
    },
    flower_characteristics: {
      presenca: "Presente",
      cor: "Rosa a lilás",
      simetria: "Zigomorfa",
      inflorescencia: "Racemo",
    },
    stem_characteristics: {
      tipo: "Herbáceo",
      textura: "Glabra",
      ramificacao: "Pouco ramificado",
    },
    trichomes: "Ausente",
    distribution: "Semiárido do Nordeste",
    occurrence_period: "Estação chuvosa",
    host_status: "registrada",
    host_type: "Silvestre",
    source: ["Embrapa"],
    image_url: null,
  },
  {
    id: "sp-05",
    scientific_name: "Croton blanchetianus Baill.",
    common_name: "marmeleiro",
    family: "Euphorbiaceae",
    life_form: "Arbustiva",
    habit: "Arbustivo lenhoso",
    leaf_characteristics: {
      disposicao: "Alterna",
      forma: "Ovada",
      margem: "Inteira",
      textura: "Coriácea",
      filotaxia: "Espiralada",
    },
    flower_characteristics: {
      presenca: "Presente",
      cor: "Branca",
      simetria: "Actinomorfa",
      inflorescencia: "Racemo",
    },
    stem_characteristics: {
      tipo: "Lenhoso",
      textura: "Escamosa",
      ramificacao: "Muito ramificado",
    },
    trichomes: "Presente — estrelado",
    distribution: "Caatinga (amplamente distribuída)",
    occurrence_period: "Estação chuvosa",
    host_status: "sem_registro",
    host_type: null,
    source: ["Flora e Funga do Brasil"],
    image_url: null,
  },
  {
    id: "sp-06",
    scientific_name: "Ipomoea bahiensis Willd. ex Roem. & Schult.",
    common_name: NAO_INFORMADO,
    family: "Convolvulaceae",
    life_form: "Trepadeira",
    habit: "Volúvel",
    leaf_characteristics: {
      disposicao: "Alterna",
      forma: "Cordiforme",
      margem: "Inteira",
      textura: "Membranácea",
      filotaxia: "Espiralada",
    },
    flower_characteristics: {
      presenca: "Presente",
      cor: "Lilás",
      simetria: "Actinomorfa",
      inflorescencia: "Cimeira",
    },
    stem_characteristics: {
      tipo: "Herbáceo",
      textura: "Glabra",
      ramificacao: "Ramificado",
    },
    trichomes: "Ausente",
    distribution: "Nordeste do Brasil",
    occurrence_period: NAO_INFORMADO,
    host_status: "indisponivel",
    host_type: null,
    source: ["Flora e Funga do Brasil"],
    image_url: null,
  },
];

export const FAMILIES = [
  "Malvaceae",
  "Convolvulaceae",
  "Cleomaceae",
  "Euphorbiaceae",
  "Fabaceae",
  "Solanaceae",
  "Asteraceae",
  NAO_INFORMADO,
];

export const LIFE_FORMS = ["Herbácea", "Arbustiva", "Arbórea", "Trepadeira", "Outra"];
export const HABITS = ["Ruderal / terrícola", "Volúvel", "Arbustivo lenhoso", "Rupícola", NAO_INFORMADO];

export const OPTIONS = {
  folha_disposicao: ["Alterna", "Oposta", "Verticilada", NAO_INFORMADO],
  folha_forma: ["Cordiforme", "Ovada", "Lanceolada", "Palmatilobada", "Composta digitada", NAO_INFORMADO],
  folha_margem: ["Inteira", "Serreada", "Crenada", "Denteada", NAO_INFORMADO],
  folha_textura: ["Membranácea", "Coriácea", "Aveludada", NAO_INFORMADO],
  folha_filotaxia: ["Espiralada", "Dística", NAO_INFORMADO],
  flor_presenca: ["Presente", "Ausente", NAO_INFORMADO],
  flor_cor: ["Amarela", "Branca", "Branca a creme", "Rosa a lilás", "Lilás", NAO_INFORMADO],
  flor_simetria: ["Actinomorfa", "Zigomorfa", NAO_INFORMADO],
  flor_inflorescencia: ["Solitária axilar", "Racemo", "Cimeira", "Capítulo", NAO_INFORMADO],
  caule_tipo: ["Herbáceo", "Herbáceo-lenhoso", "Lenhoso", NAO_INFORMADO],
  caule_textura: ["Glabra", "Pilosa", "Pubescente", "Hirsuta", "Escamosa", NAO_INFORMADO],
  caule_ramificacao: ["Ramificado", "Muito ramificado", "Pouco ramificado", NAO_INFORMADO],
  tricomas: ["Ausente", "Presente — simples", "Presente — estrelado", "Presente — hirsuto", NAO_INFORMADO],
  distribuicao: [
    "Caatinga (PE, PB, BA, CE)",
    "Semiárido do Nordeste",
    "Caatinga e áreas agrícolas do Nordeste",
    "Caatinga (amplamente distribuída)",
    "Nordeste do Brasil",
    NAO_INFORMADO,
  ],
  epoca: ["Estação chuvosa", "Estação chuvosa e início da seca", "Estação seca", "Todo o ano", NAO_INFORMADO],
} as const;

export const MODELS = ["Decision Tree", "Random Forest", "SVM", "KNN"] as const;

export interface ModelEvaluation {
  model_name: string;
  accuracy: number | null;
  precision: number | null;
  recall: number | null;
  f1_score: number | null;
  confusion_matrix: number[][] | null;
}

/** Nenhuma métrica foi executada com dados reais — permanecem nulas. */
export const MODEL_EVALUATIONS: ModelEvaluation[] = MODELS.map((m) => ({
  model_name: m,
  accuracy: null,
  precision: null,
  recall: null,
  f1_score: null,
  confusion_matrix: null,
}));

export const DATASET_STATS = {
  hospedeiras: 68,
  silvestres: 48,
  cultivadas: 20,
  modelos: 4,
};
