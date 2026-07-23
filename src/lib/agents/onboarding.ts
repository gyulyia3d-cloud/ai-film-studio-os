import { askClaude } from "@/lib/anthropic";
import { ONBOARDING_SYSTEM } from "@/lib/agents/prompts";
import type { ChatMessage, ProjectBrief } from "@/lib/types";

type OnboardingTurnResult = {
  message: string;
  done: boolean;
  brief: ProjectBrief | null;
};

function extractJson(raw: string): unknown {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : trimmed;
  return JSON.parse(candidate);
}

export async function runOnboardingTurn(
  conversation: ChatMessage[]
): Promise<OnboardingTurnResult> {
  const seedMessages: ChatMessage[] =
    conversation.length > 0
      ? conversation
      : [{ role: "user", content: "Quero começar um novo projeto audiovisual." }];

  const raw = await askClaude({
    system: ONBOARDING_SYSTEM,
    messages: seedMessages,
    maxTokens: 1500,
  });

  try {
    const parsed = extractJson(raw) as OnboardingTurnResult;
    return {
      message: parsed.message ?? raw,
      done: Boolean(parsed.done),
      brief: parsed.brief ?? null,
    };
  } catch {
    // fallback defensivo: se o modelo não retornar JSON válido, trata como pergunta em aberto
    return { message: raw, done: false, brief: null };
  }
}
