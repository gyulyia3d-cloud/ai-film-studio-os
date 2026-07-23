import { createClient } from "@/lib/supabase/server";
import { DOC_LABELS, DOC_ORDER, type DocType, type DocumentRow } from "@/lib/types";

export async function GET(
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

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false });

  if (!project || !documents) {
    return new Response("Projeto não encontrado", { status: 404 });
  }

  const latestByType = new Map<DocType, DocumentRow>();
  for (const doc of documents as DocumentRow[]) {
    if (!latestByType.has(doc.doc_type)) {
      latestByType.set(doc.doc_type, doc);
    }
  }

  const sections = DOC_ORDER.filter((type) => latestByType.has(type)).map((type) => {
    const doc = latestByType.get(type)!;
    return `## ${DOC_LABELS[type]}\n\n${doc.content}`;
  });

  const markdown = `# ${project.title}\n\n_Gerado pelo AI Film Studio OS_\n\n${sections.join(
    "\n\n"
  )}\n`;

  const fileName = `${project.title.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "projeto"}.md`;

  return new Response(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
