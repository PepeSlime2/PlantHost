import { useSyncExternalStore } from "react";
import { SPECIES, type Species, NAO_INFORMADO } from "./data";

export interface Features {
  familia: string;
  forma_vida: string;
  habito: string;
  folha_disposicao: string;
  folha_forma: string;
  folha_margem: string;
  folha_textura: string;
  folha_filotaxia: string;
  flor_presenca: string;
  flor_cor: string;
  flor_simetria: string;
  flor_inflorescencia: string;
  caule_tipo: string;
  caule_textura: string;
  caule_ramificacao: string;
  tricomas: string;
  distribuicao: string;
  epoca: string;
}

export interface Prediction {
  species: Species;
  confidence: number;
  ranking: { scientific_name: string; confidence: number }[];
  model: string;
}

export interface IdentificationState {
  mode: "caracteristicas" | "imagem";
  location: string;
  date: string;
  observer: string;
  features: Partial<Features>;
  model: string;
  prediction: Prediction | null;
}

const emptyState: IdentificationState = {
  mode: "caracteristicas",
  location: "",
  date: "",
  observer: "",
  features: {},
  model: "Random Forest",
  prediction: null,
};

const KEY = "planthost.identification";

let state: IdentificationState = emptyState;
const listeners = new Set<() => void>();

function hydrate() {
  if (typeof window === "undefined") return;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (raw) state = { ...emptyState, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
}
hydrate();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function getIdentification() {
  return state;
}

export function setIdentification(patch: Partial<IdentificationState>) {
  state = { ...state, ...patch };
  persist();
  listeners.forEach((l) => l());
}

export function setFeature(key: keyof Features, value: string) {
  setIdentification({ features: { ...state.features, [key]: value } });
}

export function resetIdentification() {
  state = { ...emptyState, features: {} };
  persist();
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useIdentification() {
  return useSyncExternalStore(subscribe, getIdentification, () => emptyState);
}

/** Grupos de características (8 blocos do formulário). */
export const FEATURE_GROUPS: { id: string; label: string; keys: (keyof Features)[] }[] = [
  { id: "01", label: "Classificação", keys: ["familia"] },
  { id: "02", label: "Planta", keys: ["forma_vida", "habito"] },
  {
    id: "03",
    label: "Folhas",
    keys: ["folha_disposicao", "folha_forma", "folha_margem", "folha_textura", "folha_filotaxia"],
  },
  { id: "04", label: "Flores", keys: ["flor_presenca", "flor_cor", "flor_simetria", "flor_inflorescencia"] },
  { id: "05", label: "Caule", keys: ["caule_tipo", "caule_textura", "caule_ramificacao"] },
  { id: "06", label: "Tricomas", keys: ["tricomas"] },
  { id: "07", label: "Distribuição", keys: ["distribuicao"] },
  { id: "08", label: "Época", keys: ["epoca"] },
];

export function filledGroups(features: Partial<Features>) {
  return FEATURE_GROUPS.filter((g) => g.keys.some((k) => features[k])).length;
}

function speciesValue(sp: Species, key: keyof Features): string {
  switch (key) {
    case "familia":
      return sp.family;
    case "forma_vida":
      return sp.life_form;
    case "habito":
      return sp.habit;
    case "folha_disposicao":
      return sp.leaf_characteristics.disposicao;
    case "folha_forma":
      return sp.leaf_characteristics.forma;
    case "folha_margem":
      return sp.leaf_characteristics.margem;
    case "folha_textura":
      return sp.leaf_characteristics.textura;
    case "folha_filotaxia":
      return sp.leaf_characteristics.filotaxia;
    case "flor_presenca":
      return sp.flower_characteristics.presenca;
    case "flor_cor":
      return sp.flower_characteristics.cor;
    case "flor_simetria":
      return sp.flower_characteristics.simetria;
    case "flor_inflorescencia":
      return sp.flower_characteristics.inflorescencia;
    case "caule_tipo":
      return sp.stem_characteristics.tipo;
    case "caule_textura":
      return sp.stem_characteristics.textura;
    case "caule_ramificacao":
      return sp.stem_characteristics.ramificacao;
    case "tricomas":
      return sp.trichomes;
    case "distribuicao":
      return sp.distribution;
    case "epoca":
      return sp.occurrence_period;
    default:
      return NAO_INFORMADO;
  }
}

const ALL_KEYS = FEATURE_GROUPS.flatMap((g) => g.keys);

/**
 * Classificador de demonstração (baseado em similaridade de atributos).
 * Substituível por um modelo real de ML via server function — a interface de
 * saída (espécie provável + confiança + ranking) já é a esperada pelo sistema.
 */
export function classify(features: Partial<Features>, model: string): Prediction | null {
  const informed = ALL_KEYS.filter((k) => features[k] && features[k] !== NAO_INFORMADO);
  if (informed.length === 0) return null;

  const scored = SPECIES.map((sp) => {
    const hits = informed.filter((k) => speciesValue(sp, k) === features[k]).length;
    return { sp, score: hits / informed.length };
  }).sort((a, b) => b.score - a.score);

  const total = scored.reduce((s, x) => s + x.score, 0) || 1;
  const ranking = scored
    .filter((x) => x.score > 0)
    .slice(0, 3)
    .map((x) => ({
      scientific_name: x.sp.scientific_name,
      confidence: Math.round((x.score / total) * 1000) / 10,
    }));

  const top = ranking[0];
  const best = scored[0];
  if (!top || !best) return null;

  return {
    species: best.sp,
    confidence: top.confidence,
    ranking,
    model,
  };
}
