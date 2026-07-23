import { askClaude } from "@/lib/anthropic";
import {
  DIRETOR_SYSTEM,
  ROTEIRISTA_SYSTEM,
  SCRIPT_DOCTOR_SYSTEM,
  PRODUTOR_SYSTEM,
} from "@/lib/agents/prompts";
import type { DocType, PipelineEvent, ProjectBrief } from "@/lib/types";
import { DOC_ORDER } from "@/lib/types";

const HEADING_TO_DOC_TYPE: Record<string, DocType> = {
  logline: "logline",
  sinopse: "sinopse",
  tratamento: "tratamento",
  "beat sheet": "beat_sheet",
  personagens: "personagens",
  roteiro: "roteiro",
};

function normalizeHeading(heading: string): string {
  return heading
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function parseSections(markdown: string): Partial<Record<DocType, string>> {
  const sections: Partial<Record<DocType, string>> = {};
  const parts = markdown.split(/^##\s+/m).slice(1); // primeira parte antes do primeiro "## " é descartada

  for (const part of parts) {
    const [headingLine, ...rest] = part.split("\n");
    const docType = HEADING_TO_DOC_TYPE[normalizeHeading(headingLine)];
    if (docType) {
      sections[docType] = rest.join("\n").trim();
    }
  }

  return sections;
}

function briefToPrompt(brief: ProjectBrief): string {
  return `Brief do projeto:
- Ideia inicial: ${brief.ideiaInicial}
- Objetivo: ${brief.objetivo}
- Público-alvo: ${brief.publicoAlvo}
- Formato: ${brief.formato}
- Orçamento: ${brief.orcamento}
- Prazo: ${brief.prazo}
- Idioma: ${brief.idioma}
- Referências visuais: ${brief.referenciasVisuais}
- Estilo narrativo: ${brief.estiloNarrativo}
- Recursos disponíveis: ${brief.recursosDisponiveis}
- Pipeline de produção: ${brief.pipelineProducao}`;
}

function summarize(text: string, max = 220): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? clean.slice(0, max) + "…" : clean;
}

export async function* runWritersRoom(
  brief: ProjectBrief
): AsyncGenerator<PipelineEvent> {
  const briefPrompt = briefToPrompt(brief);

  try {
    // Rodada 1 — Diretor define a visão criativa
    yield { type: "round_start", round: 1, role: "diretor" };
    const vision = await askClaude({
      system: DIRETOR_SYSTEM,
      messages: [{ role: "user", content: briefPrompt }],
      maxTokens: 1500,
    });
    yield { type: "round_done", round: 1, role: "diretor", summary: summarize(vision) };

    // Rodada 2 — Roteirista escreve o pacote narrativo completo
    yield { type: "round_start", round: 2, role: "roteirista" };
    const draft = await askClaude({
      system: ROTEIRISTA_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${briefPrompt}\n\nVisão criativa definida pelo Diretor:\n${vision}`,
        },
      ],
      maxTokens: 4096,
    });
    const draftSections = parseSections(draft);
    for (const docType of DOC_ORDER) {
      if (draftSections[docType]) {
        yield {
          type: "document",
          docType,
          content: draftSections[docType]!,
          producedBy: "roteirista",
        };
      }
    }
    yield {
      type: "round_done",
      round: 2,
      role: "roteirista",
      summary: summarize(draftSections.logline ?? draft),
    };

    // Rodada 3 — Script Doctor refina ritmo, subtexto e consistência
    yield { type: "round_start", round: 3, role: "script_doctor" };
    const revised = await askClaude({
      system: SCRIPT_DOCTOR_SYSTEM,
      messages: [{ role: "user", content: draft }],
      maxTokens: 4096,
    });
    const revisedSections = parseSections(revised);
    for (const docType of DOC_ORDER) {
      if (revisedSections[docType]) {
        yield {
          type: "document",
          docType,
          content: revisedSections[docType]!,
          producedBy: "script_doctor",
        };
      }
    }
    yield {
      type: "round_done",
      round: 3,
      role: "script_doctor",
      summary: summarize(revisedSections.logline ?? revised),
    };

    // Rodada 4 — Produtor Executivo ajusta viabilidade (orçamento, prazo, recursos)
    yield { type: "round_start", round: 4, role: "produtor_executivo" };
    const final = await askClaude({
      system: PRODUTOR_SYSTEM,
      messages: [
        {
          role: "user",
          content: `${briefPrompt}\n\nMaterial revisado pelo Script Doctor:\n${revised}`,
        },
      ],
      maxTokens: 4096,
    });
    const finalSections = parseSections(final);
    for (const docType of DOC_ORDER) {
      if (finalSections[docType]) {
        yield {
          type: "document",
          docType,
          content: finalSections[docType]!,
          producedBy: "produtor_executivo",
        };
      }
    }
    yield {
      type: "round_done",
      round: 4,
      role: "produtor_executivo",
      summary: summarize(finalSections.logline ?? final),
    };

    yield { type: "done" };
  } catch (error) {
    yield {
      type: "error",
      message: error instanceof Error ? error.message : "Erro desconhecido no pipeline",
    };
  }
}
