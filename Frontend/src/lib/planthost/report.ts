/**
 * Relatório de identificação — gera um documento HTML independente pronto para
 * "Salvar como PDF" pelo navegador (impressão). Nenhum dado é inventado: o
 * relatório reflete exatamente o que foi informado na sessão.
 */
import { NAO_INFORMADO, type HostStatus } from "./data";
import { FEATURE_GROUPS, type Features, getIdentification, type IdentificationState } from "./store";

export const LABELS: Record<keyof Features, string> = {
  familia: "Família",
  forma_vida: "Forma de vida",
  habito: "Hábito",
  folha_disposicao: "Folha · Disposição",
  folha_forma: "Folha · Forma",
  folha_margem: "Folha · Margem",
  folha_textura: "Folha · Textura",
  folha_filotaxia: "Folha · Filotaxia",
  flor_presenca: "Flor · Presença",
  flor_cor: "Flor · Cor",
  flor_simetria: "Flor · Simetria",
  flor_inflorescencia: "Flor · Inflorescência",
  caule_tipo: "Caule · Tipo",
  caule_textura: "Caule · Textura",
  caule_ramificacao: "Caule · Ramificação",
  tricomas: "Tricomas",
  distribuicao: "Distribuição",
  epoca: "Época de ocorrência",
};

export const HOST_LABEL: Record<HostStatus, string> = {
  registrada: "Registrada como hospedeira",
  sem_registro: "Sem registro encontrado",
  indisponivel: "Informação não disponível",
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function featureRows(features: Partial<Features>): string {
  const rows = Object.entries(features)
    .filter(([, v]) => Boolean(v))
    .map(([k, v]) => {
      const key = k as keyof Features;
      const label = LABELS[key] ?? k;
      const value = v === NAO_INFORMADO ? `${esc(v)} <em>(não informado)</em>` : esc(v);
      return `<tr><th>${esc(label)}</th><td>${value}</td></tr>`;
    });
  return rows.length ? rows.join("") : `<tr><td colspan="2">Nenhuma característica informada.</td></tr>`;
}

function buildReportHtml(state: IdentificationState): string {
  const p = state.prediction;
  const sp = p?.species;
  const geradoEm = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });

  const basico = [
    { l: "Localização da observação", v: state.location },
    { l: "Data da observação", v: state.date },
    { l: "Observador", v: state.observer },
    { l: "Modo de identificação", v: state.mode === "imagem" ? "Imagem + características" : "Características botânicas" },
  ]
    .map((i) => `<tr><th>${esc(i.l)}</th><td>${i.v ? esc(i.v) : `${NAO_INFORMADO} <em>(não informado)</em>`}</td></tr>`)
    .join("");

  const ranking = p
    ? `<ol>${p.ranking.map((r) => `<li><span class="sp">${esc(r.scientific_name)}</span> — confiança ${r.confidence}%</li>`).join("")}</ol>`
    : "<p class='muted'>Nenhuma classificação executada nesta sessão.</p>";

  const hospedeiro = sp
    ? `<p><strong>Status:</strong> ${HOST_LABEL[sp.host_status]}</p>
       <p><strong>Tipo:</strong> ${sp.host_type ?? NAO_INFORMADO}</p>
       <p><strong>Fontes:</strong> ${sp.source.map(esc).join(", ")}</p>`
    : "";

  const resultado = p
    ? `<section>
        <h2>Resultado da identificação</h2>
        <p class="big"><em>${esc(p.species.scientific_name)}</em>${p.species.common_name ? ` — ${esc(p.species.common_name)}` : ""}</p>
        <p>Modelo: <strong>${esc(p.model)}</strong> · Confiança: <strong>${p.confidence}%</strong> <span class="muted">(classificador de demonstração)</span></p>
        <h3>Ranking de possibilidades</h3>
        ${ranking}
        ${hospedeiro ? `<h3>Registro como hospedeira</h3>${hospedeiro}` : ""}
      </section>`
    : `<section><h2>Resultado da identificação</h2><p class="muted">Nenhuma classificação executada nesta sessão.</p></section>`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Relatório de identificação — PlantHost AI</title>
<style>
  :root { color-scheme: light; }
  body { font-family: Georgia, "Times New Roman", serif; color: #1a241c; margin: 0; background: #f5f3ec; }
  .page { max-width: 760px; margin: 0 auto; padding: 40px 32px; background: #fff; min-height: 100vh; }
  header { border-bottom: 3px solid #1f5130; padding-bottom: 16px; margin-bottom: 24px; }
  header .brand { display: flex; align-items: center; gap: 10px; }
  header .mark { width: 34px; height: 34px; background: #1f5130; color: #fff; border-radius: 8px; display: grid; place-items: center; font-size: 18px; }
  header h1 { font-size: 20px; margin: 0; }
  header p { margin: 2px 0 0; font-size: 12px; color: #5a6a5e; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.08em; color: #1f5130; margin: 28px 0 10px; border-bottom: 1px solid #e4e0d2; padding-bottom: 6px; }
  h3 { font-size: 14px; margin: 18px 0 8px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { text-align: left; padding: 7px 10px; border-bottom: 1px solid #eee9dc; vertical-align: top; }
  th { width: 38%; color: #5a6a5e; font-weight: normal; }
  .big { font-size: 20px; margin: 6px 0; }
  .muted { color: #8a927f; font-size: 12px; }
  ol { padding-left: 22px; font-size: 14px; }
  .badge { display: inline-block; font-size: 11px; border: 1px solid #caa64b; background: #fdf6e3; color: #6a5417; padding: 3px 10px; border-radius: 999px; }
  footer { margin-top: 36px; border-top: 1px solid #e4e0d2; padding-top: 14px; font-size: 11px; color: #8a927f; }
  .actions { margin-bottom: 18px; text-align: right; }
  .actions button { font-family: inherit; background: #1f5130; color: #fff; border: 0; border-radius: 6px; padding: 9px 16px; font-size: 13px; cursor: pointer; }
  @media print { .actions { display: none; } body { background: #fff; } .page { padding: 0; max-width: none; } }
</style>
</head>
<body>
<div class="page">
  <div class="actions"><button onclick="window.print()">Salvar como PDF</button></div>
  <header>
    <div class="brand">
      <div class="mark">🌿</div>
      <div>
        <h1>PlantHost AI — Relatório de identificação</h1>
        <p>Identificação de plantas hospedeiras da mosca-branca no semiárido do Nordeste</p>
      </div>
    </div>
  </header>

  <p><span class="badge">Demonstração do MVP</span> <span class="muted">Gerado em ${esc(geradoEm)}</span></p>

  <section>
    <h2>Informações da observação</h2>
    <table>${basico}</table>
  </section>

  <section>
    <h2>Características informadas</h2>
    <table>${featureRows(state.features)}</table>
  </section>

  ${resultado}

  <footer>
    Ferramenta de apoio à identificação — o resultado não substitui determinação taxonômica.
    Confiança do modelo ≠ registro como hospedeira. Fontes de referência: Embrapa, Flora e Funga do Brasil e Reflora.
  </footer>
</div>
</body>
</html>`;
}

/** Abre o relatório em nova aba, com botão para salvar como PDF. */
export function exportIdentificationReport(): void {
  if (typeof window === "undefined") return;
  const html = buildReportHtml(getIdentification());
  const blob = new Blob(["\ufeff", html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener");
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
