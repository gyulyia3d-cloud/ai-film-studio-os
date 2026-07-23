export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ProjectBrief = {
  objetivo: string;
  publicoAlvo: string;
  formato: string;
  orcamento: string;
  prazo: string;
  idioma: string;
  referenciasVisuais: string;
  estiloNarrativo: string;
  recursosDisponiveis: string;
  pipelineProducao: string;
  ideiaInicial: string;
};

export type DocType =
  | "logline"
  | "sinopse"
  | "tratamento"
  | "beat_sheet"
  | "personagens"
  | "roteiro";

export const DOC_LABELS: Record<DocType, string> = {
  logline: "Logline",
  sinopse: "Sinopse",
  tratamento: "Tratamento",
  beat_sheet: "Beat Sheet",
  personagens: "Personagens",
  roteiro: "Roteiro (Outline)",
};

export const DOC_ORDER: DocType[] = [
  "logline",
  "sinopse",
  "tratamento",
  "beat_sheet",
  "personagens",
  "roteiro",
];

export type AgentRole =
  | "diretor"
  | "roteirista"
  | "script_doctor"
  | "produtor_executivo";

export const AGENT_LABELS: Record<AgentRole, string> = {
  diretor: "Diretor",
  roteirista: "Roteirista",
  script_doctor: "Script Doctor",
  produtor_executivo: "Produtor Executivo",
};

export type ProjectStatus = "onboarding" | "brief_ready" | "generating" | "ready";

export type Project = {
  id: string;
  user_id: string;
  title: string;
  format: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
};

export type DocumentRow = {
  id: string;
  project_id: string;
  doc_type: DocType;
  content: string;
  version: number;
  produced_by: AgentRole | null;
  created_at: string;
};

export type PipelineEvent =
  | { type: "round_start"; round: number; role: AgentRole }
  | { type: "round_done"; round: number; role: AgentRole; summary: string }
  | { type: "document"; docType: DocType; content: string; producedBy: AgentRole }
  | { type: "done" }
  | { type: "error"; message: string };
