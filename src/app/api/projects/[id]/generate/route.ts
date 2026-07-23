import { createClient } from "@/lib/supabase/server";
import { runWritersRoom } from "@/lib/agents/pipeline";
import type { ProjectBrief } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: projectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Não autenticado", { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  const { data: briefRow } = await supabase
    .from("project_briefs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!project || !briefRow?.brief) {
    return new Response("Projeto ou brief não encontrado", { status: 404 });
  }

  const brief = briefRow.brief as ProjectBrief;

  await supabase.from("projects").update({ status: "generating" }).eq("id", projectId);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const versionByType: Record<string, number> = {};

      for await (const event of runWritersRoom(brief)) {
        if (event.type === "document") {
          const nextVersion = (versionByType[event.docType] ?? 0) + 1;
          versionByType[event.docType] = nextVersion;

          await supabase.from("documents").insert({
            project_id: projectId,
            doc_type: event.docType,
            content: event.content,
            version: nextVersion,
            produced_by: event.producedBy,
          });
        }

        if (event.type === "round_done") {
          await supabase.from("agent_runs").insert({
            project_id: projectId,
            role: event.role,
            round: event.round,
            summary: event.summary,
          });
        }

        if (event.type === "done") {
          await supabase
            .from("projects")
            .update({ status: "ready" })
            .eq("id", projectId);
        }

        if (event.type === "error") {
          await supabase
            .from("projects")
            .update({ status: "brief_ready" })
            .eq("id", projectId);
        }

        send(event);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
