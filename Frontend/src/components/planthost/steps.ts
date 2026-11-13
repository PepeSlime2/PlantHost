export interface Step {
  n: number;
  label: string;
  short: string;
  to: string;
}

export const STEPS: Step[] = [
  { n: 1, label: "Início", short: "Início", to: "/" },
  { n: 2, label: "Nova identificação", short: "Identificação", to: "/identificacao/nova" },
  { n: 3, label: "Características", short: "Características", to: "/identificacao/caracteristicas" },
  { n: 4, label: "Processamento ML", short: "Processamento", to: "/identificacao/processamento" },
  { n: 5, label: "Resultado", short: "Resultado", to: "/identificacao/resultado" },
  { n: 6, label: "Hospedeiro", short: "Hospedeiro", to: "/identificacao/hospedeiro" },
  { n: 7, label: "Evidências", short: "Evidências", to: "/identificacao/evidencias" },
  { n: 8, label: "Avaliação dos modelos", short: "Avaliação", to: "/avaliacao" },
];
