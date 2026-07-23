import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { OnboardingWizard } from "@/components/OnboardingWizard";
import { WritersRoom } from "@/components/WritersRoom";
import type { DocType, DocumentRow, Project, ProjectBrief } from "@/lib/types";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();

  if (!project) {
    notFound();
  }

  const { data: briefRow } = await supabase
    .from("project_briefs")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const { data: documents } = await supabase
    .from("documents")
    .select("*")
    .eq("project_id", projectId)
    .order("version", { ascending: false });

  const typedProject = project as Project;
  const brief = (briefRow?.brief ?? null) as ProjectBrief | null;

  const latestDocuments: Partial<Record<DocType, string>> = {};
  for (const doc of (documents ?? []) as DocumentRow[]) {
    if (!latestDocuments[doc.doc_type]) {
      latestDocuments[doc.doc_type] = doc.content;
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">{typedProject.title}</h1>
        {typedProject.format && (
          <p className="text-sm text-[var(--muted)]">{typedProject.format}</p>
        )}
      </div>

      {typedProject.status === "onboarding" && (
        <OnboardingWizard projectId={projectId} />
      )}

      {typedProject.status !== "onboarding" && brief && (
        <>
          <details className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-sm">
            <summary className="cursor-pointer font-medium text-[var(--muted)]">
              Ver brief do projeto
            </summary>
            <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {Object.entries(brief).map(([key, value]) => (
                <div key={key}>
                  <dt className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    {key}
                  </dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </details>

          <WritersRoom
            projectId={projectId}
            status={typedProject.status}
            initialDocuments={latestDocuments}
          />
        </>
      )}
    </div>
  );
}
