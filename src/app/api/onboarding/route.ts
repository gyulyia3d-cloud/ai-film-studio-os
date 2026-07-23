import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ProjectBrief } from "@/lib/types";

export async function POST(request: Request) {
  const { projectId, brief } = (await request.json()) as {
    projectId: string;
    brief: ProjectBrief;
  };

  if (!projectId || !brief) {
    return NextResponse.json(
      { error: "projectId e brief são obrigatórios" },
      { status: 400 }
    );
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
    .select("id")
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

  const { error: updateError } = await supabase
    .from("project_briefs")
    .update({ brief, is_final: true })
    .eq("id", briefRow.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const { error: projectUpdateError } = await supabase
    .from("projects")
    .update({
      status: "brief_ready",
      title: brief.ideiaInicial?.slice(0, 80) || "Projeto sem título",
      format: brief.formato ?? null,
    })
    .eq("id", projectId);

  if (projectUpdateError) {
    return NextResponse.json({ error: projectUpdateError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
