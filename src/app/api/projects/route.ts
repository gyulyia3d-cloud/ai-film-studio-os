import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({ user_id: user.id, title: "Novo projeto", status: "onboarding" })
    .select()
    .single();

  if (projectError || !project) {
    return NextResponse.json(
      { error: projectError?.message ?? "Falha ao criar projeto" },
      { status: 500 }
    );
  }

  const { error: briefError } = await supabase
    .from("project_briefs")
    .insert({ project_id: project.id, conversation: [], brief: null });

  if (briefError) {
    return NextResponse.json({ error: briefError.message }, { status: 500 });
  }

  return NextResponse.json({ id: project.id });
}
