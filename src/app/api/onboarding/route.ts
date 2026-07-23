import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runOnboardingTurn } from "@/lib/agents/onboarding";
import type { ChatMessage } from "@/lib/types";

export async function POST(request: Request) {
  const { projectId, message } = (await request.json()) as {
    projectId: string;
    message?: string;
  };

  if (!projectId) {
    return NextResponse.json({ error: "projectId é obrigatório" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: briefRow, error: briefFetchError } = await supabase
    .from("project_briefs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (briefFetchError || !briefRow) {
    return NextResponse.json(
      { error: briefFetchError?.message ?? "Brief não encontrado" },
      { status: 404 }
    );
  }

  const conversation: ChatMessage[] = briefRow.conversation ?? [];
  if (message) {
    conversation.push({ role: "user", content: message });
  }

  const result = await runOnboardingTurn(conversation);
  conversation.push({ role: "assistant", content: result.message });

  const { error: updateError } = await supabase
    .from("project_briefs")
    .update({
      conversation,
      brief: result.brief,
      is_final: result.done,
    })
    .eq("id", briefRow.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  if (result.done && result.brief) {
    await supabase
      .from("projects")
      .update({
        status: "brief_ready",
        title: result.brief.ideiaInicial?.slice(0, 80) || "Projeto sem título",
        format: result.brief.formato ?? null,
      })
      .eq("id", projectId);
  }

  return NextResponse.json(result);
}
